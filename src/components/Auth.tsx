import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';

export function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Motifs décoratifs cute */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl opacity-20 animate-pulse">✨</div>
        <div className="absolute top-32 right-20 text-5xl opacity-20 animate-bounce">🌸</div>
        <div className="absolute bottom-20 left-32 text-7xl opacity-20">🌈</div>
        <div className="absolute bottom-40 right-10 text-6xl opacity-20 animate-pulse">💫</div>
        <div className="absolute top-1/2 left-1/4 text-4xl opacity-20">🎨</div>
        <div className="absolute top-1/3 right-1/3 text-5xl opacity-20 animate-bounce">☀️</div>
        <div className="absolute bottom-1/4 left-1/2 text-4xl opacity-20">🎯</div>
        <div className="absolute top-1/4 left-1/3 text-6xl opacity-10">🦋</div>
        <div className="absolute bottom-1/3 right-1/4 text-5xl opacity-10 animate-pulse">🌟</div>

        {/* Formes géométriques colorées */}
        <div className="absolute top-20 right-1/4 w-32 h-32 bg-gradient-to-br from-pink-200 to-rose-300 rounded-full opacity-20 blur-2xl"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-amber-200 to-yellow-300 rounded-full opacity-20 blur-2xl"></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-full opacity-20 blur-xl"></div>
      </div>

      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-white/50">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gradient-to-br from-pink-400 via-rose-400 to-amber-400 p-4 rounded-2xl shadow-lg">
            {isSignUp ? (
              <UserPlus className="w-8 h-8 text-white" />
            ) : (
              <LogIn className="w-8 h-8 text-white" />
            )}
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 bg-clip-text text-transparent">
          {isSignUp ? '✨ Créer un compte' : '🌟 Se connecter'}
        </h1>
        <p className="text-center text-slate-600 mb-8 text-lg">
          {isSignUp
            ? 'Commencez à organiser vos tâches avec style'
            : 'Bienvenue dans votre espace coloré'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:via-rose-600 hover:to-amber-600 text-white font-medium py-3 px-4 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? 'Chargement...' : isSignUp ? '✨ S\'inscrire' : '🌟 Se connecter'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-rose-600 hover:text-rose-700 text-sm font-medium transition-colors"
          >
            {isSignUp
              ? 'Vous avez déjà un compte ? Se connecter'
              : 'Pas encore de compte ? S\'inscrire'}
          </button>
        </div>
      </div>
    </div>
  );
}