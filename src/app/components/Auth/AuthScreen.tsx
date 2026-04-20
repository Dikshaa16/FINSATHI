import { useState } from 'react';
import { api } from '../../../services/api';

interface AuthScreenProps {
  onAuthSuccess: (userData?: any) => void;
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const response = await api.login({ email, password });
        
        if (response.error) {
          setError(response.error);
        } else if (response.data && response.data.user) {
          onAuthSuccess(response.data.user);
        } else {
          onAuthSuccess();
        }
      } else {
        // Register
        const response = await api.register({
          email,
          password,
          firstName,
          lastName,
          phoneNumber,
        });
        
        if (response.error) {
          setError(response.error);
        } else if (response.data && response.data.user) {
          onAuthSuccess(response.data.user);
        } else {
          onAuthSuccess();
        }
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #0B0B0F 0%, #1a1a2e 100%)',
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-20 w-72 h-72 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #00D68F 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute bottom-20 right-20 w-96 h-96 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #0066FF 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* Auth Card */}
      <div
        className="relative w-full max-w-md rounded-3xl p-8 backdrop-blur-xl"
        style={{
          background: 'rgba(24, 24, 32, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, #00D68F 0%, #00A86B 100%)',
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: '#fff' }}
          >
            FINSATHI
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px' }}>
            Your AI-Powered Financial Companion
          </p>
        </div>

        {/* Toggle Tabs */}
        <div
          className="flex rounded-xl p-1 mb-6"
          style={{ background: 'rgba(255, 255, 255, 0.05)' }}
        >
          <button
            onClick={() => setIsLogin(true)}
            className="flex-1 py-2.5 rounded-lg font-medium transition-all"
            style={{
              background: isLogin ? '#00D68F' : 'transparent',
              color: isLogin ? '#0B0B0F' : 'rgba(255, 255, 255, 0.6)',
            }}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className="flex-1 py-2.5 rounded-lg font-medium transition-all"
            style={{
              background: !isLogin ? '#00D68F' : 'transparent',
              color: !isLogin ? '#0B0B0F' : 'rgba(255, 255, 255, 0.6)',
            }}
          >
            Register
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mb-4 p-3 rounded-lg text-sm"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#EF4444',
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                    }}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                    }}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                  }}
                  placeholder="+91 9876543210"
                />
              </div>
            </>
          )}

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl outline-none transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
              }}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl outline-none transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold transition-all mt-6"
            style={{
              background: loading
                ? 'rgba(0, 214, 143, 0.5)'
                : 'linear-gradient(135deg, #00D68F 0%, #00A86B 100%)',
              color: '#0B0B0F',
              boxShadow: '0 4px 20px rgba(0, 214, 143, 0.3)',
            }}
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <p
          className="text-center mt-6 text-sm"
          style={{ color: 'rgba(255, 255, 255, 0.4)' }}
        >
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="font-medium"
            style={{ color: '#00D68F' }}
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>

        {/* Demo Credentials */}
        <div
          className="mt-6 p-4 rounded-xl text-xs"
          style={{
            background: 'rgba(0, 102, 255, 0.1)',
            border: '1px solid rgba(0, 102, 255, 0.2)',
          }}
        >
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }} className="mb-2">
            <strong style={{ color: '#0066FF' }}>Demo Credentials:</strong>
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Email: demo@finsathi.com
            <br />
            Password: Demo123!
          </p>
        </div>
      </div>
    </div>
  );
}
