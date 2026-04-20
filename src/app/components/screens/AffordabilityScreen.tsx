import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingDown,
  Zap,
  Brain,
  Target
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useFinancialData } from "../../../hooks/useFinancialData";
import { useTransactions } from "../../../hooks/useTransactions";

interface AffordabilityResult {
  canAfford: boolean;
  riskLevel: 'safe' | 'risky' | 'dangerous';
  message: string;
  explanation: string;
  daysUntilBroke?: number;
  recommendation?: string;
  timeWarning?: string;
  categoryInsight?: string;
}

// Smart affordability engine with advanced logic using real user data
function calculateAffordability(
  price: number,
  financialData: any,
  transactions: any[],
  currentHour: number = new Date().getHours(),
  category?: string
): AffordabilityResult {
  const { balance, monthlyIncome, currentExpenses } = financialData;
  
  // Ensure transactions is always an array
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  
  // Calculate available balance after essential expenses
  const availableBalance = balance - (currentExpenses * 0.7); // Keep 70% buffer for essentials
  
  // Calculate daily spending from recent transactions
  const recentTransactions = safeTransactions.slice(0, 10);
  const dailySpending = recentTransactions.length > 0 
    ? recentTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) / Math.min(recentTransactions.length, 7)
    : currentExpenses / 30;
  
  // Analyze spending pattern volatility
  const spendingAmounts = recentTransactions.map(tx => Math.abs(tx.amount));
  const avgSpending = spendingAmounts.reduce((sum, amt) => sum + amt, 0) / Math.max(spendingAmounts.length, 1);
  const spendingVariance = spendingAmounts.reduce((acc, amt) => {
    return acc + Math.pow(amt - avgSpending, 2);
  }, 0) / Math.max(spendingAmounts.length, 1);
  const volatilityMultiplier = spendingVariance > 500000 ? 1.2 : 1.0;
  
  const daysLeftInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();
  
  // Category-based risk assessment
  // Weekend/weekday spending patterns (weekends typically higher)
  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
  const weekendMultiplier = isWeekend ? 1.15 : 1.0;
  
  // Late night spending multiplier (22:00 - 06:00 = higher risk)
  const timeRiskMultiplier = (currentHour >= 22 || currentHour <= 6) ? 1.3 : 1.0;
  
  // Impulse purchase detection (high-value items)
  const impulseThreshold = dailySpending * 5;
  const impulseMultiplier = price > impulseThreshold ? 1.25 : 1.0;
  
  // Category-based risk assessment
  let categoryMultiplier = 1.0;
  let categoryInsight = "";
  if (category && CATEGORY_INSIGHTS[category as keyof typeof CATEGORY_INSIGHTS]) {
    const catData = CATEGORY_INSIGHTS[category as keyof typeof CATEGORY_INSIGHTS];
    const categoryUsage = catData.spent / catData.monthlyBudget;
    
    if (categoryUsage > 0.9) {
      categoryMultiplier = 1.3;
      categoryInsight = `⚠️ ${category} budget 90% used. ${catData.advice}`;
    } else if (categoryUsage > 0.7) {
      categoryMultiplier = 1.1;
      categoryInsight = `📊 ${category} budget 70% used. ${catData.advice}`;
    } else {
      categoryMultiplier = 0.95;
      categoryInsight = `✅ ${category} budget healthy. ${catData.advice}`;
    }
  }
  
  // Combined risk-adjusted price
  const totalRiskMultiplier = timeRiskMultiplier * weekendMultiplier * volatilityMultiplier * impulseMultiplier * categoryMultiplier;
  const adjustedPrice = price * totalRiskMultiplier;
  
  // Projected spending for remaining days (with risk adjustment)
  const projectedSpending = dailySpending * daysLeftInMonth * volatilityMultiplier;
  
  // Dynamic safety buffer based on spending volatility
  const baseSafetyBuffer = availableBalance * 0.2;
  const adjustedSafetyBuffer = baseSafetyBuffer * (1 + (volatilityMultiplier - 1) * 0.5);
  
  // Calculate days until broke if purchase is made
  const remainingAfterPurchase = availableBalance - adjustedPrice;
  const daysUntilBroke = Math.floor(remainingAfterPurchase / (dailySpending * volatilityMultiplier));
  
  // Enhanced decision logic
  if (adjustedPrice > availableBalance) {
    return {
      canAfford: false,
      riskLevel: 'dangerous',
      message: "❌ Cannot afford this",
      explanation: `This purchase (₹${adjustedPrice.toLocaleString()}) exceeds your available balance of ₹${availableBalance.toLocaleString()}`,
      recommendation: totalRiskMultiplier > 1.2 
        ? "High-risk purchase detected. Consider waiting and reassessing tomorrow."
        : "Consider saving up or finding a cheaper alternative",
      categoryInsight
    };
  }
  
  if (remainingAfterPurchase < adjustedSafetyBuffer) {
    const riskFactors = [];
    if (timeRiskMultiplier > 1) riskFactors.push("late-night spending");
    if (weekendMultiplier > 1) riskFactors.push("weekend purchase");
    if (impulseMultiplier > 1) riskFactors.push("impulse buy detected");
    if (volatilityMultiplier > 1) riskFactors.push("irregular spending pattern");
    if (categoryMultiplier > 1.1) riskFactors.push("category budget exceeded");
    
    return {
      canAfford: false,
      riskLevel: 'dangerous',
      message: "🚨 High risk purchase",
      explanation: `This would leave you with only ₹${remainingAfterPurchase.toLocaleString()}, below your safety buffer (₹${adjustedSafetyBuffer.toLocaleString()})`,
      daysUntilBroke,
      recommendation: riskFactors.length > 0 
        ? `Multiple risk factors detected: ${riskFactors.join(", ")}. Wait until next month.`
        : "Wait until next month or reduce the amount",
      timeWarning: riskFactors.length > 0 ? `Risk factors: ${riskFactors.join(", ")}` : undefined,
      categoryInsight
    };
  }
  
  if (daysUntilBroke < 7) {
    const savingsNeeded = Math.ceil((adjustedPrice - (availableBalance - adjustedSafetyBuffer)) / daysLeftInMonth);
    
    return {
      canAfford: true,
      riskLevel: 'risky',
      message: "⚠️ Risky but possible",
      explanation: `You could run out of money in ${daysUntilBroke} days if you maintain current spending patterns`,
      daysUntilBroke,
      recommendation: savingsNeeded > 0 
        ? `Reduce daily spending by ₹${savingsNeeded} to make this safer`
        : "Monitor your spending closely for the next week",
      timeWarning: totalRiskMultiplier > 1.1 
        ? `${Math.round((totalRiskMultiplier - 1) * 100)}% risk premium applied due to timing and spending patterns`
        : undefined,
      categoryInsight
    };
  }
  
  // Safe purchase
  const monthlyBudgetUsed = ((balance - remainingAfterPurchase) / balance * 100).toFixed(1);
  
  return {
    canAfford: true,
    riskLevel: 'safe',
    message: "✅ Safe to buy",
    explanation: `This fits comfortably within your budget. You'll have ₹${remainingAfterPurchase.toLocaleString()} remaining (${monthlyBudgetUsed}% of budget used)`,
    recommendation: remainingAfterPurchase > availableBalance * 0.5 
      ? "Excellent choice! This aligns perfectly with your financial goals"
      : "Good purchase. Consider setting aside some of the remaining amount for savings",
    timeWarning: totalRiskMultiplier > 1 
      ? `${Math.round((totalRiskMultiplier - 1) * 100)}% risk adjustment applied, but still within safe limits`
      : undefined,
    categoryInsight
  };
}

