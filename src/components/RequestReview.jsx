import React, { useState } from 'react'

const RequestReview = ({ 
  results, 
  onBackToDashboard,
  certificateId,
  onRefreshApplications
}) => {
  const [appealReason, setAppealReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmitAppeal = async () => {
    if (!appealReason.trim()) {
      setError('Please provide a reason for your appeal.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      
      // Make the API call to submit appeal
      const response = await fetch(`http://localhost:8000/certificate/${certificateId}/appeal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appeal_reason: appealReason
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Failed to submit appeal')
      }
      
      setIsSubmitted(true)
      // Refresh applications list after successful appeal submission
      if (onRefreshApplications) {
        onRefreshApplications()
      }
    } catch (err) {
      console.error('Appeal submission error:', err)
      setError('Failed to submit appeal. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
        <div className="max-w-md mx-auto px-4">
          <div className="card text-center">
            <div className="text-blue-600 text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Appeal Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Your appeal has been successfully submitted. A reviewer will review your case and you will be notified of the outcome.
            </p>
            <button
              onClick={onBackToDashboard}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Request Review</h1>
          <p className="text-gray-600">Submit an appeal for your rejected application</p>
        </div>

        {/* Application Summary */}
        <div className="card mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Application Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Document</p>
              <p className="font-semibold text-gray-800">{results.filename || 'Document'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Decision</p>
              <p className="font-semibold text-red-600">REJECTED</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Training Type</p>
              <p className="font-semibold text-gray-800">{results.requested_training_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Credits</p>
              <p className="font-semibold text-gray-800">{results.credits || 0} ECTS</p>
            </div>
          </div>
        </div>

        {/* Appeal Form */}
        <div className="card mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Appeal Details</h3>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for Appeal *
              </label>
              <textarea
                value={appealReason}
                onChange={(e) => setAppealReason(e.target.value)}
                placeholder="Please explain why you believe this decision should be reviewed. Include any additional information or evidence that supports your case..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="6"
              />
              <p className="text-sm text-gray-500 mt-1">
                Be specific and provide relevant details to support your appeal.
              </p>
            </div>
          </div>
        </div>

        {/* Appeal Guidelines */}
        <div className="card mb-6 bg-blue-50 border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Appeal Guidelines</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Appeals are reviewed by academic staff within 5-7 business days</li>
            <li>• Provide specific reasons why the decision should be reconsidered</li>
            <li>• Include any additional documentation or evidence if available</li>
            <li>• Appeals are only accepted for valid academic or procedural reasons</li>
            <li>• You will be notified of the appeal outcome via email</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={onBackToDashboard}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitAppeal}
            disabled={isSubmitting || !appealReason.trim()}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Appeal'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RequestReview 