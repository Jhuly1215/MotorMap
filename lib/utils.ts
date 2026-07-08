import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Note: This is mainly used for web/tailwind if available, 
// for pure RN we will mostly use StyleSheets but keep this for consistency if requested.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Estrellas por nivel según la precisión del mejor intento */
export const starsForAccuracy = (accuracy: number): number => {
  if (accuracy >= 90) return 3;
  if (accuracy >= 75) return 2;
  if (accuracy >= 50) return 1;
  return 0;
};
