import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import Icon from '@/components/ui/icon';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        const err = await login(email, password);
        if (err) setError(err);
      } else {
        if (!name.trim()) { setError('Введи имя'); return; }
        const err = await register(name, email, password);
        if (err) setError(err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen dot-grid flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, var(--neon-green), transparent 70%)' }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-8" style={{ background: 'radial-gradient(circle, var(--neon-purple), transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5" style={{ background: 'radial-gradient(circle, var(--neon-blue), transparent 70%)' }} />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center pulse-glow" style={{ background: 'var(--neon-green)', boxShadow: '0 0 20px rgba(0,255,135,0.4)' }}>
              <Icon name="Zap" size={20} className="text-black" />
            </div>
            <span className="font-display text-2xl tracking-widest text-white">TASKFLOW</span>
          </div>
          <p className="text-muted-foreground text-sm">Управление задачами команды</p>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/8">
          <div className="flex gap-1 mb-8 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'login' ? 'text-black font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
              style={mode === 'login' ? { background: 'var(--neon-green)', boxShadow: '0 0 15px rgba(0,255,135,0.3)' } : {}}
            >
              Войти
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'register' ? 'text-black font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
              style={mode === 'register' ? { background: 'var(--neon-green)', boxShadow: '0 0 15px rgba(0,255,135,0.3)' } : {}}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Алекс Звёздный"
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'hsl(var(--foreground))' }}
                  onFocus={e => e.target.style.borderColor = 'var(--neon-green)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            )}
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.ru"
                className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'hsl(var(--foreground))' }}
                onFocus={e => e.target.style.borderColor = 'var(--neon-green)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'hsl(var(--foreground))' }}
                onFocus={e => e.target.style.borderColor = 'var(--neon-green)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                <Icon name="AlertCircle" size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl font-semibold text-black transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'var(--neon-green)', boxShadow: '0 0 20px rgba(0,255,135,0.3)', marginTop: '8px' }}
            >
              {submitting ? 'Загрузка...' : mode === 'login' ? 'Войти в систему' : 'Создать аккаунт'}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs text-muted-foreground mb-1">Нет аккаунта? Нажми «Регистрация» и создай свой.</p>
          </div>
        </div>
      </div>
    </div>
  );
}