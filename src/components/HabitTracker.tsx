import { useEffect, useMemo, useState } from 'react';

type Habit = {
  id: string;
  label: string;
  color: string; // tailwind color base e.g. 'blue', 'green'
};

type HabitTrackerProps = {
  habits?: Habit[];
};

function getTodayKey(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function HabitTracker({ habits }: HabitTrackerProps) {
  const defaultHabits: Habit[] = useMemo(
    () =>
      habits ?? [
        { id: 'habit-1', label: 'Hydration', color: 'blue' },
        { id: 'habit-2', label: 'Exercise', color: 'green' },
        { id: 'habit-3', label: 'Reading', color: 'purple' },
        { id: 'habit-4', label: 'Meditation', color: 'orange' },
        { id: 'habit-5', label: 'Sleep 7h+', color: 'pink' },
      ],
    [habits]
  );

  const todayKey = getTodayKey();
  const storageKey = `habit-tracker:${todayKey}`;

  const [completedIds, setCompletedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setCompletedIds(parsed);
        }
      }
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(completedIds));
    } catch {}
  }, [completedIds, storageKey]);

  const completedCount = completedIds.length;
  const total = defaultHabits.length;
  const percentage = Math.round((completedCount / total) * 100);

  const toggleHabit = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const resetToday = () => {
    setCompletedIds([]);
  };

  const gradientFrom = completedCount === total ? 'from-green-400' : 'from-blue-400';
  const gradientTo = completedCount === total ? 'to-emerald-500' : 'to-indigo-500';

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Daily Habit Tracker</h3>
          <p className="text-sm text-slate-500">{todayKey}</p>
        </div>
        <button
          onClick={resetToday}
          className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          title="Reset for new day"
        >
          Reset
        </button>
      </div>

      <div className="space-y-3 mb-5">
        {defaultHabits.map((habit) => {
          const checked = completedIds.includes(habit.id);
          const ring = checked ? `ring-2 ring-${habit.color}-400` : 'ring-1 ring-slate-200';
          const bg = checked ? `bg-${habit.color}-50` : 'bg-white';
          const dot = checked ? `bg-${habit.color}-500` : 'bg-slate-300';
          return (
            <label
              key={habit.id}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${bg} ${ring}`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleHabit(habit.id)}
                className="peer hidden"
              />
              <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${checked ? `border-${habit.color}-500` : 'border-slate-300'}`}>
                <span className={`w-3 h-3 rounded-sm ${dot}`}></span>
              </span>
              <span className="font-medium text-slate-800">{habit.label}</span>
            </label>
          );
        })}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Progress</span>
          <span className="text-sm text-slate-600">{percentage}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${gradientFrom} ${gradientTo} transition-all`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-slate-500">
          {completedCount}/{total} habits completed
        </div>
      </div>

      <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-rose-50 to-orange-50 text-rose-700 text-sm">
        Keep going! Small steps every day create big change.
      </div>
    </div>
  );
}

export default HabitTracker;


