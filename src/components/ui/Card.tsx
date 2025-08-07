import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className = '', 
    variant = 'default', 
    padding = 'md', 
    hover = false,
    children, 
    ...props 
  }, ref) => {
    const baseClasses = 'bg-white rounded-xl border';
    
    const variants = {
      default: 'border-slate-200/60 shadow-card',
      outlined: 'border-slate-300',
      elevated: 'border-slate-200/60 shadow-lg'
    };
    
    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    };
    
    const hoverClasses = hover ? 'transition-all duration-200 hover:shadow-soft hover:-translate-y-0.5' : '';
    
    const classes = `${baseClasses} ${variants[variant]} ${paddings[padding]} ${hoverClasses} ${className}`;
    
    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;