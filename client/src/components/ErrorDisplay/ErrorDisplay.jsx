import React, { useState } from 'react';

const ErrorDisplay = ({ 
  error, 
  onRetry, 
  className = '',
  dismissible = false,
  title = 'Error'
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!error || !isVisible) return null;

  const getErrorIcon = (type) => {
    switch (type) {
      case 'network':
        return '📡';
      case 'auth':
        return '🔐';
      case 'validation':
        return '📝';
      case 'not-found':
        return '🔍';
      case 'server':
        return '🖥️';
      case 'permission':
        return '🚫';
      default:
        return '❌';
    }
  };

  const getErrorColor = (type) => {
    switch (type) {
      case 'network':
        return 'bg-yellow-50 border-yellow-200';
      case 'auth':
        return 'bg-red-50 border-red-200';
      case 'validation':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <div 
      className={`${getErrorColor(error.type)} border rounded-lg p-5 shadow-sm ${className} transition-all duration-300 hover:shadow-md`}
      data-testid="error-display"
      role="alert"
    >
      <div className="flex items-start">
        <div className="text-3xl mr-4 flex-shrink-0">{getErrorIcon(error.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">{title}</h3>
              <p className="text-gray-700 mt-1">{error.message}</p>
            </div>
            {dismissible && (
              <button
                onClick={handleDismiss}
                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss error"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Validation errors */}
          {error.errors && Array.isArray(error.errors) && error.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 text-sm mb-2">Please fix the following:</h4>
              <ul className="space-y-1">
                {error.errors.map((err, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <span className="text-red-500 mr-2 mt-0.5">•</span>
                    <span className="text-gray-600">
                      {err.field && <span className="font-medium">{err.field}: </span>}
                      {err.message || err}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Error details for debugging */}
          {import.meta.env.DEV && error.details && (
            <div className="mt-4">
              <details className="cursor-pointer">
                <summary className="text-sm text-gray-500 font-medium">Debug Details</summary>
                <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-3 rounded overflow-auto max-h-40">
                  {JSON.stringify(error.details, null, 2)}
                </pre>
              </details>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Reload Page
            </button>
            
            <a
              href="/contact"
              className="px-4 py-2 bg-transparent text-blue-600 rounded-md hover:bg-blue-50 transition-colors border border-blue-200 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;