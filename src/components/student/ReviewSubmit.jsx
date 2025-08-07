import { FileTextIcon } from '../common/Icons.jsx'
import Header from '../common/Header.jsx'
import StepIndicator from './StepIndicator.jsx'

const ReviewSubmit = ({ 
  formData, 
  onBackToUpload, 
  onProcessDocument 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <div className="max-w-2xl mx-auto py-6 px-4">
        <StepIndicator currentStep={2} />
        
        <div className="card">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Review & Submit</h2>
            <p className="text-gray-600">Please review your information before processing</p>
          </div>
          
          <div className="space-y-6">
            {/* Document Review */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Document Information</h3>
              <div className="flex items-center">
                <FileTextIcon className="w-8 h-8 text-oamk-orange-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">{formData.document?.name}</p>
                  <p className="text-sm text-gray-500">
                    {(formData.document?.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
            
            {/* Training Type Review */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Training Type</h3>
              <p className="text-gray-700 capitalize">
                {formData.trainingType?.replace('-', ' ')}
              </p>
            </div>
            
            {/* Processing Information */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start">
                <div className="bg-green-100 rounded-full p-2 mr-4">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">Ready to Process!</h3>
                  <p className="text-sm text-green-700 leading-relaxed">
                    We're all set to evaluate your training certificate. Our system will analyze your document and provide you with a detailed assessment of your training credits. You'll receive your results shortly, and if you have any questions about the evaluation, our support team is here to help.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={onBackToUpload}
              className="btn-secondary"
            >
              Back to Upload
            </button>
            <button
              onClick={onProcessDocument}
              className="btn-primary"
            >
              Process Document
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewSubmit 