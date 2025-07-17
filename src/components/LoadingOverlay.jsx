import { useApiLoading, useDocumentProcessing } from '../hooks/useApiLoading.js';

const LoadingOverlay = () => {
  const { hasActiveRequests, overallProgress, currentOperation } = useApiLoading();
  const { isProcessing, progress, fileName } = useDocumentProcessing();

  if (!hasActiveRequests) {
    return null;
  }

  const getOperationMessage = (operation) => {
    switch (operation?.type) {
      case 'health_check':
        return 'Checking API health...';
      case 'fetch_degrees':
        return 'Loading degree programs...';
      case 'process_document':
        return `Processing ${fileName || 'document'}...`;
      case 'download_report':
        return 'Downloading report...';
      default:
        return 'Processing...';
    }
  };

  const getProgressColor = (progress) => {
    if (progress < 30) return 'bg-blue-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-oamk-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-oamk-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {currentOperation?.type === 'process_document' ? 'Processing Document' : 'Loading'}
          </h3>
          <p className="text-sm text-gray-600">
            {getOperationMessage(currentOperation)}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(overallProgress)}`}
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Document Processing Details */}
        {isProcessing && (
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Document Processing</span>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 bg-oamk-orange-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              {fileName && (
                <p className="text-xs text-gray-500 mt-2 truncate">
                  File: {fileName}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Processing Stages for Document Processing */}
        {isProcessing && (
          <div className="mt-4">
            <div className="text-xs text-gray-500 mb-2">Processing stages:</div>
            <div className="space-y-1">
              {[
                { name: 'Upload', threshold: 10 },
                { name: 'OCR Text Extraction', threshold: 25 },
                { name: 'Content Analysis', threshold: 45 },
                { name: 'Degree Evaluation', threshold: 70 },
                { name: 'Credit Calculation', threshold: 85 },
                { name: 'Results Generation', threshold: 95 }
              ].map((stage, index) => (
                <div key={index} className="flex items-center text-xs">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    progress >= stage.threshold ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span className={progress >= stage.threshold ? 'text-gray-700' : 'text-gray-400'}>
                    {stage.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancel Button (for future implementation) */}
        <div className="text-center mt-6">
          <button 
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            onClick={() => {
              // Future: Implement request cancellation
              console.log('Cancel requested');
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay; 