import { HTMLAttributes, forwardRef } from 'react';

interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  showLabel?: boolean;
  label?: string;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      showLabel = false,
      label,
      variant = 'primary',
      size = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    const clampedValue = Math.min(Math.max(value, 0), 100);

    const variantStyles = {
      primary: 'bg-blue-600',
      success: 'bg-green-600',
      warning: 'bg-amber-500',
      error: 'bg-red-600',
    };

    const sizeStyles = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    };

    return (
      <div ref={ref} className={className} {...props}>
        {showLabel && (
          <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
            <span>{label}</span>
            <span className="font-medium">{Math.round(clampedValue)}%</span>
          </div>
        )}
        <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeStyles[size]}`}>
          <div
            className={`${variantStyles[variant]} ${sizeStyles[size]} rounded-full transition-all duration-300 ease-out`}
            style={{ width: `${clampedValue}%` }}
            role="progressbar"
            aria-valuenow={clampedValue}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
