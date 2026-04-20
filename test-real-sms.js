/**
 * Test Real SMS Processing
 * This script tests the backend with REAL SMS message formats
 * Copy-paste your actual bank SMS messages here to test
 */

const API_URL = 'http://localhost:3001/api';

// PASTE YOUR REAL SMS MESSAGES HERE
// These are real formats from Indian banks - replace with your actual SMS
const REAL_SMS_MESSAGES = [
  {
    message: "HDFC Bank: Rs.2,500.00 debited from A/c **1234 on 20-Apr-24 at SWIGGY BANGALORE UPI:123456789",
    timestamp: Date.now(),
    sender: "HDFCBK"
  },
  {
    message: "ICICI Bank: Rs.850.00 debited from A/c **5678 on 20-Apr-24 for UPI/UBER INDIA SYSTEMS",
    timestamp: Date.now(),
    sender: "ICICIB"
  },
  // ADD YOUR REAL SMS MESSAGES HERE
  // Just copy-paste the SMS text from your phone
];

async function testRealSMS() {
  console.log('🧪 Testing Real SMS Processing...\n');
  
  try {
    // Test each SMS message
    for (const sms of REAL_SMS_MESSAGES) {
      console.log('📱 Testing SMS:');
      console.log(`   Sender: ${sms.sender}`);
      console.log(`   Message: "${sms.message}"\n`);
      
      // Test parsing without authentication (for testing)
      const response = await fetch(`${API_URL}/sms/test-parsing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sms)
      });
      
      const result = await response.json();
      
      if (result.isFinancial) {
        console.log('✅ SUCCESSFULLY PARSED:');
        console.log(`   Amount: ₹${result.parsedData.amount}`);
        console.log(`   Type: ${result.parsedData.type}`);
        console.log(`   Merchant: ${result.parsedData.merchant}`);
        console.log(`   Category: ${result.parsedData.category}`);
        console.log(`   Confidence: ${Math.round(result.parsedData.confidence * 100)}%`);
      } else {
        console.log('❌ NOT A FINANCIAL SMS');
      }
      
      console.log('\n' + '='.repeat(60) + '\n');
    }
    
    console.log('✅ All tests completed!');
    console.log('\n💡 To test with YOUR real SMS:');
    console.log('   1. Copy SMS text from your phone');
    console.log('   2. Paste it in REAL_SMS_MESSAGES array above');
    console.log('   3. Run: node test-real-sms.js');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Make sure backend is running:');
    console.log('   cd FigmaUI/backend && npm start');
  }
}

// Run the test
testRealSMS();