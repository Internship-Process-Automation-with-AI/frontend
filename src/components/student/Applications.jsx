import { ClockIcon, CheckCircleIcon, AlertCircleIcon, UserIcon } from '../common/Icons.jsx'
import Header from '../common/Header.jsx'
import { useState } from 'react'

const Applications = ({ applications, onBackToDashboard, onDeleteApplication, onViewApplicationDetails, onContinueProcessing, onSubmitAppeal }) => {
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState(null)

  const handleDelete = async (applicationId, event) => {
    // Prevent the click event from bubbling up to the parent container
    event.stopPropagation()
    
    if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingId(applicationId)
      setError(null)
      await onDeleteApplication(applicationId)
    } catch (err) {
      setError('Failed to delete application. Please try again.')
      console.error('Delete error:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'REJECTED':
        return <AlertCircleIcon className="w-5 h-5 text-red-500" />
      case 'PENDING_FOR_APPROVAL':
        return <UserIcon className="w-5 h-5 text-blue-500" />
      case 'REVIEWED':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'APPEAL_PENDING':
        return <ClockIcon className="w-5 h-5 text-orange-500" />
      case 'APPEAL_APPROVED':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'APPEAL_REJECTED':
        return <AlertCircleIcon className="w-5 h-5 text-red-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'text-green-600 bg-green-50'
      case 'REJECTED': return 'text-red-600 bg-red-50'
      case 'PENDING_FOR_APPROVAL': return 'text-blue-600 bg-blue-50'
      case 'REVIEWED': return 'text-green-600 bg-green-50'
      case 'APPEAL_PENDING': return 'text-orange-600 bg-orange-50'
      case 'APPEAL_APPROVED': return 'text-green-600 bg-green-50'
      case 'APPEAL_REJECTED': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getDisplayStatus = (app) => {
    // If reviewer has made a decision, show the reviewer's decision
    if (app.reviewer_decision) {
      return app.reviewer_decision === 'PASS' ? 'Approved' : 'Rejected'
    }
    
    // If status is PENDING_FOR_APPROVAL, show as pending
    if (app.status === 'PENDING_FOR_APPROVAL') {
      return 'Pending for Approval'
    }
    
    // For other statuses, format normally
    return app.status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.toLowerCase().slice(1)
    ).join(' ')
  }

  const getDisplayIcon = (app) => {
    // If reviewer has made a decision, show based on reviewer decision
    if (app.reviewer_decision) {
      return app.reviewer_decision === 'PASS' ? 
        <CheckCircleIcon className="w-5 h-5 text-green-500" /> : 
        <AlertCircleIcon className="w-5 h-5 text-red-500" />
    }
    
    // Otherwise use the status-based icon
    return getStatusIcon(app.status)
  }

  const getDisplayColor = (app) => {
    // If reviewer has made a decision, show based on reviewer decision
    if (app.reviewer_decision) {
      return app.reviewer_decision === 'PASS' ? 
        'text-green-600 bg-green-50' : 
        'text-red-600 bg-red-50'
    }
    
    // Otherwise use the status-based color
    return getStatusColor(app.status)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatStatus = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.toLowerCase().slice(1)
    ).join(' ')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <div className="max-w-6xl mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Applications</h1>
          <button
            onClick={() => onBackToDashboard('dashboard')}
            className="btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {applications.length === 0 ? (
          <div className="card text-center py-12">
            <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Applications Yet</h3>
            <p className="text-gray-600 mb-6">You haven't submitted any applications for training credits yet.</p>
            <button
              onClick={() => onBackToDashboard('upload')}
              className="btn-primary"
            >
              Apply for Training Credits
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app, index) => (
              <div 
                key={index} 
                className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => onViewApplicationDetails(app)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getDisplayIcon(app)}
                    <div>
                      <h3 className="font-semibold text-gray-800">{app.training_type} TRAINING</h3>
                      <p className="text-sm text-gray-600">
                        Submitted on {formatDate(app.submitted_date)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDisplayColor(app)}`}>
                      {getDisplayStatus(app)}
                    </span>
                    
                    {/* Show credits only if reviewer approved */}
                    {app.reviewer_decision === 'PASS' && app.credits > 0 && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Credits Awarded</p>
                        <p className="font-semibold text-green-600">{app.credits} ECTS</p>
                      </div>
                    )}

                    <button
                      onClick={(event) => handleDelete(app.certificate_id || app.id, event)}
                      disabled={deletingId === (app.certificate_id || app.id)}
                      className="px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete application"
                    >
                      {deletingId === (app.certificate_id || app.id) ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Show reviewer information for pending applications */}
                {app.status === 'PENDING_FOR_APPROVAL' && !app.reviewer_decision && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {/* <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <UserIcon className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">
                          Sent for approval to reviewer
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">Waiting for review...</span>
                      </div>
                    </div> */}
                    {app.reviewer_name && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Assigned Reviewer:</span> {app.reviewer_name}
                      </div>
                    )}
                  </div>
                )}

                {/* Show reviewer decision for reviewed applications */}
                {app.reviewer_decision && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {app.reviewer_decision === 'PASS' ? (
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircleIcon className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm text-gray-600">
                          {app.reviewer_decision === 'PASS' ? 'Approved' : 'Rejected'} by reviewer
                        </span>
                      </div>
                      {app.reviewed_date && (
                        <div className="text-sm text-gray-500">
                          {formatDate(app.reviewed_date)}
                        </div>
                      )}
                    </div>
                    {app.reviewer_name && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Reviewer:</span> {app.reviewer_name}
                      </div>
                    )}
                    {app.reviewer_comment && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-1">Reviewer's Comment:</div>
                        <div className="text-sm text-gray-600">{app.reviewer_comment}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Only show "Continue Processing" for ACCEPTED applications without reviewer decision */}
                {/* {app.status === 'ACCEPTED' && !app.reviewer_decision && !app.reviewer_name && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-yellow-800">
                              Application not yet sent for approval
                            </p>
                            <p className="text-sm text-yellow-700">
                              Your application has been accepted but needs to be sent to a reviewer for final approval.
                            </p>
                          </div>
                        </div>
                        <button 
                          className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                          onClick={(event) => {
                            event.stopPropagation()
                            onContinueProcessing(app)
                          }}
                        >
                          Continue Processing
                        </button>
                      </div>
                    </div>
                  </div>
                )} */}

                {/* REJECTED applications that haven't been appealed yet */}
                {app.status === 'REJECTED' && !app.appeal_status && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-red-800">
                              Application rejected - No appeal submitted
                            </p>
                            <p className="text-sm text-red-700">
                              Your application was rejected. You can submit an appeal if you believe this decision was incorrect.
                            </p>
                          </div>
                        </div>
                        <button 
                          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                          onClick={(event) => {
                            event.stopPropagation()
                            onSubmitAppeal(app)
                          }}
                        >
                          Submit Appeal
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Appeal Information */}
                {app.appeal_status && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-600">
                          Appeal {app.appeal_status.toLowerCase()}
                        </span>
                      </div>
                      {app.appeal_status === 'PENDING' && (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-gray-600">Under review...</span>
                        </div>
                      )}
                      {app.appeal_status === 'REJECTED' && (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-red-600 font-medium">Appeal rejected</span>
                        </div>
                      )}
                      {app.appeal_status === 'APPROVED' && (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600 font-medium">Appeal approved</span>
                        </div>
                      )}
                    </div>
                    
                    {app.appeal_submitted_date && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Appeal submitted:</span> {new Date(app.appeal_submitted_date).toLocaleDateString()}
                      </div>
                    )}
                    
                    {app.appeal_reviewer_name && (
                      <div className="mt-1 text-sm text-gray-600">
                        <span className="font-medium">Appeal reviewer:</span> {app.appeal_reviewer_name}
                      </div>
                    )}
                    
                    {app.appeal_review_comment && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-1">Reviewer's Comment:</div>
                        <div className="text-sm text-gray-600">{app.appeal_review_comment}</div>
                      </div>
                    )}
                    
                    {app.appeal_reviewed_date && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Appeal reviewed:</span> {new Date(app.appeal_reviewed_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Applications 