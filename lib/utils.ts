import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency (USD)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Calculates revenue based on impressions and CPM
 * CPM = Cost Per Mille (cost per thousand impressions)
 */
export function calculateRevenue(impressions: number, cpm: number): number {
  // Revenue = (impressions / 1000) * CPM
  return (impressions / 1000) * (cpm || 0);
} 