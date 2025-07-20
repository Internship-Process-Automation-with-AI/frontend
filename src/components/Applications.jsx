import { ClockIcon, CheckCircleIcon, AlertCircleIcon, DownloadIcon, UserIcon } from './Icons.jsx'
import Header from './Header.jsx'
import { useState } from 'react'

const Applications = ({ applications, onBackToDashboard, onDeleteApplication }) => {
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState(null)

  const handleDelete = async (applicationId) => {
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
      case 'PENDING':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />
      case 'PENDING_FOR_APPROVAL':
        return <UserIcon className="w-5 h-5 text-blue-500" />
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
      case 'PENDING': return 'text-yellow-600 bg-yellow-50'
      case 'PENDING_FOR_APPROVAL': return 'text-blue-600 bg-blue-50'
      case 'APPEAL_PENDING': return 'text-orange-600 bg-orange-50'
      case 'APPEAL_APPROVED': return 'text-green-600 bg-green-50'
      case 'APPEAL_REJECTED': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <div className="max-w-6xl mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Applications</h1>
          <button
            onClick={onBackToDashboard}
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
              onClick={onBackToDashboard}
              className="btn-primary"
            >
              Apply for Training Credits
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app, index) => (
              <div key={index} className="card hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(app.status)}
                    <div>
                      <h3 className="font-semibold text-gray-800">{app.training_type}</h3>
                      <p className="text-sm text-gray-600">
                        Submitted on {new Date(app.submitted_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                    
                    {app.status === 'ACCEPTED' && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Credits Awarded</p>
                        <p className="font-semibold text-green-600">{app.credits} ECTS</p>
                      </div>
                    )}
                    
                    {app.status === 'ACCEPTED' && (
                      <button className="btn-primary flex items-center">
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Download
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(app.certificate_id || app.id)}
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
                
                {app.status === 'PENDING' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Processing time: Usually 2-3 business days</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">Processing...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {app.status === 'PENDING_FOR_APPROVAL' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
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
                    </div>
                    {app.reviewer_name && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Reviewer:</span> {app.reviewer_name}
                      </div>
                    )}
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