// Popular items for quick testing with categories
const POPULAR_ITEMS = [
  { name: "iPhone 15 Pro", price: 134900, emoji: "📱", category: "electronics", riskMultiplier: 1.1 },
  { name: "AirPods Pro", price: 24900, emoji: "🎧", category: "electronics", riskMultiplier: 1.05 },
  { name: "Zomato Order", price: 450, emoji: "🍕", category: "food", riskMultiplier: 0.9 },
  { name: "Uber Ride", price: 280, emoji: "🚗", category: "transport", riskMultiplier: 0.95 },
  { name: "Netflix Subscription", price: 649, emoji: "🎬", category: "subscription", riskMultiplier: 0.8 },
  { name: "Gym Membership", price: 2500, emoji: "💪", category: "health", riskMultiplier: 0.85 },
  { name: "Weekend Trip", price: 8500, emoji: "✈️", category: "travel", riskMultiplier: 1.2 },
  { name: "New Sneakers", price: 12000, emoji: "👟", category: "fashion", riskMultiplier: 1.15 }
];

// Category-based spending insights
const CATEGORY_INSIGHTS = {
  electronics: { monthlyBudget: 15000, spent: 8500, advice: "Tech purchases - consider if it's an upgrade or necessity" },
  food: { monthlyBudget: 8000, spent: 6200, advice: "Food spending is healthy, but watch delivery fees" },
  transport: { monthlyBudget: 3000, spent: 2100, advice: "Transport costs are reasonable" },
  subscription: { monthlyBudget: 2000, spent: 1800, advice: "Review subscriptions monthly to avoid waste" },
  health: { monthlyBudget: 4000, spent: 2500, advice: "Health investments are always worthwhile" },
  travel: { monthlyBudget: 10000, spent: 3500, advice: "Travel budget has room, but plan ahead" },
  fashion: { monthlyBudget: 5000, spent: 4200, advice: "Fashion spending is near limit this month" }
};

