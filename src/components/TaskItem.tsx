import { useState } from 'react';
import { Task, Category } from '../hooks/useTasks';
import { Check, Clock, CreditCard as Edit2, Trash2, AlertCircle } from 'lucide-react';
import { TaskModal } from './TaskModal';

interface TaskItemProps {
  task: Task;
  categories: Category[];
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

const priorityStyles = {
  Urgent: 'bg-red-50 border-red-300 text-red-700',
  Important: 'bg-orange-50 border-orange-300 text-orange-700',
  Normal: 'bg-slate-50 border-slate-300 text-slate-700',
};

const priorityIcons = {
  Urgent: '!!!',
  Important: '!!',
  Normal: '!',
};

export function TaskItem({ task, categories, onUpdate, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  const category = categories.find((c) => c.id === task.category_id);

  const handleToggle = () => {
    onUpdate(task.id, { is_completed: !task.is_completed });
  };

  const hasReminder = task.reminder && new Date(task.reminder) > new Date();

  return (
    <>
      <div
        className={`group bg-white border-2 rounded-xl p-4 transition-all hover:shadow-md ${
          task.is_completed ? 'opacity-60 border-slate-200' : 'border-slate-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={handleToggle}
            className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
              task.is_completed
                ? 'bg-green-500 border-green-500'
                : 'border-slate-300 hover:border-green-500'
            }`}
          >
            {task.is_completed && <Check className="w-4 h-4 text-white" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3
                className={`font-medium text-slate-800 ${
                  task.is_completed ? 'line-through text-slate-500' : ''
                }`}
              >
                {task.title}
              </h3>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setIsEditing(true)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-100 rounded-lg transition-all"
                  title="Modifier"
                >
                  <Edit2 className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>

            {task.note && (
              <p className="text-sm text-slate-600 mb-3 line-clamp-2">{task.note}</p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                  priorityStyles[task.priority]
                }`}
              >
                <AlertCircle className="w-3 h-3" />
                {task.priority}
              </span>

              {category && (
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium text-white"
                  style={{ backgroundColor: category.color }}
                >
                  {category.name}
                </span>
              )}

              {hasReminder && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 border border-blue-300 text-blue-700">
                  <Clock className="w-3 h-3" />
                  {new Date(task.reminder).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <TaskModal
          task={task}
          categories={categories}
          onClose={() => setIsEditing(false)}
          onSave={(updates) => {
            onUpdate(task.id, updates);
            setIsEditing(false);
          }}
        />
      )}
    </>
  );
}