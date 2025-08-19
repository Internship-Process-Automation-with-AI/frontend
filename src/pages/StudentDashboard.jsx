import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Dashboard from '../components/student/Dashboard.jsx'
import UploadCertificate from '../components/student/UploadCertificate.jsx'
import ReviewSubmit from '../components/student/ReviewSubmit.jsx'
import Results from '../components/student/Results.jsx'
import Approval from '../components/student/Approval.jsx'
import RequestReview from '../components/student/RequestReview.jsx'
import ApplicationDetails from '../components/student/ApplicationDetails.jsx'
import Applications from '../components/student/Applications.jsx'
import ProcessingModal from '../components/student/ProcessingModal.jsx'
import LoadingOverlay from '../components/student/LoadingOverlay.jsx'
import { 
  getStudentApplications, 
  uploadCertificate, 
  processCertificate, 
  deleteApplication 
} from '../api_calls/studentAPI.js'

const StudentDashboard = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Get student data from location state or localStorage
  const studentEmail = location.state?.studentEmail || localStorage.getItem('studentEmail')
  const studentData = location.state?.studentData || JSON.parse(localStorage.getItem('studentData') || 'null')
  
  // Refs
  const fileInputRef = useRef(null)
  
  // State management
  const [currentView, setCurrentView] = useState('dashboard')
  const [formData, setFormData] = useState({ document: null, trainingType: '' })
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [apiIsProcessing, setApiIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [userFeedback, setUserFeedback] = useState('')
  const [applications, setApplications] = useState([])
  const [certificateId, setCertificateId] = useState(null)
  const [selectedApplication, setSelectedApplication] = useState(null)
  
  // Processing state
  const [isDocumentProcessing, setIsDocumentProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState(0)
  const [processingProgress, setProcessingProgress] = useState(0)

  // Check authentication on mount
  useEffect(() => {
    if (!studentEmail || !studentData) {
      navigate('/student', { replace: true })
      return
    }
    
    // Fetch applications on mount
    refreshApplications()
  }, [studentEmail, studentData, navigate])

  // File selection handler
  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, document: file }))
    }
  }

  // Input change handler
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Upload certificate handler
  const handleUploadCertificate = () => {
    if (!formData.document) {
      setError('Please select a document.')
      return
    }
    if (!formData.trainingType) {
      setError('Please select a training type.')
      return
    }
    setCurrentView('review')
  }

  // Process with AI handler
  const handleProcessWithAI = async () => {
    try {
      setError(null)
      setIsDocumentProcessing(true)
      setProcessingStage(0)
      setProcessingProgress(0)

      console.log('Starting two-step API process...')
      
      // Step 1: Upload the certificate
      console.log('Step 1: Uploading certificate...')
      setProcessingStage(0)
      setProcessingProgress(10)
      
      if (!studentData?.student_id) {
        throw new Error('Student ID not available')
      }

      const uploadResult = await uploadCertificate(
        studentData.student_id,
        formData.document,
        formData.trainingType
      )
      
      console.log('Upload result:', uploadResult)
      
      if (!uploadResult.certificate_id) {
        throw new Error('No certificate ID returned from upload')
      }

      const certificateId = uploadResult.certificate_id
      setCertificateId(certificateId)
      console.log('Certificate uploaded with ID:', certificateId)

      // Step 2: Process the certificate
      console.log('Step 2: Processing certificate...')
      setProcessingStage(1)
      setProcessingProgress(50)
      
      const processResult = await processCertificate(certificateId)
      console.log('Process result:', processResult)
      
      setProcessingProgress(100)
      
      // Set the results from the API response
      setResults(processResult)
      setCurrentView('results')
    } catch (err) {
      setError(err.message || 'Failed to process document. Please try again.')
      console.error('Processing error:', err)
    } finally {
      setIsDocumentProcessing(false)
    }
  }

  // Send for approval handler
  const handleSendForApproval = () => {
    setCurrentView('approval')
  }

  // Refresh applications
  const refreshApplications = async () => {
    try {
      const applications = await getStudentApplications(studentEmail)
      setApplications(applications)
    } catch (err) {
      console.warn('Failed to fetch applications:', err)
    }
  }

  // Request review handler
  const handleRequestReview = () => {
    setCurrentView('request-review')
  }

  // Submit appeal handler
  const handleSubmitAppeal = (application) => {
    // Set up results object with application data for RequestReview component
    setResults({
      decision: application.ai_decision || 'REJECTED',
      credits: application.credits_awarded || 0,
      filename: application.filename,
      student_degree: studentData?.degree,
      training_hours: application.total_working_hours,
      requested_training_type: application.training_type,
      degree_relevance: application.degree_relevance,
      supporting_evidence: application.supporting_evidence,
      challenging_evidence: application.challenging_evidence,
      justification: application.ai_justification
    })
    setCertificateId(application.certificate_id)
    setCurrentView('request-review')
  }

  // Submit new application handler
  const handleSubmitNewApplication = () => {
    // Clear form data and go back to upload
    setFormData({ document: null, trainingType: '' })
    setResults(null)
    setError(null)
    setCurrentView('upload')
  }

  // Delete application handler
  const handleDeleteApplication = async (applicationId) => {
    console.log('StudentDashboard: handleDeleteApplication called with ID:', applicationId)
    
    try {
      console.log('StudentDashboard: Calling deleteApplication API...')
      const result = await deleteApplication(applicationId)
      console.log('StudentDashboard: deleteApplication API result:', result)
      
      // Check if deletion was successful
      if (result === true) {
        console.log('StudentDashboard: Delete successful, refreshing applications...')
        // Refresh the applications list
        await refreshApplications()
        console.log('StudentDashboard: Applications refreshed')
      } else {
        console.log('StudentDashboard: Delete result was not true:', result)
        throw new Error('Delete operation did not complete successfully')
      }
    } catch (err) {
      console.error('StudentDashboard: Delete error:', err)
      // Re-throw the error so the calling component can handle it
      throw err
    }
  }

  // View applications handler
  const handleViewApplications = () => {
    setCurrentView('applications')
  }

  // Back to dashboard handler
  const handleBackToDashboard = async (targetView = 'dashboard') => {
    setCurrentView(targetView)
    if (targetView === 'dashboard') {
      await refreshApplications()
    }
  }

  // View application details handler
  const handleViewApplicationDetails = async (application) => {
    // Use the application data we already have for immediate display
    setSelectedApplication(application)
    setCurrentView('application-details')
    
    // Refresh applications in the background to get latest data
    // but don't wait for it - this ensures data is up-to-date
    refreshApplications().catch(err => console.warn('Background refresh failed:', err))
  }

  // Request review from application details handler
  const handleRequestReviewFromDetails = (application) => {
    // Set the results data and navigate to request review page
    setResults({
      decision: {
        ai_decision: application.ai_decision || 'REJECTED'
      },
      credits: application.credits || 0,
      filename: application.filename,
      student_degree: studentData?.degree,
      training_hours: application.total_working_hours,
      requested_training_type: application.training_type,
      degree_relevance: application.degree_relevance,
      supporting_evidence: application.supporting_evidence,
      challenging_evidence: application.challenging_evidence,
      justification: application.justification
    })
    setCertificateId(application.certificate_id)
    setCurrentView('request-review')
  }

  // Send for approval from application details handler
  const handleSendForApprovalFromDetails = (application) => {
    console.log('handleSendForApprovalFromDetails called with application:', application)
    console.log('application.ai_decision:', application.ai_decision)
    console.log('application.decision:', application.decision)
    console.log('application.status:', application.status)
    
    // Set the results data and navigate to approval page
    setResults({
      decision: {
        ai_decision: application.ai_decision || 'ACCEPTED'
      },
      credits: application.credits || 0,
      filename: application.filename,
      student_degree: studentData?.degree,
      training_hours: application.total_working_hours,
      requested_training_type: application.training_type,
      degree_relevance: application.degree_relevance,
      supporting_evidence: application.supporting_evidence,
      challenging_evidence: application.challenging_evidence,
      justification: application.justification
    })
    setCertificateId(application.certificate_id)
    setCurrentView('approval')
  }

  // Back to applications handler
  const handleBackToApplications = () => {
    setCurrentView('applications')
  }

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('studentEmail')
    localStorage.removeItem('studentData')
    navigate('/student', { replace: true })
  }

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            studentData={studentData}
            onLogout={handleLogout}
            onApplyForCredits={() => setCurrentView('upload')}
            onViewApplications={handleViewApplications}
          />
        )
      
      case 'upload':
        return (
          <UploadCertificate
            formData={formData}
            fileInputRef={fileInputRef}
            onFileSelect={handleFileSelect}
            onInputChange={handleInputChange}
            onBackToDashboard={handleBackToDashboard}
            onContinueProcessing={handleUploadCertificate}
            error={error}
          />
        )
      
      case 'review':
        return (
          <ReviewSubmit
            formData={formData}
            onProcessDocument={handleProcessWithAI}
            onBackToUpload={() => setCurrentView('upload')}
          />
        )
      
      case 'results':
        return (
          <Results
            results={results}
            formData={formData}
            studentData={studentData}
            onBackToDashboard={handleBackToDashboard}
            onSendForApproval={handleSendForApproval}
            onRequestReview={handleRequestReview}
            onSubmitNewApplication={handleSubmitNewApplication}
          />
        )
      
      case 'approval':
        return (
          <Approval
            results={results}
            onBackToDashboard={handleBackToDashboard}
            certificateId={certificateId}
            onRefreshApplications={refreshApplications}
          />
        )
      
      case 'request-review':
        return (
          <RequestReview
            results={results}
            onBackToDashboard={handleBackToDashboard}
            certificateId={certificateId}
            onRefreshApplications={refreshApplications}
          />
        )
      
      case 'applications':
        return (
          <Applications
            applications={applications}
            onBackToDashboard={handleBackToDashboard}
            onDeleteApplication={handleDeleteApplication}
            onViewApplicationDetails={handleViewApplicationDetails}
            onContinueProcessing={(application) => {
              setResults({
                decision: {
                  ai_decision: application.ai_decision || 'ACCEPTED'
                },
                credits: application.credits || 0,
                filename: application.filename,
                student_degree: studentData?.degree,
                training_hours: application.total_working_hours,
                requested_training_type: application.training_type,
                degree_relevance: application.degree_relevance,
                supporting_evidence: application.supporting_evidence,
                challenging_evidence: application.challenging_evidence,
                justification: application.justification
              })
              setCertificateId(application.certificate_id)
              setCurrentView('approval')
            }}
            onSubmitAppeal={handleSubmitAppeal}
          />
        )
      
      case 'application-details':
        return (
          <ApplicationDetails
            application={selectedApplication}
            onBackToApplications={handleBackToApplications}
            onRequestReview={handleRequestReviewFromDetails}
            onSendForApproval={handleSendForApprovalFromDetails}
          />
        )
      
      default:
        return (
          <Dashboard
            studentData={studentData}
            onLogout={handleLogout}
            onApplyForCredits={() => setCurrentView('upload')}
            onViewApplications={handleViewApplications}
          />
        )
    }
  }

  return (
    <div className="App">
      {renderCurrentView()}
      {/* Processing Modal */}
      <ProcessingModal
        isOpen={isDocumentProcessing}
        processingStage={processingStage}
        processingProgress={processingProgress}
        onCancel={() => {
          setIsDocumentProcessing(false)
          setCurrentView('review')
        }}
      />
      {/* Loading Overlay for API calls */}
      <LoadingOverlay isVisible={apiIsProcessing} progress={progress} />
    </div>
  )
}

export default StudentDashboard 