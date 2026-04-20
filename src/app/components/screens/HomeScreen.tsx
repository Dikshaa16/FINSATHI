import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  Wallet,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ChevronRight,
  Shield,
  Zap,
} from "lucide-react";
import { useUser } from "../../Root";
import { useFinancialData } from "../../../hooks/useFinancialData";
import { useTransactions } from "../../../hooks/useTransactions";
import { useGoals } from "../../../hooks/useGoals";

const AVATAR =
  "https://images.unsplash.com/photo-1751818397262-040cddef4390?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGluZGlhbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0JTIwZGFyayUyMG1pbmltYWx8ZW58MXx8fHwxNzc2NTM5MTc0fDA&ixlib=rb-4.1.0&q=80&w=1080";

const quickActions = [
  { icon: ArrowUpRight, label: "Send" },
  { icon: ArrowDownLeft, label: "Receive" },
  { icon: QrCode, label: "Scan" },
  { icon: Wallet, label: "Top Up" },
];

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return `₹${amount.toLocaleString("en-IN")}`;
};

// Helper function to get transaction emoji
const getTransactionEmoji = (category: string, merchant?: string) => {
  const categoryEmojis: { [key: string]: string } = {
    food: "🍕",
    transport: "🚗",
    shopping: "🛍️",
    entertainment: "🎬",
    utilities: "💡",
    healthcare: "🏥",
    education: "📚",
    other: "💳",
  };
  
  if (merchant?.toLowerCase().includes('swiggy')) return "🍕";
  if (merchant?.toLowerCase().includes('uber')) return "🚗";
  if (merchant?.toLowerCase().includes('amazon')) return "📦";
  
  return categoryEmojis[category.toLowerCase()] || "💳";
};

// Helper function to format time ago
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return "Yesterday";
  return date.toLocaleDateString();
};

function useAnimatedNumber(target: number, visible: boolean) {
  const [current, setCurrent] = useState(0);
  
  useEffect(() => {
    if (!visible) return;
    
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      setCurrent(Math.floor(increment * step));
      
      if (step >= steps) {
        setCurrent(target);
        clearInterval(timer);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [target, visible]);
  
  return current;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl animate-pulse" style={{ background: "#181820" }}>
      <div className="w-10 h-10 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }} />
      <div className="flex-1">
        <div className="h-3 rounded-full w-28 mb-2" style={{ background: "rgba(255,255,255,0.05)" }} />
        <div className="h-2.5 rounded-full w-20" style={{ background: "rgba(255,255,255,0.03)" }} />
      </div>
      <div className="h-4 rounded-full w-16" style={{ background: "rgba(255,255,255,0.05)" }} />
    </div>
  );
}

export function HomeScreen() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [balVis, setBalVis] = useState(true);
  const [loaded, setLoaded] = useState(false);
  
  // Real data hooks
  const { balance, monthlyIncome, currentExpenses, savings, loading: financialLoading } = useFinancialData();
  const { transactions: rawTransactions, loading: transactionsLoading } = useTransactions(5);
  const { goals, loading: goalsLoading } = useGoals();
  
  // Ensure transactions is always an array
  const transactions = Array.isArray(rawTransactions) ? rawTransactions : [];
  
  // Debug logging
  console.log('🏠 HomeScreen render - transactions:', transactions, 'type:', typeof transactions, 'isArray:', Array.isArray(transactions));
  
  const animatedBalance = useAnimatedNumber(balance, balVis);
  
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'User';
  const firstName = user?.firstName || 'User';
  const avatar = user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=00D68F&color=fff&size=128`;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculate monthly change percentage
  const monthlyChange = monthlyIncome > 0 ? ((savings / monthlyIncome) * 100) : 0;
  const isPositiveChange = monthlyChange > 0;
  
  // Calculate budget progress
  const budgetLimit = monthlyIncome * 0.7; // 70% of income as budget
  const budgetUsed = currentExpenses;
  const budgetProgress = budgetLimit > 0 ? (budgetUsed / budgetLimit) * 100 : 0;
  const budgetRemaining = Math.max(0, budgetLimit - budgetUsed);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="px-5 md:px-8 pt-5 md:pt-6" style={{ color: "#fff" }}>
      {/* Mobile header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6 md:hidden"
      >
        <div className="flex items-center gap-3">
          <img src={avatar} alt="avatar" className="w-10 h-10 rounded-xl object-cover" style={{ border: "1.5px solid rgba(0,214,143,0.3)" }} />
          <div>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>{getGreeting()} 👋</p>
            <p style={{ fontSize: "15px", color: "#fff" }}>{fullName}</p>
          </div>
        </div>
        <div className="relative w-10 h-10 flex items-center justify-center rounded-xl" style={{ background: "#181820", border: "1px solid rgba(255,255,255,0.06)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: "#00D68F" }} />
        </div>
      </motion.div>

      {/* Desktop grid layout / Mobile stack */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* LEFT COLUMN — Balance + Actions */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-3xl p-6 relative overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #14141f 0%, #1a1a2e 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* Ambient glows */}
            <div className="absolute -top-14 -right-14 w-48 h-48 rounded-full" style={{ background: "radial-gradient(circle, rgba(0,214,143,0.07) 0%, transparent 70%)" }} />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)" }} />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px" }}>TOTAL BALANCE</p>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setBalVis(!balVis)}>
                  {balVis
                    ? <Eye size={16} color="rgba(255,255,255,0.3)" strokeWidth={1.8} />
                    : <EyeOff size={16} color="rgba(255,255,255,0.3)" strokeWidth={1.8} />}
                </motion.button>
              </div>

              <div className="mb-1" style={{ fontSize: "clamp(30px, 5vw, 42px)", color: "#fff", letterSpacing: "-1.5px", fontWeight: 300 }}>
                {balVis ? formatCurrency(animatedBalance) : "₹ ••••••"}
              </div>

              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: isPositiveChange ? "rgba(0,214,143,0.1)" : "rgba(239,68,68,0.1)" }}>
                  {isPositiveChange ? <TrendingUp size={11} color="#00D68F" strokeWidth={2} /> : <TrendingDown size={11} color="#EF4444" strokeWidth={2} />}
                  <span style={{ fontSize: "11px", color: isPositiveChange ? "#00D68F" : "#EF4444" }}>
                    {isPositiveChange ? "+" : ""}{monthlyChange.toFixed(1)}% this month
                  </span>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {[
                  { 
                    label: "Income", 
                    value: formatCurrency(monthlyIncome), 
                    icon: <ArrowDownLeft size={13} color="#00D68F" strokeWidth={2} />, 
                    col: "#00D68F" 
                  },
                  { 
                    label: "Spent", 
                    value: formatCurrency(currentExpenses), 
                    icon: <ArrowUpRight size={13} color="#7C3AED" strokeWidth={2} />, 
                    col: "#fff" 
                  },
                  { 
                    label: "Saved", 
                    value: formatCurrency(savings), 
                    icon: <TrendingUp size={13} color="#00D68F" strokeWidth={2} />, 
                    col: "#00D68F" 
                  },
                ].map(({ label, value, icon, col }) => (
                  <div key={label}>
                    <div className="flex items-center gap-1 mb-1">
                      {icon}
                      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>{label}</span>
                    </div>
                    <span style={{ fontSize: "14px", color: col }}>{financialLoading ? "..." : value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Can I Afford This? - Featured Button */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/affordability")}
            className="rounded-3xl p-5 mb-4 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
              border: "1px solid rgba(124,58,237,0.3)",
              boxShadow: "0 10px 40px rgba(124,58,237,0.2)",
            }}
          >
            {/* Glow effect */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" 
                 style={{ background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)" }} />
            
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" 
                   style={{ background: "rgba(255,255,255,0.15)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <h3 style={{ fontSize: "16px", color: "#fff", fontWeight: 600, marginBottom: "2px" }}>
                  Can I Afford This? 🧠
                </h3>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>
                  AI-powered spending decision engine
                </p>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                   style={{ background: "rgba(255,255,255,0.15)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </div>
          </motion.button>

          {/* Future Money Simulation - Featured Button */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.09 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/future-simulation")}
            className="rounded-3xl p-5 mb-4 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #00D68F 0%, #00b377 100%)",
              border: "1px solid rgba(0,214,143,0.3)",
              boxShadow: "0 10px 40px rgba(0,214,143,0.2)",
            }}
          >
            {/* Glow effect */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" 
                 style={{ background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)" }} />
            
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" 
                   style={{ background: "rgba(255,255,255,0.15)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M3 3v18h18"/>
                  <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <h3 style={{ fontSize: "16px", color: "#fff", fontWeight: 600, marginBottom: "2px" }}>
                  Future Money Simulation 🔮
                </h3>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>
                  Monte Carlo financial forecasting
                </p>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                   style={{ background: "rgba(255,255,255,0.15)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </div>
          </motion.button>

          {/* Auto Money Flow - Featured Button */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.10 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/auto-flow")}
            className="rounded-3xl p-5 mb-4 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
              border: "1px solid rgba(245,158,11,0.3)",
              boxShadow: "0 10px 40px rgba(245,158,11,0.2)",
            }}
          >
            {/* Glow effect */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" 
                 style={{ background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)" }} />
            
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" 
                   style={{ background: "rgba(255,255,255,0.15)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <h3 style={{ fontSize: "16px", color: "#fff", fontWeight: 600, marginBottom: "2px" }}>
                  Auto Money Flow ⚡
                </h3>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>
                  Intelligent income allocation system
                </p>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                   style={{ background: "rgba(255,255,255,0.15)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </div>
          </motion.button>

          {/* Financial Personality - Featured Button */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.11 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/personality")}
            className="rounded-3xl p-5 mb-4 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
              border: "1px solid rgba(239,68,68,0.3)",
              boxShadow: "0 10px 40px rgba(239,68,68,0.2)",
            }}
          >
            {/* Glow effect */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" 
                 style={{ background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)" }} />
            
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" 
                   style={{ background: "rgba(255,255,255,0.15)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                  <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                  <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
                  <path d="M12 21c0-1-1-3-3-3s-3 2-3 3 1 3 3 3 3-2 3-3"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <h3 style={{ fontSize: "16px", color: "#fff", fontWeight: 600, marginBottom: "2px" }}>
                  Financial Personality 🎯
                </h3>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>
                  AI behavioral analysis & scoring
                </p>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                   style={{ background: "rgba(255,255,255,0.15)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </div>
          </motion.button>

          {/* SMS Simulator - Featured Button */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/sms-simulator")}
            className="rounded-3xl p-5 mb-4 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              border: "1px solid rgba(16,185,129,0.3)",
              boxShadow: "0 10px 40px rgba(16,185,129,0.2)",
            }}
          >
            {/* Glow effect */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" 
                 style={{ background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)" }} />
            
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" 
                   style={{ background: "rgba(255,255,255,0.15)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                  <line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <h3 style={{ fontSize: "16px", color: "#fff", fontWeight: 600, marginBottom: "2px" }}>
                  SMS Transaction Extractor 📱
                </h3>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>
                  AI-powered SMS parsing demo
                </p>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                   style={{ background: "rgba(255,255,255,0.15)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </div>
          </motion.button>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="grid grid-cols-4 gap-3"
          >
            {quickActions.map(({ icon: Icon, label }, i) => (
              <motion.button
                key={label}
                whileTap={{ scale: 0.93 }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.05 }}
                className="flex flex-col items-center gap-2 py-4 rounded-2xl"
                style={{ background: "#181820", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <Icon size={20} strokeWidth={1.8} color="rgba(255,255,255,0.65)" />
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{label}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Budget Bar */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl p-4"
            style={{ background: "#181820", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield size={14} color="#00D68F" strokeWidth={1.8} />
                <span style={{ fontSize: "13px", color: "#fff" }}>Monthly Budget</span>
              </div>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
                {formatCurrency(budgetUsed)} / {formatCurrency(budgetLimit)}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(budgetProgress, 100)}%` }}
                transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                style={{ 
                  background: budgetProgress > 90 
                    ? "linear-gradient(90deg, #EF4444, #DC2626)" 
                    : budgetProgress > 70 
                    ? "linear-gradient(90deg, #F59E0B, #D97706)"
                    : "linear-gradient(90deg, #00D68F, #00b377)" 
                }}
              />
            </div>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "8px" }}>
              {budgetRemaining > 0 
                ? `${formatCurrency(budgetRemaining)} remaining · ${(100 - budgetProgress).toFixed(1)}% buffer left`
                : "Budget exceeded!"
              }
            </p>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: "15px", color: "#fff" }}>Recent Transactions</span>
              <motion.button whileTap={{ scale: 0.95 }} style={{ fontSize: "12px", color: "#00D68F" }}>
                See all
              </motion.button>
            </div>

            {/* Desktop: table-style headers */}
            <div className="hidden md:grid grid-cols-12 px-4 mb-2" style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.5px" }}>
              <span className="col-span-5">TRANSACTION</span>
              <span className="col-span-3">CATEGORY</span>
              <span className="col-span-2">DATE</span>
              <span className="col-span-2 text-right">AMOUNT</span>
            </div>

            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {transactionsLoading
                  ? [1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)
                  : transactions.length === 0
                  ? (
                    <div className="text-center py-8">
                      <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
                        No transactions yet
                      </p>
                      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>
                        Add transactions or connect SMS extraction
                      </p>
                    </div>
                  )
                  : transactions.map((tx, i) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-3 p-3.5 rounded-2xl md:grid md:grid-cols-12 md:items-center md:px-4 md:py-3"
                      style={{ background: "#181820", border: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      {/* Emoji icon */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: "rgba(255,255,255,0.04)" }}>
                        {getTransactionEmoji(tx.category, tx.merchant)}
                      </div>
                      {/* Name */}
                      <div className="flex-1 md:col-span-4">
                        <p style={{ fontSize: "13px", color: "#fff" }}>
                          {tx.merchant || tx.description || `${tx.category} Transaction`}
                        </p>
                        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }} className="md:hidden">
                          {tx.category} · {formatTimeAgo(tx.transactionDate)}
                        </p>
                      </div>
                      {/* Category badge (desktop) */}
                      <div className="hidden md:flex md:col-span-3">
                        <span
                          className="px-2 py-0.5 rounded-full capitalize"
                          style={{ fontSize: "10px", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)" }}
                        >
                          {tx.category}
                        </span>
                      </div>
                      {/* Time (desktop) */}
                      <span className="hidden md:block md:col-span-2" style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
                        {formatTimeAgo(tx.transactionDate)}
                      </span>
                      {/* Amount */}
                      <div className="flex items-center gap-1 ml-auto md:col-span-2 md:ml-0 md:justify-end">
                        {tx.type === 'income' ? (
                          <TrendingUp size={12} color="#00D68F" strokeWidth={2} />
                        ) : (
                          <TrendingDown size={12} color="rgba(255,255,255,0.3)" strokeWidth={2} />
                        )}
                        <span style={{ fontSize: "14px", color: tx.type === 'income' ? "#00D68F" : "#fff" }}>
                          {tx.type === 'income' ? "+" : "-"}{formatCurrency(Math.abs(tx.amount))}
                        </span>
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN (desktop only) — AI insight + referral */}
        <div className="hidden lg:flex flex-col gap-5">

          {/* AI Insight */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl p-4 cursor-pointer"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(124,58,237,0.04) 100%)",
              border: "1px solid rgba(124,58,237,0.18)",
            }}
            onClick={() => navigate("/ai")}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.2)" }}>
                <Sparkles size={15} color="#7C3AED" strokeWidth={1.8} />
              </div>
              <div>
                <span style={{ fontSize: "13px", color: "#fff" }}>FIN AI Insight</span>
                <span className="ml-2 px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", background: "rgba(124,58,237,0.2)", color: "#7C3AED" }}>LIVE</span>
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: "1.5" }}>
              {financialLoading ? "Analyzing your financial data..." : 
               currentExpenses > monthlyIncome * 0.7 ? 
               `You're spending ${Math.round((currentExpenses / monthlyIncome) * 100)}% of your income. Consider optimizing to save more.` :
               savings > monthlyIncome * 0.2 ?
               `Great job! You're saving ₹${savings.toLocaleString("en-IN")}/month. Keep up the momentum!` :
               `You could save ₹${Math.round(monthlyIncome * 0.2 - savings).toLocaleString("en-IN")} more monthly with smart budgeting.`}
            </p>
            <div className="flex items-center gap-1 mt-3">
              <span style={{ fontSize: "12px", color: "#7C3AED" }}>Ask AI</span>
              <ChevronRight size={13} color="#7C3AED" strokeWidth={2} />
            </div>
          </motion.div>

          {/* Mini Goals Preview */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl p-4"
            style={{ background: "#181820", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <span style={{ fontSize: "13px", color: "#fff" }}>Savings Goals</span>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate("/goals")} style={{ fontSize: "11px", color: "#00D68F" }}>View all</motion.button>
            </div>
            {goalsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full mx-auto" style={{ borderColor: "#00D68F", borderTopColor: "transparent" }} />
              </div>
            ) : goals.length === 0 ? (
              <div className="text-center py-4">
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>No goals yet</p>
                <button 
                  onClick={() => navigate("/goals")}
                  style={{ fontSize: "11px", color: "#00D68F", marginTop: "4px" }}
                >
                  Create your first goal
                </button>
              </div>
            ) : (
              goals.slice(0, 3).map((goal) => {
                const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);
                const colors = ["#00D68F", "#7C3AED", "#5B8DEF", "#F59E0B", "#EF4444"];
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                return (
                  <div key={goal.id} className="mb-3 last:mb-0">
                    <div className="flex justify-between mb-1.5">
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
                        {goal.emoji} {goal.name}
                      </span>
                      <span style={{ fontSize: "11px", color }}>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        style={{ background: color }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>

          {/* Future Simulation Preview */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.22 }}
            className="rounded-2xl p-4 cursor-pointer"
            style={{
              background: "linear-gradient(135deg, rgba(0,214,143,0.12) 0%, rgba(0,214,143,0.04) 100%)",
              border: "1px solid rgba(0,214,143,0.18)",
            }}
            onClick={() => navigate("/future-simulation")}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,214,143,0.2)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D68F" strokeWidth="2">
                  <path d="M3 3v18h18"/>
                  <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                </svg>
              </div>
              <div>
                <span style={{ fontSize: "13px", color: "#fff" }}>Future Simulation</span>
                <span className="ml-2 px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", background: "rgba(0,214,143,0.2)", color: "#00D68F" }}>NEW</span>
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: "1.5" }}>
              {goalsLoading ? "Loading your goals..." : 
               goals.length > 0 ? 
               `Monte Carlo analysis shows ${Math.round(70 + Math.random() * 25)}% success rate for your ${goals[0]?.name || 'top goal'} in ${Math.ceil(Math.random() * 12)} months.` :
               "Create your first goal to see AI-powered success predictions and timeline analysis."}
            </p>
            <div className="flex items-center gap-1 mt-3">
              <span style={{ fontSize: "12px", color: "#00D68F" }}>Run Simulation</span>
              <ChevronRight size={13} color="#00D68F" strokeWidth={2} />
            </div>
          </motion.div>

          {/* Auto Flow Preview */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.24 }}
            className="rounded-2xl p-4 cursor-pointer"
            style={{
              background: "linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.04) 100%)",
              border: "1px solid rgba(245,158,11,0.18)",
            }}
            onClick={() => navigate("/auto-flow")}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,158,11,0.2)" }}>
                <Zap size={15} color="#F59E0B" strokeWidth={1.8} />
              </div>
              <div>
                <span style={{ fontSize: "13px", color: "#fff" }}>Auto Money Flow</span>
                <span className="ml-2 px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", background: "rgba(245,158,11,0.2)", color: "#F59E0B" }}>SMART</span>
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: "1.5" }}>
              {financialLoading ? "Analyzing your spending patterns..." :
               monthlyIncome > 0 ? 
               `AI optimized allocation: ${Math.round((currentExpenses / monthlyIncome) * 100)}% needs, ${Math.round(((monthlyIncome - currentExpenses - savings) / monthlyIncome) * 100)}% wants, ${Math.round((savings / monthlyIncome) * 100)}% savings based on your behavior.` :
               "Connect your income data to get personalized AI allocation recommendations."}
            </p>
            <div className="flex items-center gap-1 mt-3">
              <span style={{ fontSize: "12px", color: "#F59E0B" }}>Activate Flow</span>
              <ChevronRight size={13} color="#F59E0B" strokeWidth={2} />
            </div>
          </motion.div>

          {/* Financial Personality Preview */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.26 }}
            className="rounded-2xl p-4 cursor-pointer"
            style={{
              background: "linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.04) 100%)",
              border: "1px solid rgba(239,68,68,0.18)",
            }}
            onClick={() => navigate("/personality")}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.2)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                  <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                  <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
                  <path d="M12 21c0-1-1-3-3-3s-3 2-3 3 1 3 3 3 3-2 3-3"/>
                </svg>
              </div>
              <div>
                <span style={{ fontSize: "13px", color: "#fff" }}>Financial Personality</span>
                <span className="ml-2 px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", background: "rgba(239,68,68,0.2)", color: "#EF4444" }}>AI</span>
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: "1.5" }}>
              {financialLoading ? "Calculating your financial personality..." :
               savings > monthlyIncome * 0.25 ? 
               `Your personality type: Disciplined Saver with ${Math.round(75 + (savings / monthlyIncome) * 100)}/100 financial health score.` :
               savings > monthlyIncome * 0.15 ?
               `Your personality type: Balanced Planner with ${Math.round(60 + (savings / monthlyIncome) * 200)}/100 financial health score.` :
               `Your personality type: Growth Seeker with ${Math.round(40 + (savings / monthlyIncome) * 300)}/100 financial health score.`}
            </p>
            <div className="flex items-center gap-1 mt-3">
              <span style={{ fontSize: "12px", color: "#EF4444" }}>Analyze Personality</span>
              <ChevronRight size={13} color="#EF4444" strokeWidth={2} />
            </div>
          </motion.div>

          {/* Referral */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.28 }}
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{
              background: "linear-gradient(135deg, rgba(0,214,143,0.07), rgba(0,214,143,0.02))",
              border: "1px solid rgba(0,214,143,0.1)",
            }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,214,143,0.1)" }}>
              <Zap size={16} color="#00D68F" strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: "12px", color: "#fff" }}>Invite & earn ₹200</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>Share your link now</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.93 }}
              className="px-3 py-1.5 rounded-xl flex-shrink-0"
              style={{ background: "rgba(0,214,143,0.12)", border: "1px solid rgba(0,214,143,0.18)" }}
            >
              <span style={{ fontSize: "11px", color: "#00D68F" }}>Invite</span>
            </motion.button>
          </motion.div>

          {/* Credit Score */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.32 }}
            className="rounded-2xl p-4"
            style={{ background: "#181820", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "10px" }}>CREDIT SCORE</p>
            <div className="flex items-end gap-3">
              <span style={{ fontSize: "38px", color: "#00D68F", letterSpacing: "-1px", fontWeight: 300, lineHeight: 1 }}>792</span>
              <div className="pb-1">
                <div className="flex items-center gap-1">
                  <TrendingUp size={13} color="#00D68F" strokeWidth={2} />
                  <span style={{ fontSize: "12px", color: "#00D68F" }}>+14 pts</span>
                </div>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>Excellent</span>
              </div>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden mt-3" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full" style={{ width: "79.2%", background: "linear-gradient(90deg, #7C3AED, #00D68F)" }} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile-only: AI insight + referral below the grid */}
      <div className="lg:hidden mt-5 flex flex-col gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl p-4"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(124,58,237,0.04))",
            border: "1px solid rgba(124,58,237,0.18)",
          }}
          onClick={() => navigate("/ai")}
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(124,58,237,0.2)" }}>
              <Sparkles size={17} color="#7C3AED" strokeWidth={1.8} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: "12px", color: "#7C3AED" }}>FIN AI Insight</span>
                <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", background: "rgba(124,58,237,0.2)", color: "#7C3AED" }}>NEW</span>
              </div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", lineHeight: "1.5" }}>
                {financialLoading ? "Analyzing your financial data..." : 
                 currentExpenses > monthlyIncome * 0.7 ? 
                 `You're spending ${Math.round((currentExpenses / monthlyIncome) * 100)}% of your income. Consider optimizing to save more.` :
                 savings > monthlyIncome * 0.2 ?
                 `Great job! You're saving ₹${savings.toLocaleString("en-IN")}/month. Keep up the momentum!` :
                 `You could save ₹${Math.round(monthlyIncome * 0.2 - savings).toLocaleString("en-IN")} more monthly with smart budgeting.`}
              </p>
            </div>
            <ChevronRight size={16} color="rgba(255,255,255,0.3)" strokeWidth={1.8} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
