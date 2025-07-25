import { cn } from '@/shared/lib/utils';

interface ProgressProps {
  value: number;
  className?: string;
  max?: number;
}

export function Progress({ value, className, max = 100 }: ProgressProps) {
  const percentage = Math.min(Math.max(value, 0), max);
  
  return (
    <div className={cn('w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700', className)}>
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${(percentage / max) * 100}%` }}
      />
    </div>
  );
}
