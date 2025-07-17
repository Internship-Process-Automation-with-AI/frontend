import { useState, useEffect } from 'react';
import apiService from '../api.js';

const CacheStatus = () => {
  const [cacheStatus, setCacheStatus] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Get initial cache status
    setCacheStatus(apiService.getCacheStatus());
  }, []);

  const handleRefreshDegrees = async () => {
    setIsRefreshing(true);
    try {
      await apiService.refreshDegreePrograms();
      setCacheStatus(apiService.getCacheStatus());
    } catch (error) {
      console.error('Failed to refresh degree programs:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshHealth = async () => {
    setIsRefreshing(true);
    try {
      await apiService.refreshHealthCheck();
      setCacheStatus(apiService.getCacheStatus());
    } catch (error) {
      console.error('Failed to refresh health check:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearAllCache = () => {
    apiService.clearCache();
    setCacheStatus(apiService.getCacheStatus());
  };

  if (!cacheStatus) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
        Cache Status
      </h4>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Degree Programs:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            cacheStatus.degrees === 'cached' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {cacheStatus.degrees === 'cached' ? 'Cached' : 'Not Cached'}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">API Health:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            cacheStatus.health === 'cached' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {cacheStatus.health === 'cached' ? 'Cached' : 'Not Cached'}
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={handleRefreshDegrees}
          disabled={isRefreshing}
          className="w-full text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-md transition-colors disabled:opacity-50"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Degree Programs'}
        </button>
        
        <button
          onClick={handleRefreshHealth}
          disabled={isRefreshing}
          className="w-full text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-md transition-colors disabled:opacity-50"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Health Check'}
        </button>
        
        <button
          onClick={handleClearAllCache}
          className="w-full text-xs bg-red-50 hover:bg-red-100 text-red-700 py-2 px-3 rounded-md transition-colors"
        >
          Clear All Cache
        </button>
      </div>
    </div>
  );
};

export default CacheStatus; 