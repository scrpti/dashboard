import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ 
    className = '', 
    variant = 'default', 
    size = 'md',
    dot = false,
    children, 
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center font-medium rounded-full';
    
    const variants = {
      default: 'bg-slate-100 text-slate-800',
      success: 'bg-success-100 text-success-800',
      warning: 'bg-warning-100 text-warning-800',
      danger: 'bg-danger-100 text-danger-800',
      info: 'bg-primary-100 text-primary-800',
      outline: 'border border-slate-300 text-slate-700 bg-white'
    };
    
    const sizes = {
      sm: dot ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-xs',
      md: dot ? 'px-2 py-1 text-sm' : 'px-2.5 py-0.5 text-sm',
      lg: dot ? 'px-2.5 py-1.5 text-base' : 'px-3 py-1 text-base'
    };
    
    const dotClasses = dot ? 'gap-1.5' : '';
    
    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${dotClasses} ${className}`;
    
    return (
      <span ref={ref} className={classes} {...props}>
        {dot && (
          <div className={`w-1.5 h-1.5 rounded-full ${
            variant === 'success' ? 'bg-success-600' :
            variant === 'warning' ? 'bg-warning-600' :
            variant === 'danger' ? 'bg-danger-600' :
            variant === 'info' ? 'bg-primary-600' :
            'bg-slate-600'
          }`} />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;