import React, { useState, useEffect } from 'react'
import { getReviewers, sendForApproval } from '../../api_calls/studentAPI.js'

const Approval = ({ 
  results, 
  onBackToDashboard,
  certificateId 
}) => {
  const [selectedReviewer, setSelectedReviewer] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState(null)
  const [reviewers, setReviewers] = useState([])
  const [isLoadingReviewers, setIsLoadingReviewers] = useState(true)

  // Helper function to safely render values
  const safeRender = (value, fallback = 'N/A') => {
    if (value === null || value === undefined) return fallback
    if (typeof value === 'object') {
      return JSON.stringify(value)
    }
    return String(value)
  }

  // Extract values from the results object safely
  const decisionData = results?.decision || {}
  const decision = decisionData.ai_decision || results?.ai_decision || 'UNKNOWN'
  const credits = decisionData.credits_awarded || results?.credits || 0
  const filename = results?.filename || 'Document'
  const trainingType = results?.requested_training_type || results?.training_type || 'Not specified'

  // Fetch reviewers from API
  useEffect(() => {
    const fetchReviewers = async () => {
      try {
        const reviewersData = await getReviewers()
        setReviewers(reviewersData)
      } catch (err) {
        console.error('Error fetching reviewers:', err)
        setError('Failed to load reviewers. Please try again.')
      } finally {
        setIsLoadingReviewers(false)
      }
    }

    fetchReviewers()
  }, [])

  const handleSendApproval = async () => {
    if (!selectedReviewer) {
      setError('Please select a reviewer.')
      return
    }

    if (!certificateId) {
      setError('No certificate ID available. Please go back and try again.')
      return
    }

    try {
      setIsSending(true)
      setError(null)
      
      console.log('Sending for approval:', { certificateId, selectedReviewer })
      
      await sendForApproval(certificateId, selectedReviewer)
      setIsSent(true)
    } catch (err) {
      console.error('Approval submission error:', err)
      setError(err.message || 'Failed to send for approval. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  if (isSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
        <div className="max-w-md mx-auto px-4">
          <div className="card text-center">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Approval Request Sent!</h2>
            <p className="text-gray-600 mb-6">
              Your application has been successfully sent for approval. The selected reviewer will be notified and will review your application shortly.
            </p>
            <button
              onClick={() => onBackToDashboard('dashboard')}
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Send for Approval</h1>
          <p className="text-gray-600">Select a reviewer to approve your application</p>
        </div>

        {/* Decision Summary */}
        <div className="card mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Application Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Document</p>
              <p className="font-semibold text-gray-800">{filename}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Decision</p>
              <p className={`font-semibold ${decision === 'ACCEPTED' ? 'text-green-600' : 'text-red-600'}`}>
                {decision}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Credits</p>
              <p className="font-semibold text-gray-800">{credits} ECTS</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Training Type</p>
              <p className="font-semibold text-gray-800">{trainingType}</p>
            </div>
          </div>
        </div>

        {/* Reviewer Selection */}
        <div className="card mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Select Reviewer</h3>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {isLoadingReviewers ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading reviewers...</p>
            </div>
          ) : reviewers.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No reviewers available at the moment.
            </div>
          ) : (
            <div className="space-y-3">
              {reviewers.map((reviewer) => {
                const reviewerName = reviewer.first_name && reviewer.last_name 
                  ? `${reviewer.first_name} ${reviewer.last_name}`
                  : reviewer.first_name || reviewer.last_name || reviewer.email.split('@')[0]
                
                return (
                  <label
                    key={reviewer.reviewer_id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedReviewer === reviewer.reviewer_id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reviewer"
                      value={reviewer.reviewer_id}
                      checked={selectedReviewer === reviewer.reviewer_id}
                      onChange={(e) => setSelectedReviewer(e.target.value)}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{reviewerName}</div>
                      <div className="text-sm text-gray-600">{reviewer.email}</div>
                      {reviewer.position && (
                        <div className="text-sm text-gray-700">{reviewer.position}</div>
                      )}
                      {reviewer.department && (
                        <div className="text-xs text-gray-500">{reviewer.department}</div>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => onBackToDashboard('dashboard')}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
          <button
            onClick={handleSendApproval}
            disabled={isSending || !selectedReviewer}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Approval 