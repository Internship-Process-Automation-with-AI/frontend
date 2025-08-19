import React, { useState } from 'react'
import ConfirmModal from '../common/ConfirmModal.jsx'
import Header from '../common/Header.jsx'
import { 
  ClockIcon, 
  CheckCircleIcon, 
  AlertCircleIcon, 
  UserIcon,
  XCircleIcon
} from '../common/Icons.jsx'

const Applications = ({ applications, onBackToDashboard, onDeleteApplication, onViewApplicationDetails, onContinueProcessing, onSubmitAppeal }) => {
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  const handleDeleteClick = (applicationId, event) => {
    event.stopPropagation()
    setPendingDeleteId(applicationId)
    setConfirmOpen(true)
    }

  const confirmDelete = async () => {
    if (!pendingDeleteId) return
    try {
      setDeletingId(pendingDeleteId)
      setError(null)
      await onDeleteApplication(pendingDeleteId)
    } catch (err) {
      setError('Failed to delete application. Please try again.')
      console.error('Delete error:', err)
    } finally {
      setDeletingId(null)
      setConfirmOpen(false)
      setPendingDeleteId(null)
    }
  }

  const cancelDelete = () => {
    setConfirmOpen(false)
    setPendingDeleteId(null)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />
      case 'ACCEPTED':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'REJECTED':
        return <AlertCircleIcon className="w-5 h-5 text-red-500" />
      case 'PENDING_FOR_APPROVAL':
        return <UserIcon className="w-5 h-5 text-blue-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-50'
      case 'ACCEPTED': return 'text-green-600 bg-green-50'
      case 'REJECTED': return 'text-red-600 bg-red-50'
      case 'PENDING_FOR_APPROVAL': return 'text-blue-600 bg-blue-50'
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
                      onClick={(event) => handleDeleteClick(app.certificate_id || app.id, event)}
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
                    {app.reviewer_name && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Assigned Reviewer:</span> {app.reviewer_name}
                      </div>
                    )}
                  </div>
                )}

                {/* REJECTED applications - show comment option ONLY if AI rejected and no reviewer decision yet */}
                {app.status === 'REJECTED' && !app.student_comment && !app.reviewer_decision && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">❌</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-red-800 mb-1">
                          Application rejected by AI - No comment submitted
                        </h4>
                        <p className="text-sm text-red-700 mb-3">
                          Your application was rejected by our AI system. You can submit a comment and request human review if you believe this decision was incorrect.
                        </p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            onSubmitAppeal(app)
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                          Add Comment & Request Review
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={confirmOpen}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete this application? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}

export default Applications 