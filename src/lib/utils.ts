import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatWordCount(text: string): number {
  if (!text) return 0;
  return text.length;
}

export function parseTags(tagsString: string): string[] {
  try {
    const parsed = JSON.parse(tagsString);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function stringifyTags(tags: string[]): string {
  return JSON.stringify(tags);
}

export function calculateConsecutiveDays(dates: Date[]): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 };
  
  const sortedDates = [...dates].sort((a, b) => b.getTime() - a.getTime());
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let current = 0;
  let longest = 0;
  let tempCount = 0;
  
  for (let i = 0; i < sortedDates.length; i++) {
    const date = new Date(sortedDates[i]);
    date.setHours(0, 0, 0, 0);
    
    if (i === 0) {
      const diff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diff <= 1) {
        tempCount = 1;
        current = 1;
      }
    } else {
      const prevDate = new Date(sortedDates[i - 1]);
      prevDate.setHours(0, 0, 0, 0);
      const diff = Math.floor((prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diff === 1) {
        tempCount++;
        if (i <= current || current === 0) {
          current = tempCount;
        }
      } else {
        longest = Math.max(longest, tempCount);
        tempCount = 1;
      }
    }
  }
  
  longest = Math.max(longest, tempCount);
  if (current === 0) current = tempCount;
  
  return { current, longest };
}
