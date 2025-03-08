// components/Auth.tsx
import { useState } from 'react';
import { signIn, signUp, generateSyncCode } from '../lib/auth-client';

interface AuthProps {
  onAuth: () => void;
}

export default function Auth({ onAuth }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [syncCode, setSyncCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      onAuth();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    setLoading(true);
    try {
      const code = await generateSyncCode();
      setSyncCode(code);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate sync code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleAuth} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
        </button>
      </form>

      <div className="auth-toggle">
        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
        </button>
      </div>

      {isLogin && (
        <div className="sync-code-section">
          <h3>Connect Chrome Extension</h3>
          <p>Generate a code to connect your Chrome extension</p>

          {syncCode ? (
            <div className="sync-code-display">
              <p>Your sync code (valid for 15 minutes):</p>
              <div className="sync-code">{syncCode}</div>
            </div>
          ) : (
            <button onClick={handleGenerateCode} disabled={loading} className="generate-code-btn">
              Generate Sync Code
            </button>
          )}
        </div>
      )}
    </div>
  );
}
