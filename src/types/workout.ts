import type {DayOfWeek} from './profile';
export type Exercise = {id: string; code: string; name: string; instructions: string; muscleGroup: string; equipment: string; cameraSupported: boolean};
export type WorkoutPlanItem = {id: string; exercise: Exercise; sets: number; targetRepetitions: number; restSeconds: number; order: number; cameraSupported: boolean};
export type WorkoutDay = {day: DayOfWeek; title: string; estimatedMinutes: number; exercises: WorkoutPlanItem[]};
export type WorkoutPlan = {id: string; weekStartDate: string; status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'; explanation: string; workoutDays: number; totalExercises: number; days: WorkoutDay[]};
export type TodayWorkout = {planId: string; date: string; restDay: boolean; workout?: WorkoutDay};
