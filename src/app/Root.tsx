import { useState } from "react";
import { Outlet } from "react-router";
import { DesktopSidebar } from "./components/Layout/DesktopSidebar";
import { MobileBottomNav } from "./components/Layout/MobileBottomNav";
import { AddTransactionModal } from "./components/AddTransactionModal";

export function Root() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "#0B0B0F", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Desktop Sidebar — hidden below md */}
      <div className="hidden md:block">
        <DesktopSidebar onAdd={() => setShowAdd(true)} />
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-[240px] min-h-screen overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {/* Desktop top bar */}
        <div
          className="hidden md:flex items-center justify-between px-8 py-4 sticky top-0 z-30"
          style={{
            background: "rgba(11,11,15,0.85)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>
              Saturday, April 18, 2026
            </p>
            <p style={{ fontSize: "17px", color: "#fff" }}>
              Good morning, Aryan 👋
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="relative w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer"
              style={{
                background: "#181820",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <BellIcon />
              <span
                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                style={{ background: "#00D68F" }}
              />
            </div>
            <img
              src="https://images.unsplash.com/photo-1751818397262-040cddef4390?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGluZGlhbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0JTIwZGFyayUyMG1pbmltYWx8ZW58MXx8fHwxNzc2NTM5MTc0fDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="avatar"
              className="w-10 h-10 rounded-xl object-cover"
              style={{ border: "1.5px solid rgba(0,214,143,0.3)" }}
            />
          </div>
        </div>

        {/* Page content */}
        <div className="pb-24 md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav — hidden above md */}
      <div className="md:hidden">
        <MobileBottomNav onAdd={() => setShowAdd(true)} />
      </div>

      {/* Add Transaction Modal */}
      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
