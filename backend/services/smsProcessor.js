/**
 * SMS Transaction Processing Service
 * Extracts and processes financial transaction data from SMS messages
 */

class SMSProcessor {
  constructor() {
    // Bank and UPI patterns for transaction detection
    this.bankPatterns = [
      // Indian Banks
      /(?:HDFC|ICICI|SBI|AXIS|KOTAK|PNB|BOB|CANARA|UNION|INDIAN)/i,
      // UPI Patterns
      /(?:UPI|BHIM|PAYTM|PHONEPE|GPAY|GOOGLEPAY|AMAZONPAY)/i,
      // Payment Keywords
      /(?:debited|credited|paid|received|transferred|transaction)/i
    ];

    // Transaction amount patterns
    this.amountPatterns = [
      /(?:rs\.?\s*|inr\s*|₹\s*)(\d+(?:,\d+)*(?:\.\d{2})?)/i,
      /(?:amount\s*:?\s*(?:rs\.?\s*|inr\s*|₹\s*)?(\d+(?:,\d+)*(?:\.\d{2})?))/i,
      /(\d+(?:,\d+)*(?:\.\d{2})?)\s*(?:rs\.?|inr|₹)/i
    ];

    // Merchant/Description patterns
    this.merchantPatterns = [
      /(?:at\s+|to\s+|from\s+)([A-Z][A-Z0-9\s&.-]{2,30})/i,
      /(?:merchant\s*:?\s*)([A-Z][A-Z0-9\s&.-]{2,30})/i,
      /UPI\/([A-Z0-9\s.-]{3,25})/i
    ];

    // Transaction type indicators
    this.debitIndicators = [
      /debited|paid|sent|transferred|purchase|withdrawn|debit/i
    ];
    
    this.creditIndicators = [
      /credited|received|deposited|refund|cashback|credit/i
    ];

    // Category classification patterns
    this.categoryPatterns = {
      'food': /(?:swiggy|zomato|dominos|mcdonald|kfc|pizza|restaurant|cafe|food|dining)/i,
      'transport': /(?:uber|ola|rapido|metro|bus|taxi|fuel|petrol|diesel|transport)/i,
      'shopping': /(?:amazon|flipkart|myntra|ajio|shopping|mall|store|retail)/i,
      'entertainment': /(?:netflix|prime|hotstar|spotify|bookmyshow|movie|cinema|entertainment)/i,
      'utilities': /(?:electricity|water|gas|internet|mobile|recharge|bill|utility)/i,
      'healthcare': /(?:hospital|clinic|pharmacy|medical|health|doctor|medicine)/i,
      'education': /(?:school|college|university|course|education|fees|tuition)/i,
      'investment': /(?:mutual|fund|sip|stock|share|investment|trading)/i,
      'insurance': /(?:insurance|policy|premium|lic|health|life)/i,
      'transfer': /(?:transfer|sent|family|friend|personal)/i
    };
  }

  /**
   * Check if SMS is a financial transaction
   */
  isFinancialSMS(message) {
    const text = message.toLowerCase();
    
    // Check for bank/UPI patterns
    const hasBankPattern = this.bankPatterns.some(pattern => pattern.test(text));
    
    // Check for amount patterns
    const hasAmount = this.amountPatterns.some(pattern => pattern.test(text));
    
    // Check for transaction keywords
    const hasTransactionKeyword = /(?:debited|credited|paid|received|transaction|upi|transfer)/i.test(text);
    
    return hasBankPattern && hasAmount && hasTransactionKeyword;
  }

  /**
   * Extract transaction amount from SMS
   */
  extractAmount(message) {
    for (const pattern of this.amountPatterns) {
      const match = message.match(pattern);
      if (match) {
        // Clean amount string and convert to number
        const amountStr = match[1].replace(/,/g, '');
        const amount = parseFloat(amountStr);
        return isNaN(amount) ? null : amount;
      }
    }
    return null;
  }

