import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 计算 龄
export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

// 格式化期
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// 格式化数字
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

// 获取比赛Result颜色
export function getGameResultColor(result: string): string {
  switch (result.toLowerCase()) {
    case 'w':
    case 'win':
    case '胜':
      return 'text-green-600';
    case 'l':
    case 'loss':
    case '负':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}