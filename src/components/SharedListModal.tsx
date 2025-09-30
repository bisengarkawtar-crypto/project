import { useState } from 'react';
import { X, Plus, LogIn, Copy, Check } from 'lucide-react';

interface SharedListModalProps {
  onClose: () => void;
  onCreate: (name: string) => Promise<any>;
  onJoin: (code: string) => Promise<any>;
}

export function SharedListModal({ onClose, onCreate, onJoin }: SharedListModalProps) {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdList, setCreatedList] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError('');

    const list = await onCreate(name.trim());

    if (list) {
      setCreatedList(list);
      setName('');
    } else {
      setError('Erreur lors de la création de la liste');
    }

    setLoading(false);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError('');

    const result = await onJoin(code.trim());

    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }

    setLoading(false);
  };

  const handleCopyCode = () => {
    if (createdList) {
      navigator.clipboard.writeText(createdList.share_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (createdList) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Liste créée avec succès!
            </h2>

            <p className="text-slate-600 mb-6">
              Partagez ce code avec vos amis pour qu'ils puissent rejoindre votre liste:
            </p>

            <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 mb-6">
              <p className="text-3xl font-bold text-blue-600 tracking-wider mb-2">
                {createdList.share_code}
              </p>
              <button
                onClick={handleCopyCode}
                className="text-sm text-slate-600 hover:text-slate-800 inline-flex items-center gap-1 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copié!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copier le code
                  </>
                )}
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Liste collaborative</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('create')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'create'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Créer
            </button>
            <button
              onClick={() => setMode('join')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'join'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Rejoindre
            </button>
          </div>

          {mode === 'create' ? (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="listName" className="block text-sm font-medium text-slate-700 mb-2">
                  Nom de la liste
                </label>
                <input
                  id="listName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ex: Courses de la semaine"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Création...' : 'Créer la liste'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label htmlFor="shareCode" className="block text-sm font-medium text-slate-700 mb-2">
                  Code de partage
                </label>
                <input
                  id="shareCode"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  placeholder="Ex: ABC123"
                  maxLength={6}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase tracking-wider text-center text-lg font-mono"
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
                className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Connexion...' : 'Rejoindre la liste'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}