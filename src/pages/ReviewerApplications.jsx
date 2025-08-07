import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../components/common/Header.jsx'
import MessageModal from '../components/common/MessageModal.jsx'
import { getCertificateDetails, submitCertificateReview, downloadCertificate, getReviewerByEmail } from '../api_calls/reviewerApi.js'
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon, DownloadIcon, UserIcon, ClockIcon, AlertCircleIcon } from '../components/common/Icons.jsx'

function ReviewerApplications() {
  const location = useLocation()
  const navigate = useNavigate()
  const { certificateId } = useParams()
  const reviewerId = location.state?.reviewerId || localStorage.getItem('reviewerId')
  const reviewerEmail = location.state?.reviewerEmail || localStorage.getItem('reviewerEmail')
  
  // Reviewer data state
  const [reviewer, setReviewer] = useState(null)
  const [fetchingReviewer, setFetchingReviewer] = useState(true)
  
  // Application detail state
  const [application, setApplication] = useState(null)
  const [error, setError] = useState('')
  const [fetchingDetails, setFetchingDetails] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Review form state
  const [reviewDecision, setReviewDecision] = useState('')
  const [reviewComment, setReviewComment] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [modalConfig, setModalConfig] = useState({
    type: 'success',
    title: '',
    message: ''
  })

  // Fetch reviewer data
  useEffect(() => {
    const fetchReviewerData = async () => {
      if (!reviewerEmail) {
        navigate('/reviewer')
        return
      }
      
      try {
        setFetchingReviewer(true)
        const reviewerData = await getReviewerByEmail(reviewerEmail)
        setReviewer(reviewerData)
      } catch (err) {
        console.error('Failed to fetch reviewer data:', err)
        navigate('/reviewer')
      } finally {
        setFetchingReviewer(false)
      }
    }

    fetchReviewerData()
  }, [reviewerEmail, navigate])

  const fetchApplicationDetails = useCallback(async () => {
    setFetchingDetails(true)
    setError('')
    try {
      const details = await getCertificateDetails(certificateId)
      setApplication(details)
      
      // Pre-populate if already reviewed
      if (details.decision.reviewer_decision) {
        setReviewDecision(details.decision.reviewer_decision)
        setReviewComment(details.decision.reviewer_comment || '')
      }
    } catch (err) {
      setError(err.message || 'Failed to load application details')
      if (err.message.includes('not found')) {
        navigate('/reviewer/portal')
      }
    } finally {
      setFetchingDetails(false)
    }
  }, [certificateId, navigate])

  useEffect(() => {
    if (!reviewerId) {
      navigate('/reviewer')
      return
    }
    if (certificateId) {
      fetchApplicationDetails()
    } else {
      navigate('/reviewer/portal')
    }
  }, [certificateId, reviewerId, navigate, fetchApplicationDetails])

  const handleSubmitReview = async () => {
    if (!reviewDecision || !reviewComment.trim()) {
      setModalConfig({
        type: 'error',
        title: 'Missing Information',
        message: 'Please provide both a decision and comment'
      })
      setShowModal(true)
      return
    }

    setSubmitting(true)
      setError('')
      try {
      await submitCertificateReview(certificateId, {
        reviewer_decision: reviewDecision,
        reviewer_comment: reviewComment.trim()
      })
      
      // Refresh application details
      await fetchApplicationDetails()
      setModalConfig({
        type: 'success',
        title: 'Review Submitted',
        message: 'Your review has been submitted successfully!'
      })
      setShowModal(true)
      } catch (err) {
      setError(err.message || 'Failed to submit review')
      setModalConfig({
        type: 'error',
        title: 'Submission Failed',
        message: err.message || 'Failed to submit review. Please try again.'
      })
      setShowModal(true)
      } finally {
      setSubmitting(false)
    }
  }

  const handleDownload = async () => {
    try {
      const blob = await downloadCertificate(certificateId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = application.certificate.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError('Failed to download certificate')
      setModalConfig({
        type: 'error',
        title: 'Download Failed',
        message: 'Failed to download the certificate. Please try again.'
      })
      setShowModal(true)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('reviewerId')
    navigate('/reviewer', { replace: true })
  }

  const handleBackToPortal = () => {
    navigate('/reviewer/portal', { state: { reviewerId } })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PASS':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'FAIL':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      case 'ACCEPTED':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'REJECTED':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      case 'PENDING':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />
      default:
        return <AlertCircleIcon className="w-5 h-5 text-gray-500" />
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

  // Loading states
  if (fetchingDetails || fetchingReviewer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header reviewerData={reviewer} onLogout={handleLogout} />
        <div className="text-center py-12 text-gray-500">Loading application details...</div>
      </div>
    )
  }

  // Error state
  if (error && !application) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header reviewerData={reviewer} onLogout={handleLogout} />
        <div className="text-center py-12 text-red-600">{error}</div>
      </div>
    )
  }

  // Individual application review view
  if (application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header reviewerData={reviewer} onLogout={handleLogout} />
        <MessageModal 
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          type={modalConfig.type}
          title={modalConfig.title}
          message={modalConfig.message}
        />
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Navigation */}
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={handleBackToPortal}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Portal</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="text-red-700">{error}</div>
            </div>
          )}

          {/* Student Information */}
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Student Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-gray-800 font-medium">
                  {application.student.first_name} {application.student.last_name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-800">{application.student.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Degree Program</label>
                <p className="text-gray-800">{application.student.degree}</p>
              </div>
            </div>
          </div>

          {/* Certificate Information */}
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Certificate Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Filename</label>
                <p className="text-gray-800">{application.certificate.filename}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Training Type</label>
                <p className="text-gray-800">{application.certificate.training_type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Upload Date</label>
                <p className="text-gray-800">{formatDate(application.certificate.uploaded_at)}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                <DownloadIcon className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* AI Decision */}
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">AI Analysis</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-600">AI Decision:</label>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(application.decision.ai_decision)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    application.decision.ai_decision === 'ACCEPTED' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {application.decision.ai_decision}
                  </span>
                </div>
              </div>

              {/* Credit Calculation */}
              {application.certificate.total_working_hours && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Credit Calculation</label>
                  <div className="bg-gray-50 p-3 rounded-lg mt-1 space-y-1">
                    <p className="text-gray-800">
                      Total Working Hours: {application.certificate.total_working_hours} hours
                    </p>
                    <p className="text-gray-800">
                      Calculated Credits: {Math.floor(application.certificate.total_working_hours / 27)} ECTS
                      <span className="text-gray-500 text-sm ml-2">(1 ECTS = 27 hours)</span>
                    </p>
                  </div>
                </div>
              )}

              {/* AI Justification */}
              {application.decision.ai_justification && (
                <div>
                  <label className="text-sm font-medium text-gray-600">AI Justification</label>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-lg mt-1">
                    {application.decision.ai_justification}
                  </p>
                </div>
              )}

              {/* Recommendation for Rejected Cases */}
              {application.decision.ai_decision === 'REJECTED' && application.decision.recommendation && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Recommendation</label>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-1">
                    <div className="flex items-start space-x-2">
                      <AlertCircleIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                        <p className="text-orange-800 font-medium mb-1">Suggested Actions:</p>
                        <p className="text-orange-700">{application.decision.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Supporting and Challenging Evidence */}
              {(application.decision.supporting_evidence || application.decision.challenging_evidence) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.decision.supporting_evidence && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Supporting Evidence</label>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-1">
                        <p className="text-green-800">{application.decision.supporting_evidence}</p>
                      </div>
                    </div>
                  )}
                  {application.decision.challenging_evidence && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Challenging Evidence</label>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-1">
                        <p className="text-red-800">{application.decision.challenging_evidence}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Review Form */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Your Review</h2>
            
            {application.decision.reviewer_decision ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(application.decision.reviewer_decision)}
                    <span className="font-medium">
                      Review Completed: {application.decision.reviewer_decision}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Reviewed on: {formatDate(application.decision.reviewed_at)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Your Comment</label>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-lg mt-1">
                    {application.decision.reviewer_comment}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Decision *
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="PASS"
                        checked={reviewDecision === 'PASS'}
                        onChange={(e) => setReviewDecision(e.target.value)}
                        className="mr-2"
                      />
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />
                      Pass
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="FAIL"
                        checked={reviewDecision === 'FAIL'}
                        onChange={(e) => setReviewDecision(e.target.value)}
                        className="mr-2"
                      />
                      <XCircleIcon className="w-4 h-4 text-red-500 mr-1" />
                      Fail
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment *
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oamk-orange-500 focus:border-transparent"
                    placeholder="Provide detailed feedback about your decision..."
                  />
                </div>

                <button
                  onClick={handleSubmitReview}
                  disabled={submitting || !reviewDecision || !reviewComment.trim()}
                  className="w-full bg-gradient-to-r from-oamk-orange-500 to-oamk-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-oamk-orange-600 hover:to-oamk-orange-700 focus:outline-none focus:ring-2 focus:ring-oamk-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting Review...' : 'Submit Review'}
                </button>
              </div>
            )}
          </div>
      </div>
    </div>
  )
  }

  return null
}

export default ReviewerApplications 