import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS class names, resolving conflicts intelligently.
 * Required by shadcn/ui components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