  /**
   * Extract merchant/description from SMS
   */
  extractMerchant(message) {
    for (const pattern of this.merchantPatterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    // Fallback: extract any capitalized words that might be merchant names
    const words = message.match(/[A-Z][A-Z0-9\s&.-]{2,20}/g);
    if (words && words.length > 0) {
      // Return the most likely merchant name (longest match)
      return words.reduce((a, b) => a.length > b.length ? a : b).trim();
    }
    
    return 'Unknown Merchant';
  }

  /**
   * Determine transaction type (debit/credit)
   */
  getTransactionType(message) {
    const text = message.toLowerCase();
    
    if (this.debitIndicators.some(pattern => pattern.test(text))) {
      return 'expense';
    }
    
    if (this.creditIndicators.some(pattern => pattern.test(text))) {
      return 'income';
    }
    
    // Default to expense if unclear
    return 'expense';
  }

  /**
   * Classify transaction category
   */
  classifyCategory(message, merchant) {
    const text = (message + ' ' + merchant).toLowerCase();
    
    for (const [category, pattern] of Object.entries(this.categoryPatterns)) {
      if (pattern.test(text)) {
        return category;
      }
    }
    
    return 'other';
  }

  /**
   * Extract transaction date from SMS
   */
  extractDate(message, smsTimestamp) {
    // Look for date patterns in SMS
    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
      /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{2,4})/i
    ];
    
    for (const pattern of datePatterns) {
      const match = message.match(pattern);
      if (match) {
        try {
          // Parse the date (this is simplified, would need more robust parsing)
          const date = new Date(match[0]);
          if (!isNaN(date.getTime())) {
            return date;
          }
        } catch (e) {
          // Continue to next pattern
        }
      }
    }
    
    // Fallback to SMS timestamp
    return new Date(smsTimestamp);
  }

  /**
   * Detect if transaction is likely an impulse purchase
   */
  detectImpulsePurchase(message, timestamp, amount, category) {
    const hour = new Date(timestamp).getHours();
    
    // Late night purchases (10 PM - 2 AM)
    const isLateNight = hour >= 22 || hour <= 2;
    
    // High amount for certain categories
    const isHighAmount = amount > 1000 && ['shopping', 'entertainment', 'food'].includes(category);
    
    // Quick successive transactions (would need transaction history)
    // This would be implemented with access to recent transactions
    
    // Food delivery during odd hours
    const isOddHourFood = category === 'food' && (hour >= 23 || hour <= 6);
    
    return isLateNight || isHighAmount || isOddHourFood;
  }

  /**
   * Main processing function - converts SMS to structured transaction data
   */
  processSMS(smsData) {
    const { message, timestamp, sender } = smsData;
    
    // Check if it's a financial SMS
    if (!this.isFinancialSMS(message)) {
      return null;
    }
    
    // Extract transaction details
    const amount = this.extractAmount(message);
    if (!amount) {
      return null; // Skip if no amount found
    }
    
    const merchant = this.extractMerchant(message);
    const type = this.getTransactionType(message);
    const category = this.classifyCategory(message, merchant);
    const transactionDate = this.extractDate(message, timestamp);
    const isImpulsePurchase = this.detectImpulsePurchase(message, timestamp, amount, category);
    
    // Return structured transaction data
    return {
      amount,
      type,
      category,
      subcategory: null, // Could be enhanced with more specific classification
      description: merchant,
      merchant,
      transactionDate: transactionDate.toISOString(),
      isRecurring: false, // Would be determined by analyzing patterns
      isImpulsePurchase,
      source: 'sms',
      rawMessage: message, // Store for debugging/improvement
      sender,
      confidence: this.calculateConfidence(message, amount, merchant, type)
    };
  }

  /**
   * Calculate confidence score for the extraction
   */
  calculateConfidence(message, amount, merchant, type) {
    let confidence = 0.5; // Base confidence
    
    // Higher confidence for clear bank messages
    if (/(?:HDFC|ICICI|SBI|AXIS|KOTAK)/i.test(message)) {
      confidence += 0.3;
    }
    
    // Higher confidence for UPI transactions
    if (/UPI/i.test(message)) {
      confidence += 0.2;
    }
    
    // Higher confidence if merchant is well-known
    if (/(?:amazon|flipkart|swiggy|zomato|uber|ola)/i.test(merchant)) {
      confidence += 0.2;
    }
    
    // Lower confidence for generic merchants
    if (merchant === 'Unknown Merchant') {
      confidence -= 0.2;
    }
    
    return Math.min(1.0, Math.max(0.1, confidence));
  }

  /**
   * Batch process multiple SMS messages
   */
  processBatchSMS(smsArray) {
    const transactions = [];
    const errors = [];
    
    for (const sms of smsArray) {
      try {
        const transaction = this.processSMS(sms);
        if (transaction) {
          transactions.push(transaction);
        }
      } catch (error) {
        errors.push({
          sms,
          error: error.message
        });
      }
    }
    
    return {
      transactions,
      errors,
      processed: smsArray.length,
      successful: transactions.length
    };
  }
}

module.exports = SMSProcessor;