import { LoaderIcon, XIcon } from './Icons.jsx'

const ProcessingModal = ({ 
  isOpen, 
  processingStage, 
  processingProgress, 
  onCancel 
}) => {
  const stages = [
    'Upload Certificate',
    'OCR Text Extraction', 
    'Content Analysis',
    'Degree Evaluation',
    'Credit Calculation',
    'Results Generation'
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Processing Document</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* Overall Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-500">{processingProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-oamk-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${processingProgress}%` }}
            ></div>
          </div>
        </div>
        
        {/* Current Stage */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <LoaderIcon className="w-5 h-5 text-oamk-orange-500 mr-2" />
            <span className="font-medium text-gray-800">
              {stages[processingStage] || 'Processing...'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div className="bg-oamk-orange-400 h-1 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Stage List */}
        <div className="space-y-2">
          {stages.map((stage, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-4 h-4 rounded-full mr-3 ${
                index < processingStage 
                  ? 'bg-green-500' 
                  : index === processingStage 
                    ? 'bg-oamk-orange-500 animate-pulse' 
                    : 'bg-gray-300'
              }`}></div>
              <span className={`text-sm ${
                index < processingStage 
                  ? 'text-green-600 font-medium' 
                  : index === processingStage 
                    ? 'text-oamk-orange-600 font-medium' 
                    : 'text-gray-500'
              }`}>
                {stage}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors duration-200"
          >
            Cancel Processing
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProcessingModal 