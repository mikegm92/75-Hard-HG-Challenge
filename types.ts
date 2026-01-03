
export interface Task {
  id: string;
  label: string;
  completed: boolean;
  type: 'strength' | 'cardio' | 'reading' | 'water' | 'photo';
}

export interface DayProgress {
  dayNumber: number;
  date: string;
  tasks: Task[];
  waterOunces: number; // 128oz = 1 gallon
  photoUrl?: string;
  readingBooks: string[]; // Track multiple books read
  isCompleted: boolean;
  success: boolean; // True if all tasks were done, false if day was ended early
  failed?: boolean;
}

export interface ChallengeState {
  currentDay: number;
  startDate: string;
  history: DayProgress[];
  isFailed: boolean;
  books: string[]; // Library of books the user has added
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
