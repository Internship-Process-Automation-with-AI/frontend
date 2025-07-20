import React, { useState } from 'react'

const Approval = ({ 
  results, 
  onBackToDashboard,
  certificateId,
  onRefreshApplications
}) => {
  const [selectedReviewer, setSelectedReviewer] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState(null)
  const [reviewers, setReviewers] = useState([])
  const [isLoadingReviewers, setIsLoadingReviewers] = useState(true)

  // Load reviewers from the backend
  React.useEffect(() => {
    const loadReviewers = async () => {
      try {
        const response = await fetch('http://localhost:8000/reviewers')
        if (response.ok) {
          const data = await response.json()
          setReviewers(data.reviewers || [])
        } else {
          // Fallback to mock reviewers if API fails
          setReviewers([
            { reviewer_id: '550e8400-e29b-41d4-a716-446655440001', first_name: 'Dr. Anna', last_name: 'Johnson', email: 'anna.johnson@oamk.fi' },
            { reviewer_id: '550e8400-e29b-41d4-a716-446655440002', first_name: 'Prof. Mikael', last_name: 'Andersson', email: 'mikael.andersson@oamk.fi' },
            { reviewer_id: '550e8400-e29b-41d4-a716-446655440003', first_name: 'Dr. Sarah', last_name: 'Chen', email: 'sarah.chen@oamk.fi' },
            { reviewer_id: '550e8400-e29b-41d4-a716-446655440004', first_name: 'Prof. Erik', last_name: 'Lindholm', email: 'erik.lindholm@oamk.fi' },
            { reviewer_id: '550e8400-e29b-41d4-a716-446655440005', first_name: 'Dr. Maria', last_name: 'Rodriguez', email: 'maria.rodriguez@oamk.fi' }
          ])
        }
      } catch (err) {
        console.error('Failed to load reviewers:', err)
        // Fallback to mock reviewers
        setReviewers([
          { reviewer_id: '550e8400-e29b-41d4-a716-446655440001', first_name: 'Dr. Anna', last_name: 'Johnson', email: 'anna.johnson@oamk.fi' },
          { reviewer_id: '550e8400-e29b-41d4-a716-446655440002', first_name: 'Prof. Mikael', last_name: 'Andersson', email: 'mikael.andersson@oamk.fi' },
          { reviewer_id: '550e8400-e29b-41d4-a716-446655440003', first_name: 'Dr. Sarah', last_name: 'Chen', email: 'sarah.chen@oamk.fi' },
          { reviewer_id: '550e8400-e29b-41d4-a716-446655440004', first_name: 'Prof. Erik', last_name: 'Lindholm', email: 'erik.lindholm@oamk.fi' },
          { reviewer_id: '550e8400-e29b-41d4-a716-446655440005', first_name: 'Dr. Maria', last_name: 'Rodriguez', email: 'maria.rodriguez@oamk.fi' }
        ])
      } finally {
        setIsLoadingReviewers(false)
      }
    }
    
    loadReviewers()
  }, [])

  const handleSendApproval = async () => {
    if (!selectedReviewer) {
      setError('Please select a reviewer.')
      return
    }

    try {
      setIsSending(true)
      setError(null)
      
      // Make the actual API call to send for approval
      const requestBody = {
        reviewer_id: selectedReviewer
      }
      
      console.log('Sending approval request:', {
        certificateId,
        selectedReviewer,
        requestBody
      })
      
      const response = await fetch(`http://localhost:8000/certificate/${certificateId}/send-for-approval`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Approval request failed:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        })
        throw new Error(errorData.detail || `Failed to send for approval (${response.status})`)
      }
      
      // Refresh applications list to show updated status
      if (onRefreshApplications) {
        await onRefreshApplications()
      }
      
      setIsSent(true)
    } catch (err) {
      console.error('Approval submission error:', err)
      setError('Failed to send for approval. Please try again.')
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Send for Approval</h1>
          <p className="text-gray-600">Select a reviewer to approve your application</p>
        </div>

        {/* Decision Summary */}
        <div className="card mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Application Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Document</p>
              <p className="font-semibold text-gray-800">{results.filename || 'Document'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Decision</p>
              <p className={`font-semibold ${results.decision === 'ACCEPTED' ? 'text-green-600' : 'text-red-600'}`}>
                {results.decision}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Credits</p>
              <p className="font-semibold text-gray-800">{results.credits || 0} ECTS</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Training Type</p>
              <p className="font-semibold text-gray-800">{results.requested_training_type}</p>
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

          <div className="space-y-3">
            {isLoadingReviewers ? (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <span className="text-gray-600">Loading reviewers...</span>
              </div>
            ) : reviewers.length === 0 ? (
              <div className="text-center py-4 text-gray-600">
                No reviewers available
              </div>
            ) : (
              reviewers.map((reviewer) => (
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
                    <div className="font-semibold text-gray-800">
                      {reviewer.first_name} {reviewer.last_name}
                    </div>
                    <div className="text-sm text-gray-600">{reviewer.email}</div>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={onBackToDashboard}
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