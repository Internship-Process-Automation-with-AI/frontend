import { useState, useEffect } from 'react';
import { requestInterceptor } from '../api.js';

/**
 * Custom hook for tracking API loading states and progress
 * @returns {Object} Loading state information
 */
export const useApiLoading = () => {
  const [loadingStates, setLoadingStates] = useState({
    activeRequests: [],
    hasActiveRequests: false,
    overallProgress: 0,
    currentOperation: null
  });

  useEffect(() => {
    // Subscribe to request interceptor updates
    const unsubscribe = requestInterceptor.subscribe((activeRequests) => {
      const hasActiveRequests = activeRequests.length > 0;
      
      // Calculate overall progress
      const overallProgress = hasActiveRequests 
        ? activeRequests.reduce((sum, req) => sum + req.progress, 0) / activeRequests.length
        : 0;
      
      // Get current operation info
      const currentOperation = hasActiveRequests 
        ? activeRequests[activeRequests.length - 1] 
        : null;

      setLoadingStates({
        activeRequests,
        hasActiveRequests,
        overallProgress: Math.round(overallProgress),
        currentOperation
      });
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  return loadingStates;
};

/**
 * Hook for tracking specific operation types
 * @param {string} operationType - Type of operation to track (e.g., 'process_document', 'health_check')
 * @returns {Object} Loading state for specific operation
 */
export const useOperationLoading = (operationType) => {
  const { activeRequests, hasActiveRequests } = useApiLoading();
  
  const operationRequests = activeRequests.filter(req => req.type === operationType);
  const isActive = operationRequests.length > 0;
  const progress = isActive 
    ? operationRequests.reduce((sum, req) => sum + req.progress, 0) / operationRequests.length
    : 0;
  
  const currentRequest = operationRequests[operationRequests.length - 1] || null;

  return {
    isActive,
    progress: Math.round(progress),
    currentRequest,
    requestCount: operationRequests.length
  };
};

/**
 * Hook for document processing specific loading
 * @returns {Object} Document processing loading state
 */
export const useDocumentProcessing = () => {
  const { isActive, progress, currentRequest } = useOperationLoading('process_document');
  
  return {
    isProcessing: isActive,
    progress,
    fileName: currentRequest?.fileName || null,
    fileSize: currentRequest?.fileSize || null,
    startTime: currentRequest?.startTime || null
  };
};

/**
 * Hook for health check loading
 * @returns {Object} Health check loading state
 */
export const useHealthCheck = () => {
  return useOperationLoading('health_check');
};

/**
 * Hook for degree programs loading
 * @returns {Object} Degree programs loading state
 */
export const useDegreeProgramsLoading = () => {
  return useOperationLoading('fetch_degrees');
}; 