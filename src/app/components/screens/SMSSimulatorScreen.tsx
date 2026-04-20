import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Smartphone,
  Upload,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Sparkles
} from "lucide-react";
import { Button } from "../ui/button";
import { api } from "../../../services/api";

// Mock SMS messages for demo
const SAMPLE_SMS_MESSAGES = [
  {
    sender: "HDFCBK",
    message: "HDFC Bank: Rs.2,500.00 debited from A/c **1234 on 20-Apr-24 at SWIGGY BANGALORE UPI:123456789",
    timestamp: Date.now() - 1000 * 60 * 60 * 2
  },
  {
    sender: "ICICI",
    message: "ICICI Bank: Rs.850.00 debited from A/c **5678 on 20-Apr-24 for UPI/UBER INDIA SYSTEMS",
    timestamp: Date.now() - 1000 * 60 * 60 * 24
  },
  {
    sender: "UPI",
    message: "UPI: Rs.15,000.00 credited to A/c **9012 on 19-Apr-24 from SALARY TRANSFER",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2
  },
  {
    sender: "AXISBK",
    message: "AXIS Bank: Rs.1,200.00 debited from A/c **3456 on 18-Apr-24 at AMAZON INDIA",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3
  },
  {
    sender: "PAYTM",
    message: "Paytm: Rs.649.00 debited for Netflix subscription on 17-Apr-24",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 4
  },
  {
    sender: "PHONEPE",
    message: "PhonePe: Rs.3,500.00 debited from A/c **7890 on 16-Apr-24 at FLIPKART",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5
  },
  {
    sender: "SBIINB",
    message: "SBI: Rs.450.00 debited from A/c **2345 on 15-Apr-24 for ELECTRICITY BILL",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 6
  },
  {
    sender: "KOTAKBK",
    message: "KOTAK Bank: Rs.5,000.00 credited to A/c **6789 on 14-Apr-24 REFUND FROM AMAZON",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7
  }
];

interface ParsedTransaction {
  amount: number;
  type: 'debit' | 'credit';
  merchant: string;
  category: string;
  confidence: number;
  originalMessage: string;
  sender: string;
}