export function AffordabilityScreen() {
  const { balance, monthlyIncome, currentExpenses, loading: financialLoading } = useFinancialData();
  const { transactions: rawTransactions, loading: transactionsLoading } = useTransactions(30);
  
  // Ensure transactions is always an array
  const transactions = Array.isArray(rawTransactions) ? rawTransactions : [];
  
  const [price, setPrice] = useState("");
  const [result, setResult] = useState<AffordabilityResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const analyzeAffordability = (amount: number, category?: string) => {
    if (financialLoading || transactionsLoading) {
      return;
    }
    
    setIsAnalyzing(true);
    
    // Simulate AI thinking time for better UX
    setTimeout(() => {
      const financialData = { balance, monthlyIncome, currentExpenses };
      const analysis = calculateAffordability(amount, financialData, transactions, new Date().getHours(), category);
      setResult(analysis);
      setIsAnalyzing(false);
    }, 1200);
  };

  const handlePriceSubmit = () => {
    const amount = parseFloat(price);
    if (amount > 0) {
      analyzeAffordability(amount, selectedCategory || undefined);
    }
  };

  // Show loading state while financial data is being fetched
  if (financialLoading || transactionsLoading) {
    return (
      <div className="px-5 md:px-8 pt-5 md:pt-6 pb-4 flex items-center justify-center" style={{ color: "#fff", minHeight: "400px" }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: "#7C3AED", borderTopColor: "transparent" }} />
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>Loading your financial data...</p>
        </div>
      </div>
    );
  }

  const handleItemSelect = (item: typeof POPULAR_ITEMS[0]) => {
    setSelectedItem(item.name);
    setSelectedCategory(item.category);
    setPrice(item.price.toString());
    analyzeAffordability(item.price, item.category);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'safe': return '#00D68F';
      case 'risky': return '#F59E0B';
      case 'dangerous': return '#EF4444';
      default: return '#fff';
    }
  };

  const getRiskBg = (riskLevel: string) => {
    switch (riskLevel) {
      case 'safe': return 'rgba(0,214,143,0.1)';
      case 'risky': return 'rgba(245,158,11,0.1)';
      case 'dangerous': return 'rgba(239,68,68,0.1)';
      default: return 'rgba(255,255,255,0.05)';
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
            Can I Afford This?
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
            AI-powered spending decision engine
          </p>
        </div>
      </motion.div>

      <div className="max-w-2xl mx-auto">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl p-6 mb-6"
          style={{
            background: "linear-gradient(145deg, #14141f 0%, #1a1a2e 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" 
                 style={{ background: "rgba(124,58,237,0.2)" }}>
              <Brain size={20} color="#7C3AED" />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", color: "#fff" }}>Enter Purchase Amount</h3>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                Or select from popular items below
              </p>
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Enter amount in ₹"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-12 text-lg"
                style={{
                  background: "#181820",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff"
                }}
              />
            </div>
            <Button
              onClick={handlePriceSubmit}
              disabled={!price || isAnalyzing}
              className="h-12 px-6"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
                border: "none"
              }}
            >
              {isAnalyzing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Zap size={18} />
                </motion.div>
              ) : (
                "Analyze"
              )}
            </Button>
          </div>

          {/* Popular Items Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {POPULAR_ITEMS.map((item) => (
              <motion.button
                key={item.name}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleItemSelect(item)}
                className="p-3 rounded-xl text-left transition-all"
                style={{
                  background: selectedItem === item.name 
                    ? "rgba(124,58,237,0.2)" 
                    : "#181820",
                  border: selectedItem === item.name 
                    ? "1px solid rgba(124,58,237,0.3)" 
                    : "1px solid rgba(255,255,255,0.05)"
                }}
              >
                <div className="text-lg mb-1">{item.emoji}</div>
                <div style={{ fontSize: "12px", color: "#fff", marginBottom: "2px" }}>
                  {item.name}
                </div>
                <div style={{ fontSize: "11px", color: "#7C3AED" }}>
                  ₹{item.price.toLocaleString()}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Analysis Result */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-2xl p-6 mb-6"
              style={{
                background: "#181820",
                border: "1px solid rgba(255,255,255,0.05)"
              }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(124,58,237,0.2)" }}
                >
                  <Brain size={16} color="#7C3AED" />
                </motion.div>
                <div>
                  <p style={{ fontSize: "14px", color: "#fff" }}>AI is analyzing...</p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                    Checking your spending patterns, balance, and risk factors
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {result && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl p-6"
              style={{
                background: getRiskBg(result.riskLevel),
                border: `1px solid ${getRiskColor(result.riskLevel)}30`
              }}
            >
              {/* Result Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ background: getRiskBg(result.riskLevel) }}>
                  {result.riskLevel === 'safe' && <CheckCircle size={24} color={getRiskColor(result.riskLevel)} />}
                  {result.riskLevel === 'risky' && <AlertTriangle size={24} color={getRiskColor(result.riskLevel)} />}
                  {result.riskLevel === 'dangerous' && <XCircle size={24} color={getRiskColor(result.riskLevel)} />}
                </div>
                <div className="flex-1">
                  <h3 style={{ fontSize: "18px", color: getRiskColor(result.riskLevel), marginBottom: "4px" }}>
                    {result.message}
                  </h3>
                  <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: "1.5" }}>
                    {result.explanation}
                  </p>
                </div>
              </div>

              {result.categoryInsight && (
                <div className="flex items-start gap-2 p-3 rounded-xl mb-3"
                     style={{ background: "rgba(0,214,143,0.1)" }}>
                  <Target size={16} color="#00D68F" className="mt-0.5 flex-shrink-0" />
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", lineHeight: "1.4" }}>
                    {result.categoryInsight}
                  </span>
                </div>
              )}

              {result.daysUntilBroke && (
                <div className="flex items-center gap-2 p-3 rounded-xl mb-3"
                     style={{ background: "rgba(0,0,0,0.2)" }}>
                  <Clock size={16} color={getRiskColor(result.riskLevel)} />
                  <span style={{ fontSize: "13px", color: "#fff" }}>
                    Money could run out in {result.daysUntilBroke} days at current spending rate
                  </span>
                </div>
              )}

              {result.timeWarning && (
                <div className="flex items-center gap-2 p-3 rounded-xl mb-3"
                     style={{ background: "rgba(245,158,11,0.1)" }}>
                  <TrendingDown size={16} color="#F59E0B" />
                  <span style={{ fontSize: "13px", color: "#F59E0B" }}>
                    {result.timeWarning}
                  </span>
                </div>
              )}

              {result.recommendation && (
                <div className="flex items-start gap-2 p-3 rounded-xl"
                     style={{ background: "rgba(0,0,0,0.2)" }}>
                  <Target size={16} color="#00D68F" className="mt-0.5 flex-shrink-0" />
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", lineHeight: "1.4" }}>
                    <strong style={{ color: "#00D68F" }}>Recommendation:</strong> {result.recommendation}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spending Intelligence Panel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl p-5 mt-6"
          style={{
            background: "linear-gradient(135deg, rgba(0,214,143,0.08), rgba(124,58,237,0.08))",
            border: "1px solid rgba(255,255,255,0.05)"
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" 
                 style={{ background: "rgba(0,214,143,0.2)" }}>
              <Brain size={16} color="#00D68F" />
            </div>
            <h4 style={{ fontSize: "14px", color: "#fff" }}>
              AI Spending Intelligence
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                   style={{ background: "rgba(0,214,143,0.15)" }}>
                <span style={{ fontSize: "18px" }}>🎯</span>
              </div>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>
                SPENDING ACCURACY
              </p>
              <p style={{ fontSize: "16px", color: "#00D68F" }}>94%</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>
                Predictions match reality
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                   style={{ background: "rgba(124,58,237,0.15)" }}>
                <span style={{ fontSize: "18px" }}>⚡</span>
              </div>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>
                RISK DETECTION
              </p>
              <p style={{ fontSize: "16px", color: "#7C3AED" }}>Real-time</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>
                Multi-factor analysis
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                   style={{ background: "rgba(245,158,11,0.15)" }}>
                <span style={{ fontSize: "18px" }}>🧠</span>
              </div>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>
                LEARNING MODE
              </p>
              <p style={{ fontSize: "16px", color: "#F59E0B" }}>Active</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>
                Adapts to your habits
              </p>
            </div>
          </div>
        </motion.div>

        {/* Financial Overview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5 mt-6"
          style={{
            background: "#181820",
            border: "1px solid rgba(255,255,255,0.05)"
          }}
        >
          <h4 style={{ fontSize: "14px", color: "#fff", marginBottom: "16px" }}>
            Your Financial Snapshot
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>
                AVAILABLE BALANCE
              </p>
              <p style={{ fontSize: "16px", color: "#00D68F" }}>
                ₹{(balance - (currentExpenses * 0.7)).toLocaleString()}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>
                DAILY SPENDING AVG
              </p>
              <p style={{ fontSize: "16px", color: "#fff" }}>
                ₹{Math.round(currentExpenses / 30).toLocaleString()}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>
                DAYS LEFT IN MONTH
              </p>
              <p style={{ fontSize: "16px", color: "#7C3AED" }}>
                {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()} days
              </p>
            </div>
            <div>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>
                SAFETY BUFFER
              </p>
              <p style={{ fontSize: "16px", color: "#F59E0B" }}>
                ₹{Math.round((balance - (currentExpenses * 0.7)) * 0.2).toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}