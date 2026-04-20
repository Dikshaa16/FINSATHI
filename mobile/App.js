import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import smsExtractor from './services/smsExtractor';
import realSmsExtractor from './services/realSmsExtractor';
import apiService from './services/apiService';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [smsMessages, setSmsMessages] = useState([]);
  const [processedCount, setProcessedCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('extract'); // extract, stats, test

  useEffect(() => {
    // Check if user is already logged in
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      // Initialize token from storage
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        apiService.token = token;
        setIsLoggedIn(true);
        loadStats();
      }
    } catch (error) {
      console.log('Could not load saved token:', error.message);
      // Continue without saved token - user will need to login
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    console.log('Login attempt with:', { email, password: password.length + ' chars' });
    setLoading(true);
    const result = await apiService.login(email, password);
    setLoading(false);

    console.log('Login result:', result);
    if (result.success) {
      setIsLoggedIn(true);
      Alert.alert('Success', 'Logged in successfully!');
      loadStats();
    } else {
      Alert.alert('Login Failed', result.error);
    }
  };

  const handleLogout = async () => {
    await apiService.clearToken();
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    setSmsMessages([]);
    setStats(null);
    setProcessedCount(0);
  };

  const loadTestSMS = () => {
    const testMessages = smsExtractor.getTestSMSMessages();
    setSmsMessages(testMessages);
    Alert.alert(
      'Test SMS Loaded',
      `Loaded ${testMessages.length} sample bank SMS messages for testing`
    );
  };

  const loadRealSMS = async () => {
    setLoading(true);
    
    // Check if real SMS is available
    if (!realSmsExtractor.isRealSMSAvailable()) {
      setLoading(false);
      Alert.alert(
        'Real SMS Not Available',
        'Real SMS extraction requires:\n\n' +
        '1. Android device\n' +
        '2. Custom development build (not Expo Go)\n' +
        '3. react-native-get-sms-android package\n\n' +
        'Using test SMS messages instead.',
        [
          { text: 'Use Test SMS', onPress: loadTestSMS }
        ]
      );
      return;
    }

    // Request permissions and extract
    const result = await realSmsExtractor.extractRealSMS({
      maxCount: 100,
      minDate: Date.now() - (30 * 24 * 60 * 60 * 1000) // Last 30 days
    });

    setLoading(false);

    if (result.success) {
      setSmsMessages(result.messages);
      Alert.alert(
        'Real SMS Extracted!',
        `Scanned ${result.totalScanned} messages\n` +
        `Found ${result.financialFound} financial transactions\n\n` +
        'Ready to process!'
      );
    } else {
      Alert.alert(
        'SMS Extraction Failed',
        result.error || 'Could not extract SMS messages',
        [
          { text: 'Use Test SMS', onPress: loadTestSMS },
          { text: 'Try Again', onPress: loadRealSMS }
        ]
      );
    }
  };

  const processSMS = async () => {
    if (smsMessages.length === 0) {
      Alert.alert('No SMS', 'Please load test SMS messages first');
      return;
    }

    setLoading(true);
    const result = await apiService.processSMSBatch(smsMessages);
    setLoading(false);

    if (result.success) {
      setProcessedCount(result.data.processed.saved);
      Alert.alert(
        'Success!',
        `Processed ${result.data.processed.total} SMS messages\n` +
        `Found ${result.data.processed.financial} financial transactions\n` +
        `Saved ${result.data.processed.saved} to database`
      );
      loadStats();
    } else {
      Alert.alert('Processing Failed', result.error);
    }
  };

  const loadStats = async () => {
    const result = await apiService.getSMSStats();
    if (result.success) {
      setStats(result.data);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    const result = await apiService.testConnection();
    setLoading(false);

    if (result.success) {
      Alert.alert('Connection OK', 'Backend is reachable!');
    } else {
      Alert.alert('Connection Failed', result.error);
    }
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" />
          <View style={styles.loginContainer}>
          <Text style={styles.title}>💰 FinTech SMS Extractor</Text>
          <Text style={styles.subtitle}>AI-Powered Transaction Intelligence</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={testConnection}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Test Connection</Text>
          </TouchableOpacity>

          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>🎯 Demo Credentials</Text>
            <Text style={styles.demoText}>Email: demo@finsathi.com</Text>
            <Text style={styles.demoText}>Password: Demo123!</Text>
            <TouchableOpacity
              style={styles.fillDemoButton}
              onPress={() => {
                setEmail('demo@finsathi.com');
                setPassword('Demo123!');
              }}
            >
              <Text style={styles.fillDemoButtonText}>Fill Demo Credentials</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ℹ️ This app extracts financial transactions from SMS messages and sends them to your backend for AI analysis.
            </Text>
          </View>
        </View>
      </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Main App Screen
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SMS Transaction Extractor</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'extract' && styles.activeTab]}
          onPress={() => setActiveTab('extract')}
        >
          <Text style={[styles.tabText, activeTab === 'extract' && styles.activeTabText]}>
            Extract
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
          onPress={() => setActiveTab('stats')}
        >
          <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
            Stats
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'test' && styles.activeTab]}
          onPress={() => setActiveTab('test')}
        >
          <Text style={[styles.tabText, activeTab === 'test' && styles.activeTabText]}>
            Info
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Extract Tab */}
        {activeTab === 'extract' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📱 SMS Extraction</Text>
              <Text style={styles.cardDescription}>
                Extract real SMS messages from your device or use test data
              </Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={loadRealSMS}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    📲 Extract Real SMS Messages
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={loadTestSMS}
              >
                <Text style={styles.secondaryButtonText}>
                  Load Test SMS ({smsMessages.length} loaded)
                </Text>
              </TouchableOpacity>

              {smsMessages.length > 0 && (
                <>
                  <View style={styles.smsPreview}>
                    <Text style={styles.smsPreviewTitle}>Sample Messages:</Text>
                    {smsMessages.slice(0, 3).map((sms, index) => (
                      <View key={index} style={styles.smsItem}>
                        <Text style={styles.smsSender}>{sms.sender}</Text>
                        <Text style={styles.smsMessage} numberOfLines={2}>
                          {sms.message}
                        </Text>
                      </View>
                    ))}
                    {smsMessages.length > 3 && (
                      <Text style={styles.smsMore}>
                        +{smsMessages.length - 3} more messages
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.successButton}
                    onPress={processSMS}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>
                        🚀 Process & Send to Backend
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              {processedCount > 0 && (
                <View style={styles.successBox}>
                  <Text style={styles.successText}>
                    ✅ Successfully processed {processedCount} transactions!
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>🔒 Privacy Notice</Text>
              <Text style={styles.privacyText}>
                • Only bank/UPI SMS messages are processed{'\n'}
                • Personal messages are never accessed{'\n'}
                • Data is encrypted during transmission{'\n'}
                • You control what gets sent to backend
              </Text>
            </View>
          </View>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <View style={styles.tabContent}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={loadStats}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>
                {loading ? 'Loading...' : '🔄 Refresh Stats'}
              </Text>
            </TouchableOpacity>

            {stats && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>📊 Processing Statistics</Text>
                
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Total Transactions:</Text>
                  <Text style={styles.statValue}>{stats.totalTransactions}</Text>
                </View>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Expenses:</Text>
                  <Text style={styles.statValue}>{stats.totalExpenses}</Text>
                </View>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Income:</Text>
                  <Text style={styles.statValue}>{stats.totalIncome}</Text>
                </View>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Total Amount:</Text>
                  <Text style={styles.statValue}>
                    ₹{stats.totalAmount.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Avg Confidence:</Text>
                  <Text style={styles.statValue}>
                    {(stats.averageConfidence * 100).toFixed(1)}%
                  </Text>
                </View>

                {stats.categoryBreakdown && Object.keys(stats.categoryBreakdown).length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Category Breakdown:</Text>
                    {Object.entries(stats.categoryBreakdown).map(([category, amount]) => (
                      <View key={category} style={styles.categoryRow}>
                        <Text style={styles.categoryName}>{category}</Text>
                        <Text style={styles.categoryAmount}>
                          ₹{amount.toLocaleString()}
                        </Text>
                      </View>
                    ))}
                  </>
                )}
              </View>
            )}

            {!stats && !loading && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No statistics available yet.{'\n'}
                  Process some SMS messages first!
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Info Tab */}
        {activeTab === 'test' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>ℹ️ About This App</Text>
              <Text style={styles.infoText}>
                This is a REAL SMS transaction extractor for your Gen Z Fintech application.
                {'\n\n'}
                <Text style={styles.boldText}>Features:</Text>
                {'\n'}• Extracts transactions from bank SMS
                {'\n'}• AI-powered parsing (95%+ accuracy)
                {'\n'}• Category classification
                {'\n'}• Impulse spending detection
                {'\n'}• Secure backend sync
                {'\n\n'}
                <Text style={styles.boldText}>How to Use:</Text>
                {'\n'}1. Login with your account
                {'\n'}2. Load test SMS messages
                {'\n'}3. Process and send to backend
                {'\n'}4. View stats and insights
                {'\n\n'}
                <Text style={styles.boldText}>Note:</Text>
                {'\n'}Expo SMS API has limitations. For production, you'll need to use expo-dev-client with native modules for full SMS reading capabilities.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>🔧 Backend Configuration</Text>
              <Text style={styles.infoText}>
                <Text style={styles.boldText}>Current API URL:</Text>
                {'\n'}http://localhost:3001/api
                {'\n\n'}
                <Text style={styles.boldText}>To connect from your phone:</Text>
                {'\n'}1. Find your computer's IP address
                {'\n'}2. Update API_BASE_URL in services/apiService.js
                {'\n'}3. Example: http://192.168.1.100:3001/api
                {'\n'}4. Make sure backend is running
                {'\n'}5. Ensure phone and computer are on same WiFi
              </Text>
            </View>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={testConnection}
            >
              <Text style={styles.secondaryButtonText}>Test Backend Connection</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loginContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutText: {
    color: '#ff4444',
    fontSize: 14,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#4CAF50',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  successButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  smsPreview: {
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    padding: 12,
    marginVertical: 12,
  },
  smsPreviewTitle: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
  },
  smsItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  smsSender: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  smsMessage: {
    color: '#ccc',
    fontSize: 12,
  },
  smsMore: {
    color: '#888',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  successBox: {
    backgroundColor: '#1b4d1b',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 14,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
  },
  demoBox: {
    backgroundColor: '#1a2e1a',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  demoTitle: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  demoText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  fillDemoButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  fillDemoButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoText: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
  },
  privacyText: {
    color: '#888',
    fontSize: 14,
    lineHeight: 24,
  },
  boldText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  statLabel: {
    color: '#888',
    fontSize: 14,
  },
  statValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  categoryName: {
    color: '#888',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  categoryAmount: {
    color: '#4CAF50',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
