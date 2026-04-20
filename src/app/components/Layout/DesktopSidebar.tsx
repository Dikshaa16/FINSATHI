import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Home, BarChart2, Target, MessageSquare, Plus, Sparkles, Smartphone } from "lucide-react";
import { useUser } from "../../Root";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: BarChart2, label: "Insights", path: "/insights" },
  { icon: Target, label: "Goals", path: "/goals" },
  { icon: MessageSquare, label: "AI Chat", path: "/ai" },
  { icon: Smartphone, label: "SMS Transactions", path: "/sms-transactions" },
];

interface Props {
  onAdd: () => void;
  onLogout?: () => void;
}

export function DesktopSidebar({ onAdd, onLogout }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'User';
  const avatar = user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=00D68F&color=fff&size=128`;

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
        
        <motion.div
          className="px-4 py-4 rounded-2xl cursor-pointer transition-all"
          style={{
            background: "#181820",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
          onClick={() => navigate('/profile')}
          whileHover={{ 
            background: "#1f1f28",
            borderColor: "rgba(0,214,143,0.15)"
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <img
              src={avatar}
              alt="avatar"
              className="w-8 h-8 rounded-xl object-cover flex-shrink-0"
              style={{ border: "1.5px solid rgba(0,214,143,0.3)" }}
            />
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: "12px", color: "#fff" }} className="truncate">{fullName}</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>View Profile</p>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
