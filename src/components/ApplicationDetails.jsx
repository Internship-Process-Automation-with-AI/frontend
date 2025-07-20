import React from 'react'
import { ArrowLeftIcon, CheckCircleIcon, AlertCircleIcon, ClockIcon, UserIcon } from './Icons.jsx'

const ApplicationDetails = ({ application, onBackToApplications }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />
      case 'REJECTED':
        return <AlertCircleIcon className="w-6 h-6 text-red-500" />
      case 'PENDING':
        return <ClockIcon className="w-6 h-6 text-yellow-500" />
      case 'PENDING_FOR_APPROVAL':
        return <UserIcon className="w-6 h-6 text-blue-500" />
      case 'APPEAL_PENDING':
        return <ClockIcon className="w-6 h-6 text-orange-500" />
      case 'APPEAL_APPROVED':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />
      case 'APPEAL_REJECTED':
        return <AlertCircleIcon className="w-6 h-6 text-red-500" />
      default:
        return <ClockIcon className="w-6 h-6 text-gray-500" />
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToApplications}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Application Details</h1>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusIcon(application.status)}
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
              {application.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Document</label>
                <p className="text-gray-800 font-medium">{application.filename}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Training Type</label>
                <p className="text-gray-800 font-medium">{application.training_type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Date of Submission</label>
                <p className="text-gray-800">{formatDate(application.submitted_date)}</p>
              </div>

            </div>
          </div>

          {/* Evaluation Results */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Evaluation Results</h2>
            <div className="space-y-4">
              {application.total_working_hours && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Total Working Hours</label>
                  <p className="text-gray-800 font-medium">{application.total_working_hours} hours</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-600">Credits Awarded</label>
                <p className={`font-semibold ${application.credits > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                  {application.credits} ECTS
                </p>
              </div>
              
              {application.degree_relevance && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Degree Relevance</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-800">{application.degree_relevance}</p>
                  </div>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-600">Decision</label>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(application.ai_decision || 'PENDING')}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.ai_decision || 'PENDING')}`}>
                    {application.ai_decision || 'NOT EVALUATED'}
                  </span>
                </div>
              </div>
              
              {application.supporting_evidence && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Supporting Evidence</label>
                  <div className="mt-2 p-4 bg-green-50 rounded-lg">
                    <p className="text-gray-800">{application.supporting_evidence}</p>
                  </div>
                </div>
              )}
              
              {application.challenging_evidence && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Challenging Evidence</label>
                  <div className="mt-2 p-4 bg-red-50 rounded-lg">
                    <p className="text-gray-800">{application.challenging_evidence}</p>
                  </div>
                </div>
              )}
              
              {application.justification && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Justification</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">{application.justification}</p>
                  </div>
                </div>
              )}
              
              {application.recommendation && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Recommendation</label>
                  <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                    <p className="text-gray-800">{application.recommendation}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Status</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Current Status</label>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(application.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                    {application.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
              
              {application.status === 'PENDING_FOR_APPROVAL' && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Waiting for reviewer decision...</span>
                </div>
              )}
            </div>
          </div>



          {/* Review Information */}
          {application.reviewer_name && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Review Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Reviewer</label>
                  <p className="text-gray-800">{application.reviewer_name}</p>
                </div>
                {application.status === 'PENDING_FOR_APPROVAL' && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">Waiting for reviewer decision...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Appeal Information */}
          {application.appeal_status && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Appeal Information</h2>
              <div className="space-y-4">
                
                {application.appeal_submitted_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Appeal Submitted</label>
                    <p className="text-gray-800">{formatDate(application.appeal_submitted_date)}</p>
                  </div>
                )}
                
                {application.appeal_reviewer_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Appeal Reviewer</label>
                    <p className="text-gray-800">{application.appeal_reviewer_name}</p>
                  </div>
                )}
                
                {application.appeal_review_comment && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Reviewer's Comment</label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-800">{application.appeal_review_comment}</p>
                    </div>
                  </div>
                )}
                
                {application.appeal_reviewed_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Appeal Reviewed</label>
                    <p className="text-gray-800">{formatDate(application.appeal_reviewed_date)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Application Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-800">Application Submitted</p>
                  <p className="text-sm text-gray-600">{formatDate(application.submitted_date)}</p>
                </div>
              </div>
              
              {application.decision_date && (
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-800">AI Decision Made</p>
                    <p className="text-sm text-gray-600">{formatDate(application.decision_date)}</p>
                  </div>
                </div>
              )}
              
              {application.status === 'PENDING_FOR_APPROVAL' && (
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-800">Sent for Human Review</p>
                    <p className="text-sm text-gray-600">Currently under review</p>
                  </div>
                </div>
              )}
              
              {application.appeal_submitted_date && (
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-800">Appeal Submitted</p>
                    <p className="text-sm text-gray-600">{formatDate(application.appeal_submitted_date)}</p>
                  </div>
                </div>
              )}
              
              {application.appeal_reviewed_date && (
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-800">Appeal Reviewed</p>
                    <p className="text-sm text-gray-600">{formatDate(application.appeal_reviewed_date)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplicationDetails 