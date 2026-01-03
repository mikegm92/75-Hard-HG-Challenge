
import { Task } from './types';

export const TOTAL_DAYS = 75;
export const WATER_GOAL_OZ = 128; // 1 Gallon

export const INITIAL_TASKS: Task[] = [
  { id: 'strength', label: '30min Strength/Flexibility', completed: false, type: 'strength' },
  { id: 'cardio', label: '30min Outdoor Cardio', completed: false, type: 'cardio' },
  { id: 'reading', label: '10 Minutes of Reading', completed: false, type: 'reading' },
  { id: 'water', label: '1 Gallon Water', completed: false, type: 'water' },
  { id: 'photo', label: 'Progress Picture', completed: false, type: 'photo' },
];

export const APP_THEME = {
  primary: 'text-pink-500',
  primaryGradient: 'from-pink-600 to-rose-400',
  accent: 'text-fuchsia-400',
  dark: 'bg-slate-950',
  card: 'bg-slate-900/60',
  border: 'border-pink-500/20',
};
