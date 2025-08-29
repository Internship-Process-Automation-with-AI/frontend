import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../components/common/Header.jsx'
import MessageModal from '../components/common/MessageModal.jsx'
import { getCertificateDetails, submitCertificateReview, downloadCertificate, getReviewerByEmail } from '../api_calls/reviewerApi.js'
import { buildUrl, API_ENDPOINTS } from '../api_calls/config.js'
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

  // Justification modal state
  const [showJustificationModal, setShowJustificationModal] = useState(false)
  const [justificationText, setJustificationText] = useState('')

  // Document viewer modal state
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [documentUrl, setDocumentUrl] = useState('')
  const [documentLoading, setDocumentLoading] = useState(false)

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
    if (!reviewDecision) {
      setModalConfig({
        type: 'error',
        title: 'Missing Information',
        message: 'Please provide a decision'
      })
      setShowModal(true)
      return
    }

    setSubmitting(true)
      setError('')
      try {
      await submitCertificateReview(certificateId, {
        reviewer_decision: reviewDecision,
        reviewer_comment: reviewComment.trim() || null
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

  const handleViewJustification = () => {
    const justification = application.decision.company_validation_justification || 'No justification available.'
    
    // Try to parse JSON and convert to markdown format
    try {
      if (justification !== 'No justification available.') {
        console.log('Raw justification:', justification)
        const jsonData = JSON.parse(justification)
        console.log('Parsed JSON:', jsonData)
        const markdownText = convertJsonToMarkdown(jsonData)
        console.log('Generated markdown:', markdownText)
        setJustificationText(markdownText)
      } else {
        setJustificationText(justification)
      }
    } catch (error) {
      console.error('JSON parsing error:', error)
      // If not valid JSON, display as plain text
      setJustificationText(justification)
    }
    setShowJustificationModal(true)
  }

  const handleViewDocument = async () => {
    setDocumentLoading(true)
    setShowDocumentModal(true)
    
    try {
      // Get the document URL for preview
      const url = buildUrl(API_ENDPOINTS.CERTIFICATE_PREVIEW(certificateId))
      setDocumentUrl(url)
    } catch (error) {
      console.error('Error loading document:', error)
      setError('Failed to load document preview')
    } finally {
      setDocumentLoading(false)
    }
  }

  const convertJsonToMarkdown = (jsonData) => {
    let markdown = ''
    
    // Handle arrays at the top level
    if (Array.isArray(jsonData)) {
      jsonData.forEach((item, index) => {
        markdown += `## COMPANY\n\n`
        markdown += processObject(item, 0)
        if (index < jsonData.length - 1) {
          markdown += '\n---\n\n'
        }
      })
    } else {
      markdown = processObject(jsonData, 0)
    }
    
    return markdown
    
    function processObject(obj, level = 0) {
      let result = ''
      const keys = Object.keys(obj)
      
      keys.forEach((key, index) => {
        const value = obj[key]
        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        
        if (value === null || value === undefined) {
          result += `- ${formattedKey}: N/A\n`
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          result += `- ${formattedKey}:\n`
          result += processObject(value, level + 1)
        } else if (Array.isArray(value)) {
          result += `- ${formattedKey}:\n`
          value.forEach((item, index) => {
            if (typeof item === 'object') {
              result += `  ${index + 1}. \n`
              result += processObject(item, level + 2)
            } else {
              result += `  ${index + 1}. ${item}\n`
            }
          })
        } else {
          // Handle long text values with better formatting
          if (typeof value === 'string' && value.length > 100) {
            result += `- ${formattedKey}:\n  ${value}\n`
          } else {
            result += `- ${formattedKey}: ${value}\n`
          }
        }
        
        // Add extra spacing between fields for better readability
        if (index < keys.length - 1) {
          result += '\n'
        }
      })
      
      return result
    }
  }

  const renderFormattedContent = (text) => {
    if (!text) return null
    
    // Split the text into lines
    const lines = text.split('\n')
    
    // Group lines by company sections
    const companies = []
    let currentCompany = []
    let currentCompanyName = ''
    
         lines.forEach((line, index) => {
       if (line.startsWith('## COMPANY')) {
         if (currentCompany.length > 0) {
           companies.push({
             name: currentCompanyName,
             lines: currentCompany
           })
         }
         currentCompanyName = line.replace('## COMPANY', '')
         currentCompany = []
       } else {
         currentCompany.push({ line, index })
       }
     })
    
    // Add the last company
    if (currentCompany.length > 0) {
      companies.push({
        name: currentCompanyName,
        lines: currentCompany
      })
    }
    
    // Render each company in its own box
    return companies.map((company, companyIndex) => (
      <div key={companyIndex} className="mb-8">
        {company.name && (
          <h2 key={`header-${companyIndex}`} className="text-2xl font-bold text-gray-900 mb-4 mt-6 first:mt-0 border-b-2 border-blue-200 pb-2">
            {company.name}
          </h2>
        )}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          {company.lines.map(({ line, index }) => {
                         // Handle bullet points with labels
             if (line.startsWith('- ') && line.includes(':')) {
               const colonIndex = line.indexOf(':')
               const labelText = line.substring(2, colonIndex) // Remove '- ' and get text before first colon
               const valueText = line.substring(colonIndex + 1).trim() // Get everything after first colon
               
               if (valueText.length > 100) {
                 return (
                   <div key={index} className="mb-4">
                     <div className="font-semibold text-gray-800 mb-2 text-lg">{labelText}</div>
                     <div className="text-gray-700 leading-relaxed pl-4">{valueText}</div>
                   </div>
                 )
               } else {
                 return (
                   <div key={index} className="mb-3 flex items-start">
                     <span className="text-blue-500 mr-2 mt-1">•</span>
                     <div>
                       <span className="font-semibold text-gray-800">{labelText}: </span>
                       <span className="text-gray-700">{valueText}</span>
                     </div>
                   </div>
                 )
               }
             }
            
            // Handle numbered lists
            if (line.match(/^\s*\d+\.\s/)) {
              const content = line.replace(/^\s*\d+\.\s/, '')
              return (
                <div key={index} className="ml-6 mb-2 flex items-start">
                  <span className="text-blue-500 mr-2 mt-1 text-sm">◦</span>
                  <span className="text-gray-700">{content}</span>
                </div>
              )
            }
            
            // Handle horizontal rules
            if (line.trim() === '---') {
              return <hr key={index} className="my-6 border-gray-300" />
            }
            
            // Handle empty lines
            if (line.trim() === '') {
              return <div key={index} className="h-2"></div>
            }
            
            // Handle regular text
            return (
              <div key={index} className="text-gray-700 leading-relaxed">
                {line}
              </div>
            )
          })}
        </div>
      </div>
    ))
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
  if (fetchingReviewer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header reviewerData={reviewer} onLogout={handleLogout} />
        <div className="text-center py-12 text-gray-500">Loading reviewer data...</div>
      </div>
    )
  }

  if (fetchingDetails || !application) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header reviewerData={reviewer} onLogout={handleLogout} />
        <div className="text-center py-12 text-gray-500">Loading application details...</div>
      </div>
    )
  }

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
        
                 {/* Justification Modal */}
         {showJustificationModal && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div className="bg-white rounded-xl shadow-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
               <div className="flex items-center justify-between mb-6">
                 <div>
                   <h3 className="text-2xl font-bold text-gray-900">Training Institution Validation</h3>
                   <p className="text-gray-600 mt-1">Detailed analysis and justification</p>
                 </div>
                 <button
                   onClick={() => setShowJustificationModal(false)}
                   className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                 >
                   <XCircleIcon className="w-6 h-6" />
                 </button>
               </div>
               
               <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 max-h-[60vh] overflow-y-auto">
                 <div className="prose prose-lg max-w-none">
                   {renderFormattedContent(justificationText)}
                 </div>
               </div>
               
               <div className="mt-6 flex justify-end">
                 <button
                   onClick={() => setShowJustificationModal(false)}
                   className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                 >
                   Close
                 </button>
               </div>
             </div>
           </div>
                   )}

          {/* Document Viewer Modal */}
          {showDocumentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Document Viewer</h3>
                    <p className="text-gray-600 mt-1">{application?.certificate?.filename || 'Certificate Document'}</p>
                  </div>
                  <button
                    onClick={() => setShowDocumentModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="bg-gray-100 rounded-lg border border-gray-200 flex-1 overflow-hidden">
                  {documentLoading ? (
                    <div className="flex items-center justify-center h-96">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading document...</p>
                      </div>
                    </div>
                  ) : documentUrl ? (
                    <iframe
                      src={documentUrl}
                      className="w-full h-[70vh] border-0"
                      title="Document Preview"
                      onLoad={() => setDocumentLoading(false)}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-96">
                      <div className="text-center">
                        <AlertCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-gray-600">Failed to load document</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDocumentModal(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleDownload}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          )}
         <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Applications Section */}
        <div className="card p-6">
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
                  onClick={handleViewDocument}
                  className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>View</span>
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

              {/* Credits Awarded */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Credits Awarded</label>
                  <p className={`font-semibold mt-1 text-lg ${
                    application.decision.credits_awarded > 0 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {application.decision.credits_awarded} ECTS
                  </p>
                </div>

                {/* Total Working Hours */}
                <div>
                  <label className="text-sm font-medium text-gray-600">Total Working Hours</label>
                  <p className="text-gray-800 font-medium mt-1">
                    {application.decision.total_working_hours 
                      ? `${application.decision.total_working_hours} hours`
                      : 'Not available'
                    }
                  </p>
                </div>

                {/* Training Duration */}
                {application.decision.training_duration && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Training Duration</label>
                    <p className="text-gray-800 font-medium mt-1">{application.decision.training_duration}</p>
                  </div>
                )}

                {/* Training Institution */}
                {application.decision.training_institution && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Training Institution</label>
                    <p className="text-gray-800 font-medium mt-1">{application.decision.training_institution}</p>
                  </div>
                )}

                {/* Training Institution Validation */}
                <div>
                  <label className="text-sm font-medium text-gray-600">Training Institution Validation</label>
                  <div className="flex items-center space-x-3 mt-1">
                    <p className="text-gray-800 font-medium">
                      {application.decision.company_validation_status || 'Not available'}
                    </p>
                    {application.decision.company_validation_justification && (
                      <button
                        onClick={handleViewJustification}
                        className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                      >
                        View Justification
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Degree Relevance */}
              {application.decision.degree_relevance && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Degree Relevance</label>
                    <p className="text-gray-800 font-medium mt-1">{application.decision.degree_relevance}</p>
                </div>
              )}

              {/* Credit Calculation */}
              {/* {application.decision.total_working_hours && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Credit Calculation</label>
                  <div className="bg-gray-50 p-3 rounded-lg mt-1 space-y-1">
                    <p className="text-gray-800">
                      Total Working Hours: {application.decision.total_working_hours} hours
                    </p>
                    <p className="text-gray-800">
                      Calculated Credits: {Math.floor(application.decision.total_working_hours / 27)} ECTS
                      <span className="text-gray-500 text-sm ml-2">(1 ECTS = 27 hours)</span>
                    </p>
                    <p className="text-gray-700 text-sm">
                      AI Awarded: {application.decision.credits_awarded || 0} ECTS
                    </p>
                  </div>
                </div>
              )} */}

              {/* AI Justification */}
              {application.decision.ai_justification && (
                <div>
                  <label className="text-sm font-medium text-gray-600">AI Justification</label>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-lg mt-1">
                    {application.decision.ai_justification}
                  </p>
                </div>
              )}

              {/* Supporting and Challenging Evidence - Always show */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Supporting Evidence</label>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-1">
                    <p className="text-green-800">
                      {application.decision.supporting_evidence || 'No supporting evidence available.'}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Challenging Evidence</label>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-1">
                    <p className="text-red-800">
                      {application.decision.challenging_evidence || 'No challenging evidence available.'}
                    </p>
                  </div>
                </div>
              </div>

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
            </div>
          </div>

          {/* Student Comment Section */}
          {application.decision.student_comment && (
            <div className="card p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Student Comment</h2>
              <div className="space-y-4">
                    <div>
                  <label className="text-sm font-medium text-gray-600">Comment</label>
                  <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 whitespace-pre-wrap">{application.decision.student_comment}</p>
                      </div>
                    </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircleIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-yellow-800 font-medium">Student Request</p>
                      <p className="text-yellow-700 text-sm">
                        The student has submitted a comment regarding their application and requested a review. Please consider their feedback when making your decision.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                    Comment
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
                  disabled={submitting || !reviewDecision}
                  className="w-full bg-gradient-to-r from-oamk-orange-500 to-oamk-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-oamk-orange-600 hover:to-oamk-orange-700 focus:outline-none focus:ring-2 focus:ring-oamk-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting Review...' : 'Submit Review'}
                </button>
              </div>
            )}
          </div>
          </div>
      </div>
    </div>
  )
}

export default ReviewerApplications 