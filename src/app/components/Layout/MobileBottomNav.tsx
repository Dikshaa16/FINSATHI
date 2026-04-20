import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Home, BarChart2, Plus, Target, MessageSquare } from "lucide-react";

const leftItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: BarChart2, label: "Insights", path: "/insights" },
];

const rightItems = [
  { icon: Target, label: "Goals", path: "/goals" },
  { icon: MessageSquare, label: "AI Chat", path: "/ai" },
];

interface Props {
  onAdd: () => void;
}

export function MobileBottomNav({ onAdd }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2"
      style={{
        height: "68px",
        background: "rgba(13,13,20,0.92)",
        backdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Left items */}
      {leftItems.map(({ icon: Icon, label, path }) => {
        const isActive = location.pathname === path;
        return (
          <motion.button
            key={path}
            onClick={() => navigate(path)}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-4 py-2 relative"
          >
            <Icon
              size={22}
              strokeWidth={1.8}
              color={isActive ? "#00D68F" : "rgba(255,255,255,0.35)"}
            />
            <span style={{ fontSize: "10px", color: isActive ? "#00D68F" : "rgba(255,255,255,0.3)" }}>
              {label}
            </span>
            {isActive && (
              <motion.div
                layoutId={`mobile-nav-dot-${path}`}
                className="absolute top-0 w-5 h-0.5 rounded-full"
                style={{ background: "#00D68F" }}
              />
            )}
          </motion.button>
        );
      })}

      {/* Center Add Button */}
      <motion.button
        onClick={onAdd}
        whileTap={{ scale: 0.88 }}
        className="flex flex-col items-center gap-1 -mt-5"
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            background: "#00D68F",
            boxShadow: "0 4px 20px rgba(0,214,143,0.4), 0 0 0 4px rgba(0,214,143,0.1)",
          }}
        >
          <Plus size={24} color="#000" strokeWidth={2.5} />
        </div>
        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>
          Add
        </span>
      </motion.button>

      {/* Right items */}
      {rightItems.map(({ icon: Icon, label, path }) => {
        const isActive = location.pathname === path;
        return (
          <motion.button
            key={path}
            onClick={() => navigate(path)}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-4 py-2 relative"
          >
            <Icon
              size={22}
              strokeWidth={1.8}
              color={isActive ? "#00D68F" : "rgba(255,255,255,0.35)"}
            />
            <span style={{ fontSize: "10px", color: isActive ? "#00D68F" : "rgba(255,255,255,0.3)" }}>
              {label}
            </span>
            {isActive && (
              <motion.div
                layoutId={`mobile-nav-dot-${path}`}
                className="absolute top-0 w-5 h-0.5 rounded-full"
                style={{ background: "#00D68F" }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}