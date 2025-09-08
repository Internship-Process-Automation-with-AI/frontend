import React, { useState } from 'react'
import { previewCertificate, downloadAndSaveCertificate, previewAdditionalDocument } from '../../api_calls/studentAPI.js'
import PreviewModal from '../common/PreviewModal.jsx'
import { 
  ClockIcon, 
  CheckCircleIcon, 
  AlertCircleIcon, 
  UserIcon,
  EyeIcon,
  DownloadIcon,
  ArrowLeftIcon
} from '../common/Icons.jsx'

const ApplicationDetails = ({ application, onBackToApplications, onRequestReview, onSendForApproval }) => {
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Additional document preview state
  const [additionalPreviewUrl, setAdditionalPreviewUrl] = useState(null)
  const [isAdditionalPreviewOpen, setIsAdditionalPreviewOpen] = useState(false)
  const [additionalPreviewLoading, setAdditionalPreviewLoading] = useState(false)
  const [currentAdditionalDocument, setCurrentAdditionalDocument] = useState(null)

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon className="w-8 h-8 text-yellow-500" />
      case 'ACCEPTED':
        return <CheckCircleIcon className="w-8 h-8 text-green-500" />
      case 'REJECTED':
        return <AlertCircleIcon className="w-8 h-8 text-red-500" />
      case 'PENDING_FOR_APPROVAL':
        return <UserIcon className="w-8 h-8 text-blue-500" />
      default:
        return <ClockIcon className="w-8 h-8 text-gray-500" />
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
      
      const url = await previewCertificate(application.certificate_id)
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
      await downloadAndSaveCertificate(application.certificate_id, application.filename)
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

  const handleAdditionalDocumentPreview = async (document) => {
    setAdditionalPreviewLoading(true)
    setError(null)
    setCurrentAdditionalDocument(document)
    
    try {
      console.log('Preview request for additional document:', document.document_id)
      
      // Check if the file type can be previewed
      const fileExtension = document.filename.split('.').pop()?.toLowerCase()
      const previewableTypes = ['pdf', 'jpg', 'jpeg', 'png']
      const downloadOnlyTypes = ['docx', 'doc', 'txt', 'rtf']
      
      if (downloadOnlyTypes.includes(fileExtension)) {
        setError('This file type cannot be previewed in the browser. Please download the file to view the document.')
        return
      }
      
      if (!previewableTypes.includes(fileExtension)) {
        setError('This file type cannot be previewed in the browser. Please download the file to view it.')
        return
      }
      
      const url = await previewAdditionalDocument(application.certificate_id, document.document_id)
      setAdditionalPreviewUrl(url)
      setIsAdditionalPreviewOpen(true)
    } catch (err) {
      setError('Failed to load preview. Please try again.')
      console.error('Additional document preview error:', err)
    } finally {
      setAdditionalPreviewLoading(false)
    }
  }

  const closeAdditionalPreview = () => {
    setIsAdditionalPreviewOpen(false)
    setAdditionalPreviewUrl(null)
    setCurrentAdditionalDocument(null)
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
            </div>
          </div>

          {/* Additional Documents Section - Only show for self-paced work */}
          {application.additional_documents && application.additional_documents.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Additional Documents</h2>
              <p className="text-gray-600 mb-4">
                This application includes {application.additional_documents.length} additional document(s) for self-paced work documentation.
              </p>
              <div className="space-y-3">
                {application.additional_documents.map((doc, index) => (
                  <div key={doc.document_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doc.filename}</p>
                        <p className="text-sm text-gray-500">
                          {doc.document_type} • {doc.filetype.toUpperCase()} • 
                          Uploaded {formatDate(doc.uploaded_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleAdditionalDocumentPreview(doc)}
                        disabled={additionalPreviewLoading}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                        title="Preview document (PDF, images only)"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evaluation Results */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">AI Evaluation Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Total Working Hours</label>
                <p className="text-gray-800 font-medium mt-1">
                  {application.total_working_hours
                    ? `${application.total_working_hours} hours`
                    : 'Not available'
                  }
                </p>
                </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Credits Calculated</label>
                <p className={`font-semibold mt-1 ${(application.credits_awarded || 0) > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                  {application.credits_awarded || 0} ECTS
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

            {/* Evidence Section */}
              <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Supporting Evidence</label>
                    <div className="mt-2 p-4 bg-green-50 rounded-lg">
                  <p className="text-gray-800">
                    {application.supporting_evidence || 'No supporting evidence available.'}
                  </p>
                  </div>
          </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Challenging Evidence</label>
                <div className="mt-2 p-4 bg-red-50 rounded-lg">
                  <p className="text-gray-800">
                    {application.challenging_evidence || 'No challenging evidence available.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

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
                
                {application.reviewer_decision === 'FAIL' && (
                  <div>
                    <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-red-800 font-medium">Final Decision</p>
                          <p className="text-red-700 text-sm">
                            This application has been reviewed by a human reviewer and the final decision is rejection. 
                            The review process is now complete and no further appeals are possible.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {application.final_credits_awarded && application.final_credits_awarded !== application.credits && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Final Credits Calculated</label>
                    <p className="text-green-600 font-semibold">{application.final_credits_awarded} ECTS</p>
                    <p className="text-xs text-gray-500 mt-1">
                      (Adjusted from AI suggested {application.credits} ECTS)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Student Comment */}
          {application.student_comment && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Student Comment</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Comment</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">{application.student_comment}</p>
                  </div>
                </div>
                {!application.reviewer_decision && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <ClockIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                        <p className="text-blue-800 font-medium">Under Review</p>
                        <p className="text-blue-700 text-sm">
                          Your comment has been submitted and your application is currently under human review.
                        </p>
                  </div>
                    </div>
                  </div>
                )}
                {application.reviewer_decision && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <CheckCircleIcon className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                        <p className="text-gray-800 font-medium">Review Completed</p>
                        <p className="text-gray-700 text-sm">
                          Your comment was considered during the review process. The reviewer has made their final decision.
                        </p>
                  </div>
                    </div>
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

                {/* Step 4: Human Review - removed appeal step */}
                {/* Appeal is now just part of the normal review process */}
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
                {application.reviewer_decision === 'FAIL' && (
                  <p className="text-sm text-red-600">
                    Application was rejected by reviewer - final decision completed
                  </p>
                )}
                {application.ai_decision === 'REJECTED' && !application.reviewer_decision && !application.student_comment && (
                  <div>
                    <p className="text-sm text-red-600 mb-3">
                      Application was rejected by AI. You may submit a comment and request human review if you disagree with the decision.
                    </p>
                    <button
                      onClick={() => onRequestReview && onRequestReview(application)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                    >
                      Request Review
                    </button>
                  </div>
                )}
                {application.student_comment && !application.reviewer_decision && (
                  <p className="text-sm text-blue-600">
                    Student comment submitted - application is under human review
                  </p>
                )}
                {application.ai_decision === 'ACCEPTED' && application.status !== 'PENDING_FOR_APPROVAL' && !application.reviewer_decision && (
                  <div>
                    <p className="text-sm text-green-600 mb-3">
                      The credit application is accepted but you need to send it for approval to gain credits.
                    </p>
                    <button
                      onClick={() => onSendForApproval && onSendForApproval(application)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Send for Approval
                    </button>
                  </div>
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

      {/* Additional Document Preview Modal */}
      <PreviewModal 
        isOpen={isAdditionalPreviewOpen}
        onClose={closeAdditionalPreview}
        previewUrl={additionalPreviewUrl}
        filename={currentAdditionalDocument?.filename}
      />
    </div>
  )
}

export default ApplicationDetails; 
