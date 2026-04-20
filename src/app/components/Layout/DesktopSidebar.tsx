import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Home, BarChart2, Target, MessageSquare, Plus, Sparkles } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: BarChart2, label: "Insights", path: "/insights" },
  { icon: Target, label: "Goals", path: "/goals" },
  { icon: MessageSquare, label: "AI Chat", path: "/ai" },
];

interface Props {
  onAdd: () => void;
  onLogout?: () => void;
}

export function DesktopSidebar({ onAdd, onLogout }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div
      className="fixed left-0 top-0 h-screen w-[240px] flex flex-col z-40"
      style={{
        background: "#0D0D14",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Logo */}
      <div className="px-6 py-6 mb-2">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #00D68F, #00b377)",
              boxShadow: "0 4px 15px rgba(0,214,143,0.3)",
            }}
          >
            <Sparkles size={17} color="#000" strokeWidth={2} />
          </div>
          <div>
            <p style={{ fontSize: "16px", color: "#fff", letterSpacing: "-0.3px" }}>
              FINSathi
            </p>
            <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.5px" }}>
              AI FINANCIAL ASSISTANT
            </p>
          </div>
        </div>
      </div>

      {/* Nav label */}
      <p className="px-6 mb-2" style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.8px" }}>
        MENU
      </p>

      {/* Nav items */}
      <nav className="flex-1 px-3 flex flex-col gap-1">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <motion.button
              key={path}
              onClick={() => navigate(path)}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl relative text-left"
              style={{
                background: isActive ? "rgba(0,214,143,0.08)" : "transparent",
                border: isActive
                  ? "1px solid rgba(0,214,143,0.12)"
                  : "1px solid transparent",
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                  style={{ background: "#00D68F" }}
                />
              )}
              <Icon
                size={18}
                strokeWidth={1.8}
                color={isActive ? "#00D68F" : "rgba(255,255,255,0.4)"}
              />
              <span
                style={{
                  fontSize: "13px",
                  color: isActive ? "#00D68F" : "rgba(255,255,255,0.55)",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {label}
              </span>
            </motion.button>
          );
        })}

        {/* Divider */}
        <div className="my-3 mx-3" style={{ height: "1px", background: "rgba(255,255,255,0.05)" }} />

        {/* Add Transaction */}
        <motion.button
          onClick={onAdd}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl"
          style={{
            background: "rgba(0,214,143,0.1)",
            border: "1px solid rgba(0,214,143,0.15)",
          }}
        >
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: "#00D68F" }}
          >
            <Plus size={14} color="#000" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: "13px", color: "#00D68F" }}>
            Add Transaction
          </span>
        </motion.button>
      </nav>

      {/* Bottom profile */}
      <div className="px-3 mb-4 space-y-2">
        {onLogout && (
          <motion.button
            onClick={onLogout}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.15)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span style={{ fontSize: "13px", color: "#EF4444" }}>Logout</span>
          </motion.button>
        )}
        
        <div
          className="px-4 py-4 rounded-2xl"
          style={{
            background: "#181820",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1751818397262-040cddef4390?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGluZGlhbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0JTIwZGFyayUyMG1pbmltYWx8ZW58MXx8fHwxNzc2NTM5MTc0fDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="avatar"
              className="w-8 h-8 rounded-xl object-cover flex-shrink-0"
              style={{ border: "1.5px solid rgba(0,214,143,0.3)" }}
            />
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: "12px", color: "#fff" }}>Aryan Sharma</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>PRO Member</p>
            </div>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(0,214,143,0.15)" }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00D68F" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
