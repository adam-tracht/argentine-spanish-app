import { HTMLAttributes, forwardRef } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'primary'
    | 'success'
    | 'warning'
    | 'error'
    | 'purple'
    | 'teal'
    | 'pink';
  size?: 'sm' | 'md';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-full whitespace-nowrap';

    const variantStyles = {
      default: 'bg-gray-100 text-gray-700',
      primary: 'bg-blue-100 text-blue-700',
      success: 'bg-green-100 text-green-700',
      warning: 'bg-amber-100 text-amber-700',
      error: 'bg-red-100 text-red-700',
      purple: 'bg-purple-100 text-purple-700',
      teal: 'bg-teal-100 text-teal-700',
      pink: 'bg-pink-100 text-pink-700',
    };

    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
    };

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
