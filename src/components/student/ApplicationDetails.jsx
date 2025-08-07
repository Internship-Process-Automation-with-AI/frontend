import React, { useState } from 'react'
import { ArrowLeftIcon, CheckCircleIcon, AlertCircleIcon, ClockIcon, UserIcon, EyeIcon, DownloadIcon } from '../common/Icons.jsx'
import PreviewModal from '../common/PreviewModal.jsx'
import apiService from '../../api.js'

const ApplicationDetails = ({ application, onBackToApplications }) => {
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />
      case 'REJECTED':
        return <AlertCircleIcon className="w-6 h-6 text-red-500" />
      case 'PENDING_FOR_APPROVAL':
        return <UserIcon className="w-6 h-6 text-blue-500" />
      case 'REVIEWED':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />
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
      case 'PENDING_FOR_APPROVAL': return 'text-blue-600 bg-blue-50'
      case 'REVIEWED': return 'text-green-600 bg-green-50'
      case 'APPEAL_PENDING': return 'text-orange-600 bg-orange-50'
      case 'APPEAL_APPROVED': return 'text-green-600 bg-green-50'
      case 'APPEAL_REJECTED': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
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

  const handlePreview = async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('Preview request for certificate_id:', application.certificate_id)
      
      // Check if the file type can be previewed
      const fileExtension = application.filename.split('.').pop()?.toLowerCase()
      const previewableTypes = ['pdf', 'jpg', 'jpeg', 'png']
      const downloadOnlyTypes = ['docx', 'doc', 'txt', 'rtf']
      
      if (downloadOnlyTypes.includes(fileExtension)) {
        setError('This file type cannot be previewed in the browser. Please use the download button to view the document.')
        return
      }
      
      if (!previewableTypes.includes(fileExtension)) {
        setError('This file type cannot be previewed in the browser. Please download the file to view it.')
        return
      }
      
      const url = await apiService.previewCertificate(application.certificate_id)
      setPreviewUrl(url)
      setIsPreviewOpen(true)
    } catch (err) {
      setError('Failed to load preview. Please try again.')
      console.error('Preview error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('Download request for certificate_id:', application.certificate_id)
      await apiService.downloadCertificate(application.certificate_id)
    } catch (err) {
      setError('Failed to download document. Please try again.')
      console.error('Download error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const closePreview = () => {
    setIsPreviewOpen(false)
    setPreviewUrl(null)
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
              {formatStatus(application.status)}
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
                <div className="flex items-center space-x-2">
                  <p className="text-gray-800 font-medium">{application.filename}</p>
                  <div className="flex space-x-1">
                    <button
                      onClick={handlePreview}
                      disabled={isLoading}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                      title="Preview document (PDF, images only)"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleDownload}
                      disabled={isLoading}
                      className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                      title="Download document"
                    >
                      <DownloadIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {error && (
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Training Type</label>
                <p className="text-gray-800 font-medium">{application.training_type}</p>
              </div>
              {/* <div>
                <label className="text-sm font-medium text-gray-600">Date of Submission</label>
                <p className="text-gray-800">{formatDate(application.submitted_date)}</p>
              </div> */}

            </div>
          </div>

          {/* Evaluation Results */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">AI Evaluation Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {application.total_working_hours && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Total Working Hours</label>
                  <p className="text-gray-800 font-medium mt-1">{application.total_working_hours} hours</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-600">Credits Awarded</label>
                <p className={`font-semibold mt-1 ${application.credits > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                  {application.credits} ECTS
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Decision</label>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(application.ai_decision || 'PENDING')}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.ai_decision || 'PENDING')}`}>
                    {application.ai_decision || 'NOT EVALUATED'}
                  </span>
                </div>
              </div>

              {application.degree_relevance && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Degree Relevance</label>
                  <div className="mt-1">
                    <p className="text-gray-800">{application.degree_relevance}</p>
                  </div>
                </div>
              )}
            </div>

            {/* AI Decision Note */}
            <div className="mt-6 bg-yellow-50 border border-yellow-100 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircleIcon className="w-10 h-10 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">Note</p>
                  <p className="text-sm text-yellow-600 mt-1">
                    This evaluation is generated by our AI system and serves as an initial assessment. The final decision will be made by a human reviewer who will carefully evaluate your application and may adjust the credits or decision based on their expertise.
                  </p>
                </div>
              </div>
            </div>

            {(application.supporting_evidence || application.challenging_evidence) && (
              <div className="mt-6 space-y-4">
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
              </div>
            )}
          </div>

          {/* Status Information */}
          {/* <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Status</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Current Status</label>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(application.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                    {formatStatus(application.status)}
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
          </div> */}



          {/* Review Information */}
          {(application.reviewer_name || application.reviewer_decision) && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Review Information</h2>
              <div className="space-y-4">
                {application.reviewer_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Assigned Reviewer</label>
                    <p className="text-gray-800">{application.reviewer_name}</p>
                  </div>
                )}
                
                {application.reviewer_decision && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Reviewer Decision</label>
                    <div className="flex items-center space-x-2 mt-1">
                      {application.reviewer_decision === 'PASS' ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircleIcon className="w-5 h-5 text-red-500" />
                      )}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        application.reviewer_decision === 'PASS' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                      }`}>
                        {application.reviewer_decision === 'PASS' ? 'Approved' : 'Rejected'}
                      </span>
                    </div>
                  </div>
                )}
                
                {application.reviewed_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Reviewed At</label>
                    <p className="text-gray-800">{formatDate(application.reviewed_date)}</p>
                  </div>
                )}
                
                {application.reviewer_comment && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Reviewer Comment</label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-800 whitespace-pre-wrap">{application.reviewer_comment}</p>
                    </div>
                  </div>
                )}
                
                {application.reviewer_decision === 'FAIL' && application.recommendation && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Recommendation for Improvement</label>
                    <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800">{application.recommendation}</p>
                    </div>
                  </div>
                )}
                
                {application.final_credits_awarded && application.final_credits_awarded !== application.credits && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Final Credits Awarded</label>
                    <p className="text-green-600 font-semibold">{application.final_credits_awarded} ECTS</p>
                    <p className="text-xs text-gray-500 mt-1">
                      (Adjusted from AI suggested {application.credits} ECTS)
                    </p>
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
                <div>
                  <label className="text-sm font-medium text-gray-600">Appeal Status</label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(application.appeal_status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.appeal_status)}`}>
                      {formatStatus(application.appeal_status)}
                    </span>
                  </div>
                </div>
                
                {application.appeal_submitted_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Appeal Submitted</label>
                    <p className="text-gray-800">{formatDate(application.appeal_submitted_date)}</p>
                  </div>
                )}
                
                {application.appeal_reason && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Appeal Message</label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-800 whitespace-pre-wrap">{application.appeal_reason}</p>
                    </div>
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

          {/* Application Timeline */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Application Timeline</h2>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200"></div>
              
              {/* Timeline Steps */}
              <div className="relative flex justify-between">
                {/* Step 1: Application Submitted */}
                <div className="flex flex-col items-center relative">
                  <div className="w-8 h-8 rounded-full border-green-500 bg-green-100 flex items-center justify-center z-10">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-xs font-medium mt-2 text-center">Submitted</p>
                  <p className="text-xs text-gray-500 mt-1 whitespace-nowrap">{formatDate(application.submitted_date)}</p>
                </div>

                {/* Step 2: AI Decision */}
                <div className="flex flex-col items-center relative">
                  <div className={`w-8 h-8 rounded-full  flex items-center justify-center z-10 
                    ${application.decision_date ? 'border-green-500 bg-green-100' : 'border-yellow-500 bg-yellow-100 animate-pulse'}`}>
                    {application.decision_date ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <ClockIcon className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-xs font-medium mt-2 text-center">AI Decision</p>
                  {application.decision_date && (
                    <p className="text-xs text-gray-500 mt-1 whitespace-nowrap">{formatDate(application.decision_date)}</p>
                  )}
                </div>

                {/* Step 3: Human Review */}
                <div className="flex flex-col items-center relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                    application.reviewer_decision ? 'border-green-500 bg-green-100' : 
                    application.status === 'PENDING_FOR_APPROVAL' ? 'border-blue-500 bg-blue-100 animate-pulse' :
                    'border-gray-300 bg-gray-100'
                  }`}>
                    {application.reviewer_decision ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : application.status === 'PENDING_FOR_APPROVAL' ? (
                      <UserIcon className="w-5 h-5 text-blue-500" />
                    ) : (
                      <ClockIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <p className="text-xs font-medium mt-2 text-center">Human Review</p>
                  {application.reviewed_date && (
                    <p className="text-xs text-gray-500 mt-1 whitespace-nowrap">{formatDate(application.reviewed_date)}</p>
                  )}
                </div>

                {/* Step 4: Appeal (if applicable) */}
                {application.appeal_submitted_date && (
                  <div className="flex flex-col items-center relative">
                    <div className={`w-8 h-8 rounded-full  flex items-center justify-center z-10 
                      ${application.appeal_reviewed_date ? 'border-green-500 bg-green-100' : 'border-orange-500 bg-orange-100 animate-pulse'}`}>
                      {application.appeal_reviewed_date ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <ClockIcon className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                    <p className="text-xs font-medium mt-2 text-center">Appeal</p>
                    {application.appeal_reviewed_date && (
                      <p className="text-xs text-gray-500 mt-1 whitespace-nowrap">{formatDate(application.appeal_reviewed_date)}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Current Status Note */}
              <div className="mt-6 text-center">
                {!application.decision_date && (
                  <p className="text-sm text-yellow-600">
                    Your application is being processed by our AI system
                  </p>
                )}
                {application.decision_date && application.status === 'PENDING_FOR_APPROVAL' && !application.reviewer_decision && (
                  <p className="text-sm text-blue-600">
                    Waiting for reviewer's final decision
                  </p>
                )}
                {application.reviewer_decision === 'PASS' && (
                  <p className="text-sm text-green-600">
                    Application approved by reviewer - review completed successfully
                  </p>
                )}
                {application.reviewer_decision === 'FAIL' && !application.appeal_submitted_date && (
                  <p className="text-sm text-red-600">
                    Application was rejected by reviewer. You may submit an appeal if you disagree with the decision.
                  </p>
                )}
                {application.appeal_submitted_date && !application.appeal_reviewed_date && (
                  <p className="text-sm text-orange-600">
                    Appeal submitted and under review
                  </p>
                )}
                {application.appeal_reviewed_date && (
                  <p className="text-sm text-green-600">
                    Appeal review completed
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal 
        isOpen={isPreviewOpen}
        onClose={closePreview}
        previewUrl={previewUrl}
        filename={application?.filename}
      />
    </div>
  )
}

export default ApplicationDetails 