# 📱 Real SMS Extraction Setup Guide

## Overview
This guide explains how to enable **real SMS extraction** from your Android device instead of using mock/test data.

## Current Status
- ✅ **Test SMS** - Working (mock data for testing)
- ⚠️ **Real SMS** - Requires custom development build

## Why Real SMS Doesn't Work in Expo Go

**Expo Go** is a sandbox app that doesn't support native modules like SMS reading. To read real SMS messages, you need to build a **custom development client**.

## Option 1: Quick Test (Use Test SMS) ✅ WORKING NOW

**Best for**: Quick testing, demos, development

The app currently uses test SMS messages that simulate real bank SMS. This works perfectly in Expo Go and doesn't require any setup.

**How to use**:
1. Open the app
2. Login with demo credentials
3. Tap "Load Test SMS"
4. Tap "Process & Send to Backend"
5. ✅ View extracted transactions!

## Option 2: Real SMS Extraction (Requires Setup)

**Best for**: Production use, real transaction tracking

### Prerequisites
- Android device (iOS doesn't allow SMS reading)
- Node.js and npm installed
- Android Studio (for building)
- Physical Android device or emulator

### Step 1: Install Required Package

```bash
cd mobile
npm install react-native-get-sms-android
```

### Step 2: Install Expo Dev Client

```bash
npx expo install expo-dev-client
```

### Step 3: Prebuild the Project

This creates native Android/iOS folders:

```bash
npx expo prebuild
```

### Step 4: Update app.json

Add the SMS permission to `mobile/app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "usesCleartextTraffic": true
          }
        }
      ]
    ],
    "android": {
      "permissions": [
        "READ_SMS",
        "RECEIVE_SMS"
      ]
    }
  }
}
```

### Step 5: Build Custom Development Client

**For Android**:

```bash
# Build for Android device
npx expo run:android

# Or build APK
eas build --profile development --platform android
```

**Note**: You'll need an Expo account for EAS Build. Sign up at https://expo.dev

### Step 6: Install and Run

1. Install the custom dev client APK on your Android device
2. Start the development server:
   ```bash
   cd mobile
   npm start
   ```
3. Open the custom dev client app (not Expo Go)
4. Scan the QR code or enter the URL manually

### Step 7: Test Real SMS Extraction

1. Login to the app
2. Tap "📲 Extract Real SMS Messages"
3. Grant SMS permission when prompted
4. ✅ Your real SMS messages will be extracted!

## How It Works

### SMS Extraction Flow

```
1. User taps "Extract Real SMS"
   ↓
2. App requests READ_SMS permission
   ↓
3. User grants permission
   ↓
4. App scans SMS inbox (last 30 days)
   ↓
5. Filters for financial SMS (banks, UPI)
   ↓
6. Extracts transaction details
   ↓
7. Sends to backend for processing
   ↓
8. Backend parses and stores transactions
   ↓
9. AI analyzes spending patterns
   ↓
10. User sees insights and stats
```

### Supported Banks & Services

The app automatically detects SMS from:

**Banks**:
- HDFC Bank
- ICICI Bank
- State Bank of India (SBI)
- Axis Bank
- Kotak Mahindra Bank
- Punjab National Bank (PNB)
- Bank of Baroda (BOB)
- Canara Bank
- Union Bank
- Indian Bank
- IDFC First Bank
- Yes Bank
- IndusInd Bank
- RBL Bank
- HSBC India

**UPI Services**:
- Google Pay (GPay)
- PhonePe
- Paytm
- BHIM
- Amazon Pay

### SMS Detection Criteria

An SMS is considered financial if it:
1. **Sender ID** matches known bank/UPI patterns
2. **Contains amount** (Rs., INR, ₹ followed by numbers)
3. **Has transaction keywords** (debited, credited, paid, received, UPI, transfer)

## Troubleshooting

### "Real SMS Not Available" Error

**Cause**: Running in Expo Go instead of custom dev client

**Solution**: Build and install custom development client (see Step 5 above)

### "Permission Denied" Error

**Cause**: User denied SMS permission

**Solution**: 
1. Go to Android Settings → Apps → FINSATHI
2. Permissions → SMS → Allow
3. Restart the app and try again

### No SMS Messages Found

**Possible causes**:
1. No financial SMS in last 30 days
2. SMS from unsupported banks
3. SMS format not recognized

**Solution**:
- Check if you have bank SMS in your inbox
- Try with test SMS first to verify backend is working
- Contact support if issue persists

### Build Errors

**Common issues**:
- Android SDK not installed → Install Android Studio
- Gradle errors → Clear cache: `cd android && ./gradlew clean`
- Dependency conflicts → Delete node_modules and reinstall

## Privacy & Security

### Data Handling
- ✅ SMS messages are **never stored** on our servers
- ✅ Only **transaction data** is extracted and stored
- ✅ Personal information is **filtered out**
- ✅ All data is **encrypted** in transit (HTTPS)
- ✅ You can **delete** your data anytime

### Permissions
- **READ_SMS**: Required to read SMS messages from inbox
- **RECEIVE_SMS**: Optional, for real-time SMS processing

### What We Extract
- ✅ Transaction amount
- ✅ Merchant name
- ✅ Transaction type (debit/credit)
- ✅ Date and time
- ✅ Bank/UPI service

### What We DON'T Extract
- ❌ Full SMS message text
- ❌ Account numbers (only last 4 digits if present)
- ❌ Personal messages
- ❌ OTPs or verification codes
- ❌ Non-financial SMS

## Alternative: Manual SMS Input

If you don't want to build a custom client, you can manually input SMS:

1. Copy a bank SMS from your messages app
2. In FINSATHI app, go to "Manual Input" tab
3. Paste the SMS text
4. Tap "Process"
5. ✅ Transaction extracted!

## Comparison: Test SMS vs Real SMS

| Feature | Test SMS | Real SMS |
|---------|----------|----------|
| **Setup** | ✅ None required | ⚠️ Custom build needed |
| **Works in Expo Go** | ✅ Yes | ❌ No |
| **Real transactions** | ❌ Mock data | ✅ Your actual SMS |
| **Permissions** | ✅ None | ⚠️ SMS permission |
| **Best for** | Testing, demos | Production, real use |

## Recommended Approach

### For Development/Testing
1. Use **Test SMS** in Expo Go
2. Test all features with mock data
3. Verify backend processing works
4. Test UI/UX flows

### For Production/Real Use
1. Build **custom dev client**
2. Install on Android device
3. Grant SMS permissions
4. Extract real SMS messages
5. Get actual financial insights

## Next Steps

### Currently Working ✅
- Login/Authentication
- Test SMS extraction
- Backend processing
- Transaction storage
- Stats and analytics
- All 4 core features

### To Enable Real SMS
1. Follow steps above to build custom client
2. Install on Android device
3. Grant permissions
4. Start extracting real transactions!

## Support

### Need Help?
- Check the troubleshooting section above
- Review Expo documentation: https://docs.expo.dev
- Check react-native-get-sms-android docs: https://github.com/briankabiro/react-native-get-sms-android

### Quick Links
- Expo Dev Client: https://docs.expo.dev/develop/development-builds/introduction/
- EAS Build: https://docs.expo.dev/build/introduction/
- Android Permissions: https://developer.android.com/guide/topics/permissions/overview

---

**Current Status**: ✅ Test SMS working perfectly in Expo Go  
**Real SMS Status**: ⚠️ Requires custom development build  
**Recommended**: Use Test SMS for now, build custom client for production

**Last Updated**: April 20, 2026
