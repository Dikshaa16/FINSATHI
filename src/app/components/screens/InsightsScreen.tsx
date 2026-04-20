import { useState } from "react";
import { motion } from "motion/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown, Calendar, ArrowUpRight } from "lucide-react";

const periods = ["1W", "1M", "3M", "6M"];

const spendData: Record<string, { label: string; value: number; income: number }[]> = {
  "1W": [
    { label: "Mon", value: 1200, income: 0 },
    { label: "Tue", value: 800, income: 0 },
    { label: "Wed", value: 2100, income: 0 },
    { label: "Thu", value: 450, income: 85000 },
    { label: "Fri", value: 3200, income: 0 },
    { label: "Sat", value: 1800, income: 0 },
    { label: "Sun", value: 900, income: 0 },
  ],
  "1M": [
    { label: "W1", value: 8400, income: 85000 },
    { label: "W2", value: 6200, income: 15000 },
    { label: "W3", value: 9800, income: 0 },
    { label: "W4", value: 7650, income: 0 },
  ],
  "3M": [
    { label: "Feb", value: 28000, income: 85000 },
    { label: "Mar", value: 31200, income: 100000 },
    { label: "Apr", value: 32450, income: 85000 },
  ],
  "6M": [
    { label: "Nov", value: 27000, income: 85000 },
    { label: "Dec", value: 34000, income: 95000 },
    { label: "Jan", value: 29500, income: 85000 },
    { label: "Feb", value: 28000, income: 85000 },
    { label: "Mar", value: 31200, income: 100000 },
    { label: "Apr", value: 32450, income: 85000 },
  ],
};

const categories = [
  { name: "Rent", amount: 12000, pct: 37, color: "#7C3AED", emoji: "🏠" },
  { name: "Food", amount: 8430, pct: 26, color: "#00D68F", emoji: "🍕" },
  { name: "Shopping", amount: 5200, pct: 16, color: "#5B8DEF", emoji: "🛍️" },
  { name: "Transport", amount: 2100, pct: 6, color: "#F59E0B", emoji: "🚗" },
  { name: "Others", amount: 4720, pct: 15, color: "rgba(255,255,255,0.4)", emoji: "💡" },
];

const monthlyComparison = [
  { month: "Jan", amount: 29500 },
  { month: "Feb", amount: 28000 },
  { month: "Mar", amount: 31200 },
  { month: "Apr", amount: 32450 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="px-3 py-2 rounded-xl" style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.08)" }}>
        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>{label}</p>
        <p style={{ fontSize: "14px", color: "#00D68F" }}>₹{payload[0].value.toLocaleString("en-IN")}</p>
      </div>
    );
  }
  return null;
};

