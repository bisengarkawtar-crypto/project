import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { useSharedLists } from '../hooks/useSharedLists';
import { TaskItem } from './TaskItem';
import { TaskModal } from './TaskModal';
import { HabitTracker } from './HabitTracker';
import { SharedListModal } from './SharedListModal';
import {
  Plus,
  LogOut,
  Filter,
  Users,
  Home,
  CheckCircle2,
  Circle,
  Trash2,
  Bell,
} from 'lucide-react';
import { useDailyReminder } from '../hooks/useDailyReminder';

type ViewMode = 'personal' | { type: 'shared'; listId: string };

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('personal');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSharedListModal, setShowSharedListModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [showCompleted, setShowCompleted] = useState(true);

  const sharedListId = viewMode !== 'personal' ? viewMode.listId : undefined;
  const { tasks, categories, loading, addTask, updateTask, deleteTask } = useTasks(sharedListId);
  const { sharedLists, createSharedList, joinSharedList, deleteSharedList } = useSharedLists();
  const [showReminderBanner, setShowReminderBanner] = useState(false);
  const { enabled: reminderEnabled, timeHHMM, setEnabled: setReminderEnabled, setTimeHHMM } = useDailyReminder({
    onFallbackReminder: () => setShowReminderBanner(true),
  });

  const currentList = useMemo(() => {
    if (viewMode !== 'personal') {
      return sharedLists.find((list) => list.id === viewMode.listId);
    }
    return null;
  }, [viewMode, sharedLists]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (!showCompleted && task.is_completed) return false;
      if (selectedCategory && task.category_id !== selectedCategory) return false;
      if (selectedPriority && task.priority !== selectedPriority) return false;
      return true;
    });
  }, [tasks, showCompleted, selectedCategory, selectedPriority]);

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.is_completed).length;
    const urgent = tasks.filter((t) => t.priority === 'Urgent' && !t.is_completed).length;
    return { total, completed, urgent };
  }, [tasks]);

  const handleCreateTask = async (task: any) => {
    await addTask(task);
    setShowTaskModal(false);
  };

  const handleDeleteList = async (listId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette liste partagée?')) {
      await deleteSharedList(listId);
      if (viewMode !== 'personal' && viewMode.listId === listId) {
        setViewMode('personal');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <header className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-1">Ma To-Do Liste</h1>
              <p className="text-slate-600">{user?.email}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2">
                <Bell className={`w-4 h-4 ${reminderEnabled ? 'text-blue-600' : 'text-slate-500'}`} />
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={reminderEnabled}
                    onChange={(e) => setReminderEnabled(e.target.checked)}
                  />
                  Rappel quotidien
                </label>
                <input
                  type="time"
                  value={timeHHMM}
                  onChange={(e) => setTimeHHMM(e.target.value)}
                  className="text-sm bg-white border border-slate-300 rounded px-2 py-1"
                />
              </div>
              <button
                onClick={() => setShowSharedListModal(true)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Collaborer</span>
              </button>

              <button
                onClick={() => signOut()}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">{taskStats.total}</div>
              <div className="text-sm text-blue-700">Total</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
              <div className="text-sm text-green-700">Terminées</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-red-600">{taskStats.urgent}</div>
              <div className="text-sm text-red-700">Urgentes</div>
            </div>
          </div>
        </header>
        {showReminderBanner && (
          <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 text-amber-800 flex items-start justify-between">
            <div className="pr-4 text-sm">
              N'oubliez pas vos tâches et habitudes aujourd'hui!
            </div>
            <button
              onClick={() => setShowReminderBanner(false)}
              className="text-xs px-2 py-1 bg-amber-100 hover:bg-amber-200 rounded"
            >
              OK
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-6">
          <aside className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Home className="w-5 h-5" />
                Mes Listes
              </h2>

              <button
                onClick={() => setViewMode('personal')}
                className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors mb-2 ${
                  viewMode === 'personal'
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                Personnel
              </button>

              {sharedLists.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-slate-500 px-4 py-2">
                    Listes partagées
                  </div>
                  {sharedLists.map((list) => (
                    <div
                      key={list.id}
                      className="flex items-center gap-2"
                    >
                      <button
                        onClick={() => setViewMode({ type: 'shared', listId: list.id })}
                        className={`flex-1 text-left px-4 py-2.5 rounded-lg transition-colors truncate ${
                          viewMode !== 'personal' && viewMode.listId === list.id
                            ? 'bg-blue-500 text-white'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {list.name}
                      </button>
                      {list.owner_id === user?.id && (
                        <button
                          onClick={() => handleDeleteList(list.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtres
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Toutes</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Priorité
                  </label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Toutes</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Important">Important</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>

                <div>
                  <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors text-sm text-slate-700"
                  >
                    {showCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                    Afficher terminées
                  </button>
                </div>
              </div>
            </div>

            <HabitTracker />
          </aside>

          <main className="md:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {currentList ? currentList.name : 'Mes Tâches'}
                  </h2>
                  {currentList && (
                    <p className="text-sm text-slate-600 mt-1">
                      Code: <span className="font-mono font-bold">{currentList.share_code}</span>
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setShowTaskModal(true)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Nouvelle tâche
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600">
                    {tasks.length === 0
                      ? 'Aucune tâche pour le moment'
                      : 'Aucune tâche ne correspond aux filtres'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      categories={categories}
                      onUpdate={updateTask}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {showTaskModal && (
        <TaskModal
          categories={categories}
          onClose={() => setShowTaskModal(false)}
          onSave={handleCreateTask}
        />
      )}

      {showSharedListModal && (
        <SharedListModal
          onClose={() => setShowSharedListModal(false)}
          onCreate={createSharedList}
          onJoin={joinSharedList}
        />
      )}
    </div>
  );
}