export function SMSSimulatorScreen() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      food: '🍕',
      transport: '🚗',
      shopping: '🛍️',
      entertainment: '🎬',
      utilities: '💡',
      healthcare: '🏥',
      education: '📚',
      investment: '📈',
      insurance: '🛡️',
      transfer: '💸',
      other: '💳',
    };
    return icons[category] || '💳';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      food: '#FF6B6B',
      transport: '#4ECDC4',
      shopping: '#45B7D1',
      entertainment: '#96CEB4',
      utilities: '#FFEAA7',
      healthcare: '#DDA0DD',
      education: '#98D8C8',
      investment: '#F7DC6F',
      insurance: '#BB8FCE',
      transfer: '#85C1E9',
      other: '#BDC3C7',
    };
    return colors[category] || '#BDC3C7';
  };

  const toggleMessageSelection = (index: number) => {
    setSelectedMessages(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const selectAllMessages = () => {
    if (selectedMessages.length === SAMPLE_SMS_MESSAGES.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(SAMPLE_SMS_MESSAGES.map((_, i) => i));
    }
  };

  const processSMSMessages = async () => {
    if (selectedMessages.length === 0) {
      alert('Please select at least one SMS message to process');
      return;
    }

    setIsProcessing(true);
    setShowResults(false);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Parse selected messages
    const messagesToProcess = selectedMessages.map(i => SAMPLE_SMS_MESSAGES[i]);
    const parsed: ParsedTransaction[] = [];

    messagesToProcess.forEach(sms => {
      // Simple parsing logic (matches backend logic)
      const amountMatch = sms.message.match(/Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
      
      const isDebit = /debited|paid|sent|transferred|purchase/i.test(sms.message);
      const isCredit = /credited|received|deposited|refund|cashback/i.test(sms.message);
      
      // Extract merchant
      let merchant = 'Unknown';
      const merchantMatch = sms.message.match(/(?:at|to|from|for)\s+([A-Z][A-Z0-9\s&.-]{2,30})/i);
      if (merchantMatch) {
        merchant = merchantMatch[1].trim();
      }
      
      // Categorize
      let category = 'other';
      const text = sms.message.toLowerCase();
      if (/swiggy|zomato|food|restaurant/i.test(text)) category = 'food';
      else if (/uber|ola|transport|taxi/i.test(text)) category = 'transport';
      else if (/amazon|flipkart|shopping/i.test(text)) category = 'shopping';
      else if (/netflix|prime|entertainment/i.test(text)) category = 'entertainment';
      else if (/electricity|bill|utility/i.test(text)) category = 'utilities';
      else if (/salary|income|refund/i.test(text)) category = 'transfer';
      
      if (amount > 0) {
        parsed.push({
          amount,
          type: isCredit ? 'credit' : 'debit',
          merchant,
          category,
          confidence: 0.85 + Math.random() * 0.15,
          originalMessage: sms.message,
          sender: sms.sender
        });
      }
    });

    setParsedTransactions(parsed);
    setIsProcessing(false);
    setShowResults(true);
  };

  const syncToBackend = async () => {
    setSyncStatus('syncing');
    
    try {
      // Try to sync with backend
      const smsData = parsedTransactions.map(tx => ({
        message: tx.originalMessage,
        timestamp: Date.now(),
        sender: tx.sender
      }));

      const response = await api.processSMSBatch(smsData);
      
      if (response.data) {
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 5000);
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
  };

  return (
    <div className="px-5 md:px-8 pt-5 md:pt-6 pb-8" style={{ color: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-xl"
          style={{ background: "#181820", border: "1px solid rgba(255,255,255,0.06)" }}
          onClick={() => window.history.back()}
        >
          <ArrowLeft size={18} color="rgba(255,255,255,0.7)" />
        </Button>
        <div>
          <h1 style={{ fontSize: "24px", color: "#fff", fontWeight: 600 }}>
            SMS Transaction Extractor
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
            AI-powered SMS parsing demo
          </p>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left: SMS Messages */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-6 mb-4"
              style={{
                background: "#181820",
                border: "1px solid rgba(255,255,255,0.05)"
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Smartphone size={20} color="#7C3AED" />
                  <h3 style={{ fontSize: "18px", color: "#fff", fontWeight: 600 }}>
                    Sample Bank SMS Messages
                  </h3>
                </div>
                <Button
                  onClick={selectAllMessages}
                  variant="ghost"
                  size="sm"
                  style={{ fontSize: "12px" }}
                >
                  {selectedMessages.length === SAMPLE_SMS_MESSAGES.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {SAMPLE_SMS_MESSAGES.map((sms, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => toggleMessageSelection(index)}
                    className="p-4 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: selectedMessages.includes(index) 
                        ? "rgba(124,58,237,0.15)" 
                        : "rgba(255,255,255,0.02)",
                      border: selectedMessages.includes(index)
                        ? "1px solid rgba(124,58,237,0.3)"
                        : "1px solid rgba(255,255,255,0.05)"
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        selectedMessages.includes(index) ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-gray-600'
                      }`}>
                        {selectedMessages.includes(index) && (
                          <CheckCircle size={14} color="#fff" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span style={{ 
                            fontSize: "11px", 
                            color: "#00D68F",
                            background: "rgba(0,214,143,0.1)",
                            padding: "2px 6px",
                            borderRadius: "4px"
                          }}>
                            {sms.sender}
                          </span>
                          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                            {new Date(sms.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p style={{ 
                          fontSize: "13px", 
                          color: "rgba(255,255,255,0.8)",
                          lineHeight: "1.5"
                        }}>
                          {sms.message}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800">
                <Button
                  onClick={processSMSMessages}
                  disabled={isProcessing || selectedMessages.length === 0}
                  className="w-full h-12"
                  style={{
                    background: isProcessing ? "rgba(124,58,237,0.5)" : "linear-gradient(135deg, #7C3AED, #5B21B6)",
                    border: "none"
                  }}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin mr-2">⚙️</div>
                      Processing {selectedMessages.length} messages...
                    </>
                  ) : (
                    <>
                      <Upload size={18} className="mr-2" />
                      Process {selectedMessages.length} Selected Messages
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Right: Parsed Results */}
          <div>
            <AnimatePresence>
              {!showResults && !isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="rounded-2xl p-8 text-center"
                  style={{
                    background: "#181820",
                    border: "1px solid rgba(255,255,255,0.05)"
                  }}
                >
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                       style={{ background: "rgba(124,58,237,0.2)" }}>
                    <Sparkles size={40} color="#7C3AED" />
                  </div>
                  <h3 style={{ fontSize: "20px", color: "#fff", marginBottom: "8px" }}>
                    Ready to Extract
                  </h3>
                  <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>
                    Select SMS messages from the left and click "Process" to see AI-powered transaction extraction in action
                  </p>
                </motion.div>
              )}

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-8 text-center"
                  style={{
                    background: "#181820",
                    border: "1px solid rgba(255,255,255,0.05)"
                  }}
                >
                  <div className="animate-pulse">
                    <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                         style={{ background: "rgba(124,58,237,0.2)" }}>
                      <div className="animate-spin text-3xl">🧠</div>
                    </div>
                    <h3 style={{ fontSize: "18px", color: "#fff", marginBottom: "16px" }}>
                      AI Processing SMS Messages
                    </h3>
                    <div className="space-y-2">
                      {['Extracting amounts...', 'Identifying merchants...', 'Categorizing transactions...', 'Calculating confidence scores...'].map((step, i) => (
                        <motion.div
                          key={step}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.3 }}
                          style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}
                        >
                          {step}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {showResults && parsedTransactions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="rounded-2xl p-6"
                       style={{
                         background: "linear-gradient(135deg, rgba(0,214,143,0.1), rgba(0,214,143,0.05))",
                         border: "1px solid rgba(0,214,143,0.2)"
                       }}>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={20} color="#00D68F" />
                      <h3 style={{ fontSize: "18px", color: "#00D68F", fontWeight: 600 }}>
                        Extraction Complete!
                      </h3>
                    </div>
                    <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>
                      Successfully parsed {parsedTransactions.length} transactions from {selectedMessages.length} SMS messages
                    </p>
                  </div>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {parsedTransactions.map((tx, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="rounded-xl p-4"
                        style={{
                          background: "#181820",
                          border: "1px solid rgba(255,255,255,0.05)"
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span style={{ fontSize: "20px" }}>
                              {getCategoryIcon(tx.category)}
                            </span>
                            <div>
                              <p style={{ fontSize: "15px", color: "#fff", fontWeight: 500 }}>
                                {tx.merchant}
                              </p>
                              <p style={{ 
                                fontSize: "12px", 
                                color: getCategoryColor(tx.category),
                                textTransform: "capitalize"
                              }}>
                                {tx.category}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p style={{ 
                              fontSize: "16px", 
                              color: tx.type === 'credit' ? '#00D68F' : '#fff',
                              fontWeight: 600
                            }}>
                              {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                            </p>
                            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
                              {Math.round(tx.confidence * 100)}% confidence
                            </p>
                          </div>
                        </div>
                        <p style={{ 
                          fontSize: "11px", 
                          color: "rgba(255,255,255,0.4)",
                          fontStyle: "italic",
                          marginTop: "8px",
                          paddingTop: "8px",
                          borderTop: "1px solid rgba(255,255,255,0.05)"
                        }}>
                          "{tx.originalMessage.substring(0, 80)}..."
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  <Button
                    onClick={syncToBackend}
                    disabled={syncStatus === 'syncing'}
                    className="w-full h-12"
                    style={{
                      background: syncStatus === 'success' 
                        ? "linear-gradient(135deg, #00D68F, #00b377)"
                        : syncStatus === 'error'
                        ? "linear-gradient(135deg, #EF4444, #DC2626)"
                        : "linear-gradient(135deg, #7C3AED, #5B21B6)",
                      border: "none"
                    }}
                  >
                    {syncStatus === 'syncing' && (
                      <>
                        <div className="animate-spin mr-2">⚙️</div>
                        Syncing to Backend...
                      </>
                    )}
                    {syncStatus === 'success' && (
                      <>
                        <CheckCircle size={18} className="mr-2" />
                        Synced Successfully!
                      </>
                    )}
                    {syncStatus === 'error' && (
                      <>
                        <AlertCircle size={18} className="mr-2" />
                        Sync Failed (Backend Offline)
                      </>
                    )}
                    {syncStatus === 'idle' && (
                      <>
                        <Upload size={18} className="mr-2" />
                        Sync to Backend
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}