export function InsightsScreen() {
  const [period, setPeriod] = useState<keyof typeof spendData>("1M");
  const data = spendData[period];

  return (
    <div className="px-5 md:px-8 pt-5 md:pt-6 pb-4" style={{ color: "#fff" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p style={{ fontSize: "22px", color: "#fff" }}>Insights</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>Your spending analysis</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "#181820", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Calendar size={13} color="rgba(255,255,255,0.4)" strokeWidth={1.8} />
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>April 2026</span>
          </div>
        </div>
      </motion.div>

      {/* Desktop grid / Mobile stack */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* LEFT — Charts */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Top stats */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            {[
              { label: "Total Spent", value: "₹32,450", sub: "+8.2% vs last month", color: "#fff", icon: <TrendingDown size={13} color="#7C3AED" strokeWidth={2} />, bg: "rgba(124,58,237,0.06)", border: "rgba(124,58,237,0.1)" },
              { label: "Total Income", value: "₹1,00,000", sub: "+17.6% vs last month", color: "#00D68F", icon: <TrendingUp size={13} color="#00D68F" strokeWidth={2} />, bg: "rgba(0,214,143,0.06)", border: "rgba(0,214,143,0.1)" },
              { label: "Net Savings", value: "₹52,550", sub: "61.8% of income", color: "#00D68F", icon: <TrendingUp size={13} color="#00D68F" strokeWidth={2} />, bg: "rgba(0,214,143,0.04)", border: "rgba(0,214,143,0.08)" },
              { label: "Investments", value: "₹15,000", sub: "SIP this month", color: "#5B8DEF", icon: <ArrowUpRight size={13} color="#5B8DEF" strokeWidth={2} />, bg: "rgba(91,141,239,0.06)", border: "rgba(91,141,239,0.1)" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-2xl"
                style={{ background: stat.bg, border: `1px solid ${stat.border}` }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  {stat.icon}
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>{stat.label}</span>
                </div>
                <p style={{ fontSize: "18px", color: stat.color, letterSpacing: "-0.5px" }}>{stat.value}</p>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: "3px" }}>{stat.sub}</p>
              </div>
            ))}
          </motion.div>

          {/* Spending Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-5"
            style={{ background: "#181820", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p style={{ fontSize: "14px", color: "#fff" }}>Spending Trend</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>Track your expenses over time</p>
              </div>
              <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                {periods.map((p) => (
                  <motion.button
                    key={p}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setPeriod(p as keyof typeof spendData)}
                    className="px-2.5 py-1.5 rounded-lg"
                    style={{
                      background: period === p ? "#181820" : "transparent",
                      border: period === p ? "1px solid rgba(0,214,143,0.2)" : "1px solid transparent",
                    }}
                  >
                    <span style={{ fontSize: "11px", color: period === p ? "#00D68F" : "rgba(255,255,255,0.35)" }}>{p}</span>
                  </motion.button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D68F" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00D68F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#00D68F" strokeWidth={2} fill="url(#grad1)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Monthly comparison bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl p-5"
            style={{ background: "#181820", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="mb-4">
              <p style={{ fontSize: "14px", color: "#fff" }}>Monthly Comparison</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>Last 4 months spending</p>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={monthlyComparison} margin={{ top: 5, right: 0, left: -25, bottom: 0 }} barSize={36}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {monthlyComparison.map((entry, i) => (
                    <Cell key={`bar-cell-${entry.month}`} fill={i === monthlyComparison.length - 1 ? "#00D68F" : "rgba(255,255,255,0.08)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* RIGHT — Category breakdown */}
        <div className="flex flex-col gap-5">
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl p-5"
            style={{ background: "#181820", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="mb-4">
              <p style={{ fontSize: "14px", color: "#fff" }}>By Category</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>April 2026 breakdown</p>
            </div>

            {/* Donut visualization */}
            <div className="flex items-center justify-center mb-5">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {categories.reduce((acc, cat, i) => {
                    const circumference = 2 * Math.PI * 38;
                    const dashArray = (cat.pct / 100) * circumference;
                    const dashOffset = acc.offset;
                    acc.elements.push(
                      <circle
                        key={cat.name}
                        cx="50" cy="50" r="38"
                        fill="none"
                        stroke={cat.color}
                        strokeWidth="12"
                        strokeDasharray={`${dashArray} ${circumference}`}
                        strokeDashoffset={-dashOffset}
                        strokeLinecap="round"
                      />
                    );
                    acc.offset += dashArray;
                    return acc;
                  }, { elements: [] as React.ReactNode[], offset: 0 }).elements}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span style={{ fontSize: "17px", color: "#fff", letterSpacing: "-0.5px" }}>₹32k</span>
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>total</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="flex items-center gap-2.5"
                >
                  <span style={{ fontSize: "16px" }}>{cat.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>{cat.name}</span>
                      <span style={{ fontSize: "12px", color: "#fff" }}>₹{cat.amount.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.pct}%` }}
                        transition={{ duration: 0.9, delay: 0.25 + i * 0.06, ease: "easeOut" }}
                        style={{ background: cat.color }}
                      />
                    </div>
                  </div>
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", minWidth: "28px", textAlign: "right" }}>{cat.pct}%</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Top merchant */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl p-5"
            style={{ background: "#181820", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <p style={{ fontSize: "14px", color: "#fff", marginBottom: "12px" }}>Top Merchants</p>
            {[
              { name: "Swiggy", amount: "₹4,200", pct: 50, emoji: "🍕" },
              { name: "Amazon", amount: "₹3,800", pct: 45, emoji: "📦" },
              { name: "Netflix", amount: "₹1,300", pct: 15, emoji: "🎬" },
            ].map((m, i) => (
              <div key={m.name} className="flex items-center gap-3 mb-3 last:mb-0">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{ background: "rgba(255,255,255,0.04)" }}>{m.emoji}</div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>{m.name}</span>
                    <span style={{ fontSize: "12px", color: "#fff" }}>{m.amount}</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${m.pct}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }}
                      style={{ background: "rgba(255,255,255,0.2)" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}