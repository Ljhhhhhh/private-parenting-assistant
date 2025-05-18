import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  extra?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  bordered?: boolean;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  extra,
  className = '',
  bodyClassName = '',
  bordered = true,
  hoverable = false,
}) => {
  return (
    <div
      className={`
        bg-white rounded-card 
        ${bordered ? 'border border-gray-100' : ''} 
        ${
          hoverable
            ? 'hover:shadow-lg transition-shadow duration-300'
            : 'shadow-card'
        } 
        overflow-hidden 
        ${className}
      `}
    >
      {(title || extra) && (
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
          {title && (
            <div className="text-base font-medium text-gray-900">{title}</div>
          )}
          {extra && <div>{extra}</div>}
        </div>
      )}
      <div className={`p-4 ${bodyClassName}`}>{children}</div>
    </div>
  );
};

export default Card;
