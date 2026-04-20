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

const AVATAR =
  "https://images.unsplash.com/photo-1751818397262-040cddef4390?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGluZGlhbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0JTIwZGFyayUyMG1pbmltYWx8ZW58MXx8fHwxNzc2NTM5MTc0fDA&ixlib=rb-4.1.0&q=80&w=1080";

const quickActions = [
  { icon: ArrowUpRight, label: "Send" },
  { icon: ArrowDownLeft, label: "Receive" },
  { icon: QrCode, label: "Scan" },
  { icon: Wallet, label: "Top Up" },
];

const transactions = [
  { id: 1, name: "Swiggy", cat: "Food", amount: -349, time: "2h ago", emoji: "🍕", credit: false },
  { id: 2, name: "Salary Credit", cat: "Income", amount: 85000, time: "Yesterday", emoji: "💼", credit: true },
  { id: 3, name: "Netflix", cat: "Subscription", amount: -649, time: "Apr 15", emoji: "🎬", credit: false },
  { id: 4, name: "Zepto", cat: "Groceries", amount: -823, time: "Apr 14", emoji: "🛒", credit: false },
  { id: 5, name: "Freelance", cat: "Income", amount: 15000, time: "Apr 12", emoji: "💻", credit: true },
  { id: 6, name: "Ola Cab", cat: "Transport", amount: -285, time: "Apr 11", emoji: "🚗", credit: false },
];

function useAnimatedNumber(target: number, visible: boolean, duration = 1200) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!visible) { setValue(0); return; }
    const start = performance.now();
    const animate = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.floor(eased * target));
      if (p < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, visible, duration]);

  return value;
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
  const navigate = useNavigate();
  const [balVis, setBalVis] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const balance = useAnimatedNumber(124350, balVis);

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
          <img src={AVATAR} alt="avatar" className="w-10 h-10 rounded-xl object-cover" style={{ border: "1.5px solid rgba(0,214,143,0.3)" }} />
          <div>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>Good morning 👋</p>
            <p style={{ fontSize: "15px", color: "#fff" }}>Aryan Sharma</p>
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
                {balVis ? `₹${balance.toLocaleString("en-IN")}` : "₹ ••••••"}
              </div>

              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(0,214,143,0.1)" }}>
                  <TrendingUp size={11} color="#00D68F" strokeWidth={2} />
                  <span style={{ fontSize: "11px", color: "#00D68F" }}>+12.4% this month</span>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {[
                  { label: "Income", value: "₹85,000", icon: <ArrowDownLeft size={13} color="#00D68F" strokeWidth={2} />, col: "#00D68F" },
                  { label: "Spent", value: "₹32,450", icon: <ArrowUpRight size={13} color="#7C3AED" strokeWidth={2} />, col: "#fff" },
                  { label: "Saved", value: "₹52,550", icon: <TrendingUp size={13} color="#00D68F" strokeWidth={2} />, col: "#00D68F" },
                ].map(({ label, value, icon, col }) => (
                  <div key={label}>
                    <div className="flex items-center gap-1 mb-1">
                      {icon}
                      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>{label}</span>
                    </div>
                    <span style={{ fontSize: "14px", color: col }}>{value}</span>
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
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>₹32,450 / ₹50,000</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "64.9%" }}
                transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                style={{ background: "linear-gradient(90deg, #00D68F, #00b377)" }}
              />
            </div>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "8px" }}>
              ₹17,550 remaining · 35.1% buffer left
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
                {!loaded
                  ? [1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)
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
                        {tx.emoji}
                      </div>
                      {/* Name */}
                      <div className="flex-1 md:col-span-4">
                        <p style={{ fontSize: "13px", color: "#fff" }}>{tx.name}</p>
                        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }} className="md:hidden">{tx.cat} · {tx.time}</p>
                      </div>
                      {/* Category badge (desktop) */}
                      <div className="hidden md:flex md:col-span-3">
                        <span
                          className="px-2 py-0.5 rounded-full"
                          style={{ fontSize: "10px", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)" }}
                        >{tx.cat}</span>
                      </div>
                      {/* Time (desktop) */}
                      <span className="hidden md:block md:col-span-2" style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>{tx.time}</span>
                      {/* Amount */}
                      <div className="flex items-center gap-1 ml-auto md:col-span-2 md:ml-0 md:justify-end">
                        {tx.credit ? <TrendingUp size={12} color="#00D68F" strokeWidth={2} /> : <TrendingDown size={12} color="rgba(255,255,255,0.3)" strokeWidth={2} />}
                        <span style={{ fontSize: "14px", color: tx.credit ? "#00D68F" : "#fff" }}>
                          {tx.credit ? "+" : ""}{tx.amount < 0 ? `-₹${Math.abs(tx.amount)}` : `₹${tx.amount.toLocaleString("en-IN")}`}
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
              You're spending 23% more on food this month. Switch to meal prep and save ₹2,400.
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
            {[
              { name: "Emergency Fund", cur: 45000, total: 100000, color: "#00D68F" },
              { name: "Goa Trip ✈️", cur: 8500, total: 15000, color: "#7C3AED" },
              { name: "MacBook Pro", cur: 22000, total: 80000, color: "#5B8DEF" },
            ].map((g) => {
              const pct = Math.round((g.cur / g.total) * 100);
              return (
                <div key={g.name} className="mb-3 last:mb-0">
                  <div className="flex justify-between mb-1.5">
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>{g.name}</span>
                    <span style={{ fontSize: "11px", color: g.color }}>{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                      style={{ background: g.color }}
                    />
                  </div>
                </div>
              );
            })}
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
              Monte Carlo analysis shows 87% success rate for your iPhone goal in 6 months.
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
              AI optimized your allocation: 50% needs, 25% wants, 25% savings based on behavior.
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
              Your personality type: Balanced Planner with 73/100 financial health score.
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
                You're spending 23% more on food this month. Switch to meal prep and save ₹2,400.
              </p>
            </div>
            <ChevronRight size={16} color="rgba(255,255,255,0.3)" strokeWidth={1.8} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
