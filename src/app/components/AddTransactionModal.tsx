import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingBag, Coffee, Car, Home, Zap, Briefcase, TrendingUp, MoreHorizontal } from "lucide-react";

const categories = [
  { icon: Coffee, label: "Food", color: "#F59E0B" },
  { icon: ShoppingBag, label: "Shopping", color: "#7C3AED" },
  { icon: Car, label: "Transport", color: "#3B82F6" },
  { icon: Home, label: "Rent", color: "#EC4899" },
  { icon: Zap, label: "Utilities", color: "#10B981" },
  { icon: Briefcase, label: "Income", color: "#00D68F" },
  { icon: TrendingUp, label: "Invest", color: "#6366F1" },
  { icon: MoreHorizontal, label: "Other", color: "rgba(255,255,255,0.4)" },
];

const types = ["Expense", "Income", "Transfer"];

interface Props {
  onClose: () => void;
}

export function AddTransactionModal({ onClose }: Props) {
  const [amount, setAmount] = useState("");
  const [selectedCat, setSelectedCat] = useState("Food");
  const [selectedType, setSelectedType] = useState("Expense");
  const [note, setNote] = useState("");
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!amount) return;
    setAdded(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="w-full md:max-w-md rounded-t-3xl md:rounded-3xl overflow-hidden"
          style={{ background: "#121219", border: "1px solid rgba(255,255,255,0.07)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle (mobile) */}
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
          </div>

          <div className="px-6 pt-4 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <p style={{ fontSize: "18px", color: "#fff" }}>Add Transaction</p>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <X size={16} color="rgba(255,255,255,0.5)" strokeWidth={2} />
              </motion.button>
            </div>

            {/* Type tabs */}
            <div
              className="flex items-center gap-1 p-1 rounded-2xl mb-5"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              {types.map((t) => (
                <motion.button
                  key={t}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedType(t)}
                  className="flex-1 py-2 rounded-xl"
                  style={{
                    background: selectedType === t ? "#181820" : "transparent",
                    border: selectedType === t ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      color: selectedType === t ? "#fff" : "rgba(255,255,255,0.35)",
                    }}
                  >
                    {t}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Amount input */}
            <div className="mb-5">
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>
                AMOUNT
              </p>
              <div
                className="flex items-center gap-2 px-4 py-4 rounded-2xl"
                style={{
                  background: "#181820",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <span style={{ fontSize: "22px", color: "rgba(255,255,255,0.4)" }}>₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-transparent outline-none"
                  style={{ fontSize: "28px", color: "#fff", letterSpacing: "-1px" }}
                  autoFocus
                />
              </div>
            </div>

            {/* Category */}
            <div className="mb-5">
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginBottom: "10px" }}>
                CATEGORY
              </p>
              <div className="grid grid-cols-4 gap-2">
                {categories.map(({ icon: Icon, label, color }) => (
                  <motion.button
                    key={label}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setSelectedCat(label)}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-2xl"
                    style={{
                      background: selectedCat === label ? `${color}18` : "rgba(255,255,255,0.03)",
                      border: selectedCat === label
                        ? `1px solid ${color}40`
                        : "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <Icon
                      size={17}
                      strokeWidth={1.8}
                      color={selectedCat === label ? color : "rgba(255,255,255,0.35)"}
                    />
                    <span
                      style={{
                        fontSize: "10px",
                        color: selectedCat === label ? color : "rgba(255,255,255,0.35)",
                      }}
                    >
                      {label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="mb-6">
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>
                NOTE (OPTIONAL)
              </p>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What was this for?"
                className="w-full px-4 py-3 rounded-2xl outline-none"
                style={{
                  background: "#181820",
                  border: "1px solid rgba(255,255,255,0.07)",
                  fontSize: "13px",
                  color: "#fff",
                }}
              />
            </div>

            {/* Add button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAdd}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
              style={{
                background: added
                  ? "rgba(0,214,143,0.15)"
                  : amount
                  ? "#00D68F"
                  : "rgba(255,255,255,0.06)",
                border: added ? "1px solid rgba(0,214,143,0.3)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              {added ? (
                <span style={{ fontSize: "15px", color: "#00D68F" }}>✓ Added Successfully</span>
              ) : (
                <span
                  style={{
                    fontSize: "15px",
                    color: amount ? "#000" : "rgba(255,255,255,0.3)",
                    fontWeight: 500,
                  }}
                >
                  Add {selectedType}
                </span>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
