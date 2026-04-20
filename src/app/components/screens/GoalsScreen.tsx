import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Target, Plus, CheckCircle2, Clock, TrendingUp, Zap, X } from "lucide-react";

interface Goal {
  id: number;
  name: string;
  emoji: string;
  current: number;
  target: number;
  deadline: string;
  color: string;
  monthlyContrib: number;
  status: "active" | "completed" | "paused";
}

const initialGoals: Goal[] = [
  { id: 1, name: "Emergency Fund", emoji: "🛡️", current: 45000, target: 100000, deadline: "Dec 2026", color: "#00D68F", monthlyContrib: 8000, status: "active" },
  { id: 2, name: "Goa Trip", emoji: "✈️", current: 8500, target: 15000, deadline: "Jun 2026", color: "#7C3AED", monthlyContrib: 3250, status: "active" },
  { id: 3, name: "MacBook Pro", emoji: "💻", current: 22000, target: 80000, deadline: "Mar 2027", color: "#5B8DEF", monthlyContrib: 5000, status: "active" },
  { id: 4, name: "Marriage Fund", emoji: "💍", current: 150000, target: 500000, deadline: "Dec 2028", color: "#F59E0B", monthlyContrib: 12000, status: "active" },
  { id: 5, name: "New Phone", emoji: "📱", current: 60000, target: 60000, deadline: "Apr 2026", color: "#10B981", monthlyContrib: 0, status: "completed" },
];

function GoalCard({ goal }: { goal: Goal }) {
  const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100);
  const remaining = goal.target - goal.current;
  const isComplete = goal.status === "completed";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: "#181820",
        border: `1px solid ${isComplete ? "rgba(0,214,143,0.15)" : "rgba(255,255,255,0.05)"}`,
      }}
    >
      {/* Subtle glow for active goals */}
      {!isComplete && (
        <div
          className="absolute -top-8 -right-8 w-24 h-24 rounded-full"
          style={{ background: `radial-gradient(circle, ${goal.color}10 0%, transparent 70%)` }}
        />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
              style={{ background: `${goal.color}12`, border: `1px solid ${goal.color}20` }}
            >
              {goal.emoji}
            </div>
            <div>
              <p style={{ fontSize: "14px", color: "#fff" }}>{goal.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isComplete
                  ? <CheckCircle2 size={11} color="#00D68F" strokeWidth={2} />
                  : <Clock size={11} color="rgba(255,255,255,0.3)" strokeWidth={1.8} />
                }
                <span style={{ fontSize: "11px", color: isComplete ? "#00D68F" : "rgba(255,255,255,0.35)" }}>
                  {isComplete ? "Goal reached! 🎉" : `By ${goal.deadline}`}
                </span>
              </div>
            </div>
          </div>
          <div
            className="px-2 py-0.5 rounded-full"
            style={{
              background: `${goal.color}15`,
              border: `1px solid ${goal.color}25`,
            }}
          >
            <span style={{ fontSize: "12px", color: goal.color, fontWeight: 500 }}>{pct}%</span>
          </div>
        </div>

        {/* Amounts */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <span style={{ fontSize: "22px", color: "#fff", letterSpacing: "-0.5px", fontWeight: 300 }}>
              ₹{goal.current.toLocaleString("en-IN")}
            </span>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginLeft: "6px" }}>
              / ₹{goal.target.toLocaleString("en-IN")}
            </span>
          </div>
          {!isComplete && (
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
              ₹{remaining.toLocaleString("en-IN")} left
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-2.5 rounded-full overflow-hidden mb-4" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div
            className="h-full rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            style={{ background: isComplete ? "#00D68F" : goal.color }}
          >
            {!isComplete && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full" style={{ background: "#fff", boxShadow: `0 0 6px ${goal.color}` }} />
            )}
          </motion.div>
        </div>

        {/* Footer */}
        {!isComplete ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap size={12} color="rgba(255,255,255,0.3)" strokeWidth={1.8} />
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                Auto-saving ₹{goal.monthlyContrib.toLocaleString("en-IN")}/mo
              </span>
            </div>
            <motion.button
              whileTap={{ scale: 0.93 }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl"
              style={{ background: `${goal.color}12`, border: `1px solid ${goal.color}20` }}
            >
              <TrendingUp size={12} color={goal.color} strokeWidth={2} />
              <span style={{ fontSize: "11px", color: goal.color }}>Add</span>
            </motion.button>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "rgba(0,214,143,0.07)", border: "1px solid rgba(0,214,143,0.12)" }}
          >
            <CheckCircle2 size={14} color="#00D68F" strokeWidth={2} />
            <span style={{ fontSize: "12px", color: "#00D68F" }}>Completed — Great work, Aryan! 🎊</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function NewGoalModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const emojis = ["🏠", "✈️", "💻", "📱", "🎓", "💍", "🛡️", "🚗", "🎮", "💰"];
  const [selEmoji, setSelEmoji] = useState("🎯");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-6"
        style={{ background: "#121219", border: "1px solid rgba(255,255,255,0.07)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <p style={{ fontSize: "18px", color: "#fff" }}>New Goal</p>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }}>
            <X size={16} color="rgba(255,255,255,0.5)" />
          </motion.button>
        </div>

        <div className="mb-4">
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginBottom: "10px" }}>CHOOSE EMOJI</p>
          <div className="flex flex-wrap gap-2">
            {emojis.map((e) => (
              <motion.button
                key={e}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelEmoji(e)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{
                  background: selEmoji === e ? "rgba(0,214,143,0.12)" : "rgba(255,255,255,0.04)",
                  border: selEmoji === e ? "1px solid rgba(0,214,143,0.25)" : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {e}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>GOAL NAME</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Vacation to Bali"
            className="w-full px-4 py-3 rounded-2xl outline-none"
            style={{ background: "#181820", border: "1px solid rgba(255,255,255,0.07)", fontSize: "14px", color: "#fff" }}
          />
        </div>

        <div className="mb-6">
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>TARGET AMOUNT</p>
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl" style={{ background: "#181820", border: "1px solid rgba(255,255,255,0.07)" }}>
            <span style={{ fontSize: "18px", color: "rgba(255,255,255,0.3)" }}>₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: "20px", color: "#fff" }}
            />
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onClose}
          className="w-full py-4 rounded-2xl"
          style={{ background: name && amount ? "#00D68F" : "rgba(255,255,255,0.06)" }}
        >
          <span style={{ fontSize: "15px", color: name && amount ? "#000" : "rgba(255,255,255,0.3)", fontWeight: 500 }}>
            Create Goal
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export function GoalsScreen() {
  const [goals] = useState<Goal[]>(initialGoals);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [showNewGoal, setShowNewGoal] = useState(false);

  const filtered = goals.filter((g) =>
    filter === "all" ? true : filter === "active" ? g.status === "active" : g.status === "completed"
  );

  const totalSaved = goals.reduce((s, g) => s + g.current, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const overallPct = Math.round((totalSaved / totalTarget) * 100);

  return (
    <div className="px-5 md:px-8 pt-5 md:pt-6 pb-4" style={{ color: "#fff" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <p style={{ fontSize: "22px", color: "#fff" }}>Goals</p>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>Track your savings targets</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setShowNewGoal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{ background: "rgba(0,214,143,0.1)", border: "1px solid rgba(0,214,143,0.18)" }}
        >
          <Plus size={15} color="#00D68F" strokeWidth={2} />
          <span style={{ fontSize: "13px", color: "#00D68F" }}>New Goal</span>
        </motion.button>
      </motion.div>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl p-5 mb-5"
        style={{
          background: "linear-gradient(135deg, rgba(0,214,143,0.08) 0%, rgba(0,214,143,0.02) 100%)",
          border: "1px solid rgba(0,214,143,0.12)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px" }}>TOTAL SAVED</p>
            <p style={{ fontSize: "28px", color: "#00D68F", letterSpacing: "-1px", fontWeight: 300, marginTop: "2px" }}>
              ₹{totalSaved.toLocaleString("en-IN")}
            </p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>
              of ₹{totalTarget.toLocaleString("en-IN")} target · {overallPct}% done
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p style={{ fontSize: "20px", color: "#fff" }}>{goals.filter((g) => g.status === "active").length}</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>Active</p>
            </div>
            <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="text-center">
              <p style={{ fontSize: "20px", color: "#00D68F" }}>{goals.filter((g) => g.status === "completed").length}</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>Done</p>
            </div>
          </div>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallPct}%` }}
            transition={{ duration: 1.3, delay: 0.3, ease: "easeOut" }}
            style={{ background: "linear-gradient(90deg, #00D68F, #00b377)" }}
          />
        </div>
      </motion.div>

      {/* Filter tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 mb-5"
      >
        {(["all", "active", "completed"] as const).map((f) => (
          <motion.button
            key={f}
            whileTap={{ scale: 0.93 }}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl capitalize"
            style={{
              background: filter === f ? "rgba(0,214,143,0.1)" : "#181820",
              border: filter === f ? "1px solid rgba(0,214,143,0.2)" : "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <span style={{ fontSize: "12px", color: filter === f ? "#00D68F" : "rgba(255,255,255,0.45)" }}>
              {f === "all" ? "All Goals" : f === "active" ? "Active" : "Completed"}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Goal cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </AnimatePresence>
      </div>

      {/* New Goal modal */}
      <AnimatePresence>
        {showNewGoal && <NewGoalModal onClose={() => setShowNewGoal(false)} />}
      </AnimatePresence>
    </div>
  );
}
