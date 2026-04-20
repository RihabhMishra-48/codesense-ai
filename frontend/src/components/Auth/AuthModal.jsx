import { useState } from 'react';
import { X, LogIn, UserPlus, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useAppStore from '../../store/appStore';
import toast from 'react-hot-toast';

function InputField({ label, type, value, onChange, placeholder, icon: Icon }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="space-y-1.5">
      <label className="text-xs text-gray-400 font-medium">{label}</label>
      <div className="relative">
        <input
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-dark-700 border border-purple-900/30 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors pr-10"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-400 transition-colors"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AuthModal() {
  const { authMode, setShowAuth, setAuthMode } = useAppStore();
  const { login, register } = useAuth();

  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const isLogin = authMode === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success('Welcome back!', { style: { background: '#0f0f1a', color: '#e2e8f0', border: '1px solid #a855f7' } });
      } else {
        await register(form.username, form.email, form.password);
        toast.success('Account created! 🎉', { style: { background: '#0f0f1a', color: '#e2e8f0', border: '1px solid #a855f7' } });
      }
      setShowAuth(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAuth(false)} />
      <div className="relative w-full max-w-md glass rounded-2xl border border-purple-500/30 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="px-6 py-5 border-b border-purple-900/20 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold gradient-text">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isLogin ? 'Sign in to save your reviews' : 'Join CodeSense AI community'}
            </p>
          </div>
          <button onClick={() => setShowAuth(false)} className="p-2 glass-hover rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isLogin && (
            <InputField label="Username" type="text" value={form.username} onChange={set('username')} placeholder="hackerman42" />
          )}
          <InputField label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
          <InputField label="Password" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-neon w-full flex items-center justify-center gap-2 py-2.5 text-sm">
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
            ) : isLogin ? (
              <><LogIn className="w-4 h-4" /> Sign In</>
            ) : (
              <><UserPlus className="w-4 h-4" /> Create Account</>
            )}
          </button>

          <p className="text-center text-xs text-gray-500">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => setAuthMode(isLogin ? 'register' : 'login')}
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
