import { useState, useEffect, createContext, useContext } from "react";
import { Outlet } from "react-router";
import { DesktopSidebar } from "./components/Layout/DesktopSidebar";
import { MobileBottomNav } from "./components/Layout/MobileBottomNav";
import { AddTransactionModal } from "./components/AddTransactionModal";
import { AuthScreen } from "./components/Auth/AuthScreen";
import { api } from "../services/api";
import { authService } from "../services/authService";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePicture?: string;
  dateOfBirth?: string;
  createdAt?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
});

export const useUser = () => useContext(UserContext);

export function Root() {
  const [showAdd, setShowAdd] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      setUserLoading(true);
      const response = await api.getUserProfile();
      
      if (response.data && response.data.id) {
        setUser(response.data);
        console.log('✅ User profile loaded');
      } else if (response.error) {
        console.error('❌ Error fetching user profile:', response.error);
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      console.log('🔍 Checking authentication...');
      
      // Check if we have a token
      if (!authService.isAuthenticated()) {
        console.log('❌ No token found - user needs to login');
        setIsLoading(false);
        return;
      }

      const token = authService.getToken();
      console.log('✅ Token found in storage');

      // Check if token is expired
      if (token && authService.isTokenExpired(token)) {
        console.log('⚠️ Token expired - clearing auth');
        authService.clearAuth();
        setIsLoading(false);
        return;
      }

      // Try to get user from storage first (instant load)
      const storedUser = authService.getUser();
      if (storedUser) {
        console.log('✅ User data loaded from storage');
        setUser(storedUser);
        setIsAuthenticated(true);
        setUserLoading(false);
      }

      // Verify token with backend
      try {
        const response = await api.verifyToken();
        
        if (response.data && response.data.user) {
          console.log('✅ Token verified - user authenticated');
          setIsAuthenticated(true);
          setUser(response.data.user);
          authService.updateUser(response.data.user); // Update stored user
          setUserLoading(false);
        } else {
          console.log('❌ Token verification failed - clearing auth');
          authService.clearAuth();
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Token verification error:', error);
        authService.clearAuth();
        setIsAuthenticated(false);
        setUser(null);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleAuthSuccess = async (userData?: any) => {
    console.log('🎉 Auth success - setting up user session');
    setIsAuthenticated(true);
    
    if (userData) {
      setUser(userData);
      setUserLoading(false);
    } else {
      // Fetch user profile if not provided
      await fetchUserProfile();
    }
  };

  const handleLogout = () => {
    console.log('👋 Logging out...');
    api.logout();
    setIsAuthenticated(false);
    setUser(null);
    window.location.reload(); // Refresh to clear all state
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0B0B0F" }}
      >
        <div className="text-center">
          <div
            className="inline-block w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-4"
            style={{ borderColor: "#00D68F", borderTopColor: "transparent" }}
          />
          <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'User';
  const firstName = user?.firstName || 'User';
  const avatar = user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=00D68F&color=fff&size=128`;

  return (
    <UserContext.Provider value={{ user, loading: userLoading, refreshUser: fetchUserProfile }}>
      <div
        className="min-h-screen flex"
        style={{ background: "#0B0B0F", fontFamily: "'Inter', sans-serif" }}
      >
        {/* Desktop Sidebar — hidden below md */}
        <div className="hidden md:block">
          <DesktopSidebar onAdd={() => setShowAdd(true)} onLogout={handleLogout} />
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
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <p style={{ fontSize: "17px", color: "#fff" }}>
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {firstName} 👋
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="relative w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer hover:bg-opacity-80 transition-all"
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
                src={avatar}
                alt="avatar"
                onClick={() => window.location.href = '/profile'}
                className="w-10 h-10 rounded-xl object-cover cursor-pointer hover:opacity-80 transition-opacity"
                style={{ border: "1.5px solid rgba(0,214,143,0.3)" }}
                title="View Profile"
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
    </UserContext.Provider>
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
