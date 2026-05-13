import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: string = 'TWD') {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: currency === 'TWD' ? 'TWD' : currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('zh-TW').format(value);
}

export function formatWan(value: number) {
  return (value / 10000).toFixed(2) + ' 萬';
}
