/**
 * SMS Extraction Service for Expo
 * Extracts financial transaction data from SMS messages
 */

import * as SMS from 'expo-sms';

class SMSExtractor {
  constructor() {
    // Bank and UPI patterns for transaction detection
    this.bankPatterns = [
      /(?:HDFC|ICICI|SBI|AXIS|KOTAK|PNB|BOB|CANARA|UNION|INDIAN)/i,
      /(?:UPI|BHIM|PAYTM|PHONEPE|GPAY|GOOGLEPAY|AMAZONPAY)/i,
      /(?:debited|credited|paid|received|transferred|transaction)/i
    ];

    // Common bank sender IDs
    this.bankSenders = [
      'HDFCBK', 'ICICIB', 'SBIIN', 'AXISBK', 'KOTAKB',
      'PNBSMS', 'BOBSMS', 'CANBNK', 'UNIONB', 'INDBNK',
      'PAYTM', 'PHONEPE', 'GPAY', 'AMAZONP'
    ];
  }

  /**
   * Check if SMS permissions are available
   */
  async checkPermissions() {
    try {
      const isAvailable = await SMS.isAvailableAsync();
      return isAvailable;
    } catch (error) {
      console.error('Error checking SMS permissions:', error);
      return false;
    }
  }

  /**
   * Check if SMS is a financial transaction
   */
  isFinancialSMS(message, sender) {
    const text = message.toLowerCase();
    
    // Check sender ID
    const isBankSender = this.bankSenders.some(bankId => 
      sender.toUpperCase().includes(bankId)
    );
    
    // Check for bank/UPI patterns
    const hasBankPattern = this.bankPatterns.some(pattern => pattern.test(text));
    
    // Check for amount patterns
    const hasAmount = /(?:rs\.?\s*|inr\s*|₹\s*)(\d+(?:,\d+)*(?:\.\d{2})?)/i.test(text);
    
    // Check for transaction keywords
    const hasTransactionKeyword = /(?:debited|credited|paid|received|transaction|upi|transfer)/i.test(text);
    
    return (isBankSender || hasBankPattern) && hasAmount && hasTransactionKeyword;
  }

  /**
   * Extract SMS messages (Note: Expo SMS doesn't support reading inbox)
   * This is a placeholder for the actual implementation
   * In production, you would need to use a native module or different approach
   */
  async extractSMSMessages() {
    // IMPORTANT: expo-sms only supports SENDING SMS, not READING
    // For reading SMS, you need to use expo-contacts or a custom native module
    // This is a limitation we need to communicate to the user
    
    console.warn('SMS Reading is not directly supported by Expo');
    console.warn('You need to use a custom development build with native modules');
    
    return {
      success: false,
      error: 'SMS reading requires custom native module',
      recommendation: 'Use expo-dev-client with react-native-get-sms-android'
    };
  }

  /**
   * Parse a single SMS message (for manual input or testing)
   */
  parseSMS(message, sender, timestamp) {
    if (!this.isFinancialSMS(message, sender)) {
      return null;
    }

    return {
      message,
      sender,
      timestamp: timestamp || Date.now()
    };
  }

  /**
   * Simulate SMS extraction for testing
   * Returns sample bank SMS messages
   */
  getTestSMSMessages() {
    return [
      {
        message: 'HDFC Bank: Rs.2,500.00 debited from A/c **1234 on 20-Apr-24 at SWIGGY BANGALORE UPI:123456789',
        sender: 'HDFCBK',
        timestamp: Date.now() - 3600000
      },
      {
        message: 'ICICI Bank: Rs.1,200 spent on your Credit Card ending 5678 at AMAZON on 20-Apr-24',
        sender: 'ICICIB',
        timestamp: Date.now() - 7200000
      },
      {
        message: 'SBI: Rs.5,000 credited to A/c XX9876 on 19-Apr-24. Salary credit. Avl Bal: Rs.45,000',
        sender: 'SBIIN',
        timestamp: Date.now() - 86400000
      },
      {
        message: 'AXIS Bank: Rs.850 debited from A/c **4321 for UPI/ZOMATO/123456 on 20-Apr-24',
        sender: 'AXISBK',
        timestamp: Date.now() - 10800000
      },
      {
        message: 'PAYTM: Rs.300 paid to UBER via UPI. Txn ID: 987654321. Balance: Rs.2,500',
        sender: 'PAYTM',
        timestamp: Date.now() - 14400000
      },
      {
        message: 'KOTAK Bank: Rs.15,000 debited from A/c **7890 on 18-Apr-24 for FLIPKART purchase',
        sender: 'KOTAKB',
        timestamp: Date.now() - 172800000
      },
      {
        message: 'PhonePe: Rs.450 sent to JOHN DOE via UPI. Txn successful. Ref: PE123456',
        sender: 'PHONEPE',
        timestamp: Date.now() - 21600000
      },
      {
        message: 'HDFC Bank: Rs.3,200 debited from A/c **1234 on 19-Apr-24 at NETFLIX SUBSCRIPTION',
        sender: 'HDFCBK',
        timestamp: Date.now() - 259200000
      }
    ];
  }
}

export default new SMSExtractor();
