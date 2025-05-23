// Debug utility functions

/**
 * Log API request details for debugging
 * @param endpoint - API endpoint
 * @param method - HTTP method
 * @param data - Request data
 */
export const logApiRequest = (endpoint: string, method: string, data?: any, headers?: any) => {
  console.log('Debug API Request:');
  console.log('- Endpoint:', endpoint);
  console.log('- Method:', method);
  console.log('- Headers:', headers);
  
  if (data) {
    console.log('- Data:', data);
  }
};

/**
 * Format and log error for debugging
 * @param error - Error object
 * @param context - Additional context about where the error occurred
 */
export const logError = (error: any, context: string) => {
  console.error(`Debug Error in ${context}:`);
  
  if (error.response) {
    // Server responded with error status
    console.error('- Status:', error.response.status);
    console.error('- Data:', error.response.data);
    console.error('- Headers:', error.response.headers);
  } else if (error.request) {
    // Request was made but no response received
    console.error('- No response received from server');
    console.error('- Request:', error.request);
  } else {
    // Something else happened in making the request
    console.error('- Message:', error.message);
  }
  
  if (error.config) {
    console.error('- Request URL:', error.config.url);
    console.error('- Request Method:', error.config.method);
    console.error('- Request Data:', error.config.data);
  }
  
  console.error('- Stack:', error.stack);
};
