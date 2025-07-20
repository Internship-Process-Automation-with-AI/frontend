import { CheckCircleIcon, DownloadIcon, StarIcon } from './Icons.jsx'
import Header from './Header.jsx'
import StepIndicator from './StepIndicator.jsx'

const Feedback = ({ 
  results, 
  userFeedback, 
  setUserFeedback, 
  onSendFeedback, 
  onBackToDashboard 
}) => {
  const getDecisionColor = (decision) => {
    switch (decision) {
      case 'ACCEPTED': return 'text-green-600'
      case 'REJECTED': return 'text-red-600'
      case 'PENDING': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getDecisionBg = (decision) => {
    switch (decision) {
      case 'ACCEPTED': return 'bg-green-50 border-green-200'
      case 'REJECTED': return 'bg-red-50 border-red-200'
      case 'PENDING': return 'bg-yellow-50 border-yellow-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <div className="max-w-4xl mx-auto py-6 px-4">
        <StepIndicator currentStep={3} />
        
        <div className="card">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircleIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Complete!</h2>
            <p className="text-gray-600">Your document has been successfully analyzed</p>
          </div>
          
          {/* Decision Box */}
          <div className={`rounded-lg border p-6 mb-6 ${getDecisionBg(results.decision)}`}>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-2">DECISION</h3>
              <span className={`px-6 py-2 rounded-full text-lg font-bold ${getDecisionColor(results.decision)}`}>
                {results.decision}
              </span>
            </div>
          </div>
          
          {/* Document Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="card text-center">
              <div className="text-gray-600 text-sm mb-1">Document</div>
              <div className="font-semibold text-gray-800">{results.filename || 'Document'}</div>
            </div>
            <div className="card text-center">
              <div className="text-gray-600 text-sm mb-1">Degree</div>
              <div className="font-semibold text-gray-800">{results.student_degree || 'Not specified'}</div>
            </div>
            <div className="card text-center">
              <div className="text-gray-600 text-sm mb-1">Processing Time</div>
              <div className="font-semibold text-gray-800">{results.processing_time || 'N/A'}</div>
            </div>
          </div>
          
          {/* Evaluation Results Box */}
          <div className="card mb-6">
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Evaluation Results</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Key Metrics */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Working Hours</p>
                  <p className="text-xl font-bold text-gray-800">
                    {results.training_hours ? results.training_hours.toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Requested Training Type</p>
                  <p className="text-xl font-bold text-gray-800">{results.requested_training_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Credits Calculated</p>
                  <p className="text-xl font-bold text-gray-800">{results.credits || 'N/A'} ECTS</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Degree Relevance</p>
                  <p className="text-xl font-bold text-gray-800 capitalize">{results.degree_relevance}</p>
                </div>
              </div>
              
              {/* Right Column - Evidence Boxes */}
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Supporting Evidence</h4>
                  <p className="text-green-700 text-sm">
                    {results.supporting_evidence || 'No supporting evidence available.'}
                  </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Challenging Evidence</h4>
                  <p className="text-yellow-700 text-sm">
                    {results.challenging_evidence || 'No challenging evidence available.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* AI Recommendation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-800 mb-2">AI Recommendation</h4>
            <p className="text-blue-700 text-sm">
              {results.recommendation || 'No recommendation available.'}
            </p>
          </div>
          
          {/* Justification */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">Justification</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              {results.justification || 'No justification available.'}
            </p>
          </div>
          

          
          {/* Download Results */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-800 mb-1">Download Results</h4>
                <p className="text-blue-700 text-sm">Get a detailed PDF report of your evaluation</p>
              </div>
              <button className="btn-primary flex items-center">
                <DownloadIcon className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
          
          {/* Feedback Section */}
          <div className="card">
            <h4 className="font-semibold text-gray-800 mb-3">Rate Your Experience</h4>
            <div className="flex items-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} className="w-6 h-6 text-gray-300 hover:text-yellow-400 cursor-pointer" />
              ))}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Feedback (Optional)
              </label>
              <textarea
                value={userFeedback}
                onChange={(e) => setUserFeedback(e.target.value)}
                placeholder="Share your thoughts about the evaluation process..."
                className="input-field h-24 resize-none"
              />
            </div>
            
            <button
              onClick={onSendFeedback}
              className="btn-primary w-full"
            >
              Submit Feedback
            </button>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-center mt-8">
            <button
              onClick={onBackToDashboard}
              className="btn-secondary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Feedback 