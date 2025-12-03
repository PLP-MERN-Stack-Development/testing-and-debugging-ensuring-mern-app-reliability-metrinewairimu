import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  text = 'Loading...',
  fullScreen = false,
  color = 'blue'
}) => {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-12 h-12 border-3',
    large: 'w-16 h-16 border-4'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    gray: 'border-gray-600',
    white: 'border-white',
    green: 'border-green-600',
    red: 'border-red-600'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center" data-testid="loading-spinner">
      <div className={`${sizeClasses[size]} relative`}>
        <div className={`absolute inset-0 border-${colorClasses[color].split('-')[1]}-200 rounded-full`}></div>
        <div className={`absolute inset-0 ${colorClasses[color]} rounded-full animate-spin border-t-transparent`}></div>
      </div>
      {text && (
        <div className="mt-4">
          <p className="text-gray-600 font-medium">{text}</p>
          <div className="mt-2 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="transform scale-110">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;