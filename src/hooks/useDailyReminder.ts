import { useCallback, useEffect, useRef, useState } from 'react';

type Options = {
  onFallbackReminder?: () => void;
};

type ReminderSettings = {
  enabled: boolean;
  timeHHMM: string; // e.g. "09:00"
};

const ENABLED_KEY = 'daily-reminder:enabled';
const TIME_KEY = 'daily-reminder:time';

function getDefaultSettings(): ReminderSettings {
  return {
    enabled: false,
    timeHHMM: '09:00',
  };
}

function parseHHMMToNextDate(timeHHMM: string): Date {
  const [hh, mm] = timeHHMM.split(':').map((v) => parseInt(v, 10));
  const now = new Date();
  const target = new Date();
  target.setHours(hh, mm, 0, 0);
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}

export function useDailyReminder(options?: Options) {
  const { onFallbackReminder } = options ?? {};
  const [settings, setSettings] = useState<ReminderSettings>(() => {
    try {
      const enabled = localStorage.getItem(ENABLED_KEY);
      const timeHHMM = localStorage.getItem(TIME_KEY);
      return {
        enabled: enabled === 'true',
        timeHHMM: timeHHMM ?? getDefaultSettings().timeHHMM,
      };
    } catch {
      return getDefaultSettings();
    }
  });

  const timeoutRef = useRef<number | null>(null);

  const schedule = useCallback(() => {
    if (!settings.enabled) return;
    const next = parseHHMMToNextDate(settings.timeHHMM);
    const ms = next.getTime() - Date.now();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    timeoutRef.current = window.setTimeout(async () => {
      try {
        if ('Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('Rappel quotidien', {
              body: "N'oubliez pas de consulter vos tâches et vos habitudes aujourd'hui!",
            });
          } else if (Notification.permission !== 'denied') {
            const perm = await Notification.requestPermission();
            if (perm === 'granted') {
              new Notification('Rappel quotidien', {
                body: "N'oubliez pas de consulter vos tâches et vos habitudes aujourd'hui!",
              });
            } else if (onFallbackReminder) {
              onFallbackReminder();
            }
          } else if (onFallbackReminder) {
            onFallbackReminder();
          }
        } else if (onFallbackReminder) {
          onFallbackReminder();
        }
      } finally {
        // schedule the next day after firing
        schedule();
      }
    }, ms);
  }, [settings.enabled, settings.timeHHMM, onFallbackReminder]);

  useEffect(() => {
    try {
      localStorage.setItem(ENABLED_KEY, String(settings.enabled));
      localStorage.setItem(TIME_KEY, settings.timeHHMM);
    } catch {}
  }, [settings]);

  useEffect(() => {
    if (settings.enabled) {
      schedule();
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [settings.enabled, settings.timeHHMM, schedule]);

  const setEnabled = useCallback((enabled: boolean) => {
    setSettings((prev) => ({ ...prev, enabled }));
  }, []);

  const setTimeHHMM = useCallback((time: string) => {
    setSettings((prev) => ({ ...prev, timeHHMM: time }));
  }, []);

  return {
    enabled: settings.enabled,
    timeHHMM: settings.timeHHMM,
    setEnabled,
    setTimeHHMM,
  };
}

export default useDailyReminder;


