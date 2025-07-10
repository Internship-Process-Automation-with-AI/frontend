import { useState } from 'react';
import apiService from '../api.js';
import { useApiLoading, useDocumentProcessing } from '../hooks/useApiLoading.js';
import CacheStatus from './CacheStatus.jsx';

const FeatureDemo = () => {
  const [demoResults, setDemoResults] = useState(null);
  const { hasActiveRequests, overallProgress, currentOperation } = useApiLoading();
  const { isProcessing, progress } = useDocumentProcessing();

  const handleTestHealthCheck = async () => {
    try {
      const health = await apiService.checkHealth();
      setDemoResults({ type: 'health', data: health });
    } catch (error) {
      setDemoResults({ type: 'error', data: error.message });
    }
  };

  const handleTestDegreePrograms = async () => {
    try {
      const degrees = await apiService.getDegreePrograms();
      setDemoResults({ type: 'degrees', data: degrees });
    } catch (error) {
      setDemoResults({ type: 'error', data: error.message });
    }
  };

  const handleTestCacheRefresh = async () => {
    try {
      const degrees = await apiService.refreshDegreePrograms();
      setDemoResults({ type: 'cache_refresh', data: degrees });
    } catch (error) {
      setDemoResults({ type: 'error', data: error.message });
    }
  };

  const handleClearCache = () => {
    apiService.clearCache();
    setDemoResults({ type: 'cache_cleared', data: 'Cache cleared successfully' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">🚀 Enhanced API Features Demo</h2>
        <p className="text-gray-600 mb-6">
          This demo showcases the new caching and loading state features.
        </p>

        {/* Loading State Display */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Loading States</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Active Requests</div>
              <div className="text-2xl font-bold text-oamk-orange-600">
                {hasActiveRequests ? 'Yes' : 'No'}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Overall Progress</div>
              <div className="text-2xl font-bold text-oamk-orange-600">
                {overallProgress}%
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Current Operation</div>
              <div className="text-sm text-gray-600">
                {currentOperation?.type || 'None'}
              </div>
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Test API Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleTestHealthCheck}
              disabled={hasActiveRequests}
              className="btn-secondary disabled:opacity-50"
            >
              Test Health Check
            </button>
            
            <button
              onClick={handleTestDegreePrograms}
              disabled={hasActiveRequests}
              className="btn-secondary disabled:opacity-50"
            >
              Test Degree Programs
            </button>
            
            <button
              onClick={handleTestCacheRefresh}
              disabled={hasActiveRequests}
              className="btn-secondary disabled:opacity-50"
            >
              Test Cache Refresh
            </button>
            
            <button
              onClick={handleClearCache}
              className="btn-secondary"
            >
              Clear All Cache
            </button>
          </div>
        </div>

        {/* Cache Status */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Cache Management</h3>
          <CacheStatus />
        </div>

        {/* Results Display */}
        {demoResults && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Test Results</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700 mb-2">
                {demoResults.type === 'error' ? 'Error' : 'Success'}
              </div>
              <pre className="text-xs text-gray-600 bg-white p-3 rounded border overflow-auto">
                {JSON.stringify(demoResults.data, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Feature Benefits */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">✨ Feature Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Caching Benefits:</h4>
              <ul className="text-blue-600 space-y-1">
                <li>• Faster loading of degree programs</li>
                <li>• Reduced API calls</li>
                <li>• Better offline experience</li>
                <li>• Automatic cache expiration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Loading States Benefits:</h4>
              <ul className="text-blue-600 space-y-1">
                <li>• Real-time progress tracking</li>
                <li>• Better user feedback</li>
                <li>• Professional loading experience</li>
                <li>• Detailed operation status</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureDemo; 