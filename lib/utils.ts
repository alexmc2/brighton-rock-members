import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a consistent color for a user based on their ID.
 * Used for avatar backgrounds until profile pictures are implemented.
 */
export function getUserColor(userId: string): string {
  // List of tailwind colors that work well in both light and dark mode
  const colors = [
    'bg-red-500',
    'bg-amber-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-sky-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-rose-500',
    'bg-orange-500',
    'bg-lime-500',
    'bg-cyan-500',
  ];
  
  // Create a simple hash of the userId
  const hash = userId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  // Use the hash to select a color
  return colors[Math.abs(hash) % colors.length];
} 