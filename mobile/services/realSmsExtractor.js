/**
 * Real SMS Extraction Service
 * Extracts actual SMS messages from device
 * 
 * IMPORTANT: This requires react-native-get-sms-android package
 * Install with: npm install react-native-get-sms-android
 * 
 * For Expo managed workflow, you need to:
 * 1. Run: npx expo install expo-dev-client
 * 2. Run: npx expo prebuild
 * 3. Add the package to package.json
 * 4. Build custom dev client
 */

import { Platform, PermissionsAndroid } from 'react-native';

// This will be imported dynamically to avoid errors in Expo Go
let SmsAndroid = null;

try {
  if (Platform.OS === 'android') {
    SmsAndroid = require('react-native-get-sms-android');
  }
} catch (error) {
  console.log('react-native-get-sms-android not available - using mock data');
}

class RealSMSExtractor {
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
      'PAYTM', 'PHONEPE', 'GPAY', 'AMAZONP', 'IDFCFB',
      'YESBNK', 'INDUSB', 'RBLBNK', 'HSBCIN'
    ];

    this.hasPermission = false;
  }

  /**
   * Request SMS permissions (Android only)
   */
  async requestPermissions() {
    if (Platform.OS !== 'android') {
      return { granted: false, error: 'SMS reading only available on Android' };
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'SMS Permission',
          message: 'FINSATHI needs access to your SMS messages to extract financial transactions',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      this.hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
      
      return {
        granted: this.hasPermission,
        error: this.hasPermission ? null : 'Permission denied'
      };
    } catch (error) {
      console.error('Error requesting SMS permission:', error);
      return { granted: false, error: error.message };
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
   * Extract real SMS messages from device
   */
  async extractRealSMS(options = {}) {
    // Check if running in custom dev client
    if (!SmsAndroid) {
      return {
        success: false,
        error: 'SMS reading not available in Expo Go',
        messages: [],
        recommendation: 'Build custom dev client with expo-dev-client'
      };
    }

    // Check permissions
    if (!this.hasPermission) {
      const permResult = await this.requestPermissions();
      if (!permResult.granted) {
        return {
          success: false,
          error: 'SMS permission required',
          messages: []
        };
      }
    }

    try {
      const {
        maxCount = 100,
        minDate = Date.now() - (30 * 24 * 60 * 60 * 1000), // Last 30 days
        indexFrom = 0
      } = options;

      return new Promise((resolve, reject) => {
        const filter = {
          box: 'inbox',
          indexFrom,
          maxCount,
          minDate
        };

        SmsAndroid.list(
          JSON.stringify(filter),
          (fail) => {
            console.error('Failed to get SMS:', fail);
            reject({
              success: false,
              error: 'Failed to read SMS messages',
              messages: []
            });
          },
          (count, smsList) => {
            const messages = JSON.parse(smsList);
            
            // Filter for financial SMS only
            const financialSMS = messages
              .filter(sms => this.isFinancialSMS(sms.body, sms.address))
              .map(sms => ({
                message: sms.body,
                sender: sms.address,
                timestamp: parseInt(sms.date),
                id: sms._id
              }))
              .sort((a, b) => b.timestamp - a.timestamp); // Most recent first

            resolve({
              success: true,
              messages: financialSMS,
              totalScanned: messages.length,
              financialFound: financialSMS.length
            });
          }
        );
      });
    } catch (error) {
      console.error('Error extracting SMS:', error);
      return {
        success: false,
        error: error.message,
        messages: []
      };
    }
  }

  /**
   * Get test SMS messages (fallback for Expo Go)
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

  /**
   * Check if real SMS extraction is available
   */
  isRealSMSAvailable() {
    return Platform.OS === 'android' && SmsAndroid !== null;
  }
}

export default new RealSMSExtractor();
