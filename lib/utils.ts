import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Note: This is mainly used for web/tailwind if available, 
// for pure RN we will mostly use StyleSheets but keep this for consistency if requested.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
