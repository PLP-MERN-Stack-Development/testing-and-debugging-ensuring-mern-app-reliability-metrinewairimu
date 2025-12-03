import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console for debugging
    console.error('🚨 Error caught by boundary:', error);
    console.error('📋 Component stack:', errorInfo.componentStack);
    
    // Here you could also send the error to a monitoring service
    // sendErrorToService(error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    // Redirect to bug report page with error details
    const errorDetails = encodeURIComponent(JSON.stringify({
      error: this.state.error?.toString(),
      componentStack: this.state.errorInfo?.componentStack,
      url: window.location.href,
      timestamp: new Date().toISOString()
    }));
    window.location.href = `/report?error=${errorDetails}`;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div 
          className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4"
          data-testid="error-boundary"
        >
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full transform transition-all hover:scale-[1.02] duration-300">
            <div className="text-center">
              <div className="text-8xl mb-4 animate-bounce">🐞</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-3">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 mb-6 text-lg">
                The application encountered an unexpected error. Don't worry, our team has been notified.
              </p>
              
              {/* Error details for developers */}
              {import.meta.env.DEV && (
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg mb-8 text-left transition-all hover:bg-gray-100">
                  <details className="cursor-pointer">
                    <summary className="font-semibold text-gray-700 text-lg mb-3 flex items-center justify-between">
                      <span>🔧 Developer Details</span>
                      <span className="text-sm text-gray-500">(Development Only)</span>
                    </summary>
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Error Message:</h4>
                        <pre className="text-sm text-red-600 bg-red-50 p-3 rounded overflow-auto max-h-40">
                          {this.state.error?.toString()}
                        </pre>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Component Stack:</h4>
                        <pre className="text-sm text-gray-600 bg-gray-50 p-3 rounded overflow-auto max-h-60 text-xs">
                          {this.state.errorInfo?.componentStack}
                        </pre>
                      </div>
                    </div>
                  </details>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <button
                  onClick={this.handleReload}
                  className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover:shadow-lg transform hover:-translate-y-1 flex flex-col items-center justify-center"
                >
                  <span className="text-2xl mb-2">🔄</span>
                  <span className="font-medium">Reload Page</span>
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="px-6 py-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all hover:shadow-lg transform hover:-translate-y-1 flex flex-col items-center justify-center"
                >
                  <span className="text-2xl mb-2">🏠</span>
                  <span className="font-medium">Go Home</span>
                </button>
                
                <button
                  onClick={this.handleReportBug}
                  className="px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all hover:shadow-lg transform hover:-translate-y-1 flex flex-col items-center justify-center"
                >
                  <span className="text-2xl mb-2">📋</span>
                  <span className="font-medium">Report Issue</span>
                </button>
              </div>
              
              {/* Help text */}
              <div className="border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-500">
                  If the problem persists, please contact our support team or check our status page.
                </p>
                <div className="mt-4 flex justify-center space-x-6">
                  <a href="/contact" className="text-blue-600 hover:text-blue-800 text-sm">
                    Contact Support
                  </a>
                  <a href="/status" className="text-blue-600 hover:text-blue-800 text-sm">
                    System Status
                  </a>
                  <a href="/docs" className="text-blue-600 hover:text-blue-800 text-sm">
                    Documentation
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Debug info footer */}
          {import.meta.env.DEV && (
            <div className="mt-8 text-xs text-gray-500 text-center">
              <p>Environment: {import.meta.env.MODE} | URL: {window.location.href}</p>
              <p className="mt-1">Time: {new Date().toLocaleString()}</p>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;