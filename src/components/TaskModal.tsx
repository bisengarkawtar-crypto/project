import { useState } from 'react';
import { Task, Category } from '../hooks/useTasks';
import { X } from 'lucide-react';

interface TaskModalProps {
  task?: Task;
  categories: Category[];
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
}

export function TaskModal({ task, categories, onClose, onSave }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [note, setNote] = useState(task?.note || '');
  const [priority, setPriority] = useState<'Urgent' | 'Important' | 'Normal'>(
    task?.priority || 'Normal'
  );
  const [categoryId, setCategoryId] = useState(task?.category_id || '');
  const [reminder, setReminder] = useState(
    task?.reminder ? new Date(task.reminder).toISOString().slice(0, 16) : ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      note: note.trim(),
      priority,
      category_id: categoryId || null,
      reminder: reminder ? new Date(reminder).toISOString() : null,
      is_completed: task?.is_completed || false,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
              Titre *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Ex: Acheter du lait"
            />
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-slate-700 mb-2">
              Note
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Ajouter une description..."
            />
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-2">
              Priorité
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'Urgent' | 'Important' | 'Normal')}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="Normal">Normal</option>
              <option value="Important">Important</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
              Catégorie
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Aucune catégorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="reminder" className="block text-sm font-medium text-slate-700 mb-2">
              Rappel
            </label>
            <input
              id="reminder"
              type="datetime-local"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              {task ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}