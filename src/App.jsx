import React, { useState, useRef } from 'react'
import EmailEntry from './components/EmailEntry'
import Dashboard from './components/Dashboard'
import UploadCertificate from './components/UploadCertificate'
import ReviewSubmit from './components/ReviewSubmit'
import Results from './components/Results'
import Approval from './components/Approval'
import RequestReview from './components/RequestReview'
import ApplicationDetails from './components/ApplicationDetails'
import Applications from './components/Applications'
import ProcessingModal from './components/ProcessingModal'
import LoadingOverlay from './components/LoadingOverlay'

function App() {
  // State management
  const [currentView, setCurrentView] = useState('email-entry')
  const [studentEmail, setStudentEmail] = useState('')
  const [studentData, setStudentData] = useState(null)
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
  
  // Refs
  const fileInputRef = useRef(null)
  
  // Email submission handler
  const handleEmailSubmit = async () => {
    if (!studentEmail.trim()) {
      setError('Please enter your email address.')
      return
    }

    try {
      setError(null)
      setIsProcessing(true)
      
      const response = await fetch(`http://localhost:8000/student/${encodeURIComponent(studentEmail)}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Failed to verify student')
      }

      const studentData = await response.json()
      setStudentData(studentData)
      setCurrentView('dashboard')
      
      // Fetch applications for this student
      try {
        const applicationsResponse = await fetch(`http://localhost:8000/student/${encodeURIComponent(studentEmail)}/applications`)
        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json()
          setApplications(applicationsData.applications || [])
        }
      } catch (err) {
        console.warn('Failed to fetch applications:', err)
      }
    } catch (err) {
      console.error('Email submission error:', err)
      setError(err.message || 'Failed to verify student. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

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
      
      // Stage 1: Upload certificate
      setProcessingStage(0)
      setProcessingProgress(10)
      
      const formDataToSend = new FormData()
      formDataToSend.append('file', formData.document)
      formDataToSend.append('training_type', formData.trainingType)
      
      const uploadResponse = await fetch(`http://localhost:8000/student/${studentData.student_id}/upload-certificate`, {
        method: 'POST',
        body: formDataToSend
      })
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Failed to upload certificate')
      }
      
      const uploadResult = await uploadResponse.json()
      const certificateId = uploadResult.certificate_id
      setCertificateId(certificateId)
      
      setProcessingProgress(25)
      
      // Stage 2: Process certificate (OCR + LLM)
      setProcessingStage(1)
      setProcessingProgress(40)
      
      const processResponse = await fetch(`http://localhost:8000/certificate/${certificateId}/process`, {
        method: 'POST'
      })
      
      if (!processResponse.ok) {
        const errorData = await processResponse.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Failed to process certificate')
      }
      
      const processResult = await processResponse.json()
      setProcessingProgress(100)
      setProcessingStage(5)
      
      // Extract results from backend response
      const llmResults = processResult.llm_results
      const decision = processResult.decision
      const evaluationResults = llmResults.evaluation_results?.results || {}
      
      // Set results based on LLM processing success
      if (!llmResults.success) {
        setResults({
          success: false,
          decision: decision.ai_decision || 'PENDING',
          training_hours: 0,
          credits: 0,
          training_type: formData.trainingType,
          duration: 'Not available',
          institution: 'Not available',
          summary: llmResults.error || 'LLM processing failed. Please check your configuration.'
        })
      } else {
        // Get extraction results for duration and institution
        const extractionResults = llmResults.extraction_results?.results || {}
        
        setResults({
          success: llmResults.success,
          decision: decision.ai_decision,
          training_hours: evaluationResults.total_working_hours || 0,
          credits: decision.ai_decision === 'REJECTED' ? 0 : (evaluationResults.credits_qualified || 0),
          training_type: formData.trainingType,
          requested_training_type: evaluationResults.requested_training_type || 'Not specified',
          degree_relevance: evaluationResults.degree_relevance || 'Not specified',
          duration: extractionResults.total_employment_period || 'Not specified',
          institution: extractionResults.employer || 'Not specified',
          summary: evaluationResults.justification || decision.ai_justification || 'Processing completed successfully.',
          summary_justification: evaluationResults.summary_justification || '',
          supporting_evidence: evaluationResults.supporting_evidence || '',
          challenging_evidence: evaluationResults.challenging_evidence || '',
          recommendation: evaluationResults.recommendation || '',
          justification: evaluationResults.justification || '',
          filename: formData.document?.name || 'Document',
          student_degree: studentData?.degree || 'Not specified',
        })
      }
      
      setCurrentView('results')
    } catch (err) {
      console.error('Processing error:', err)
      setError(err.message || 'Processing failed. Please try again.')
    } finally {
      setIsDocumentProcessing(false)
    }
  }

  // Send for approval handler
  const handleSendForApproval = () => {
    setCurrentView('approval')
  }

  // Refresh applications list
  const refreshApplications = async () => {
    try {
      const applicationsResponse = await fetch(`http://localhost:8000/student/${encodeURIComponent(studentEmail)}/applications`)
      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json()
        setApplications(applicationsData.applications || [])
      }
    } catch (err) {
      console.warn('Failed to refresh applications:', err)
    }
  }

  // Request review handler (appeal process)
  const handleRequestReview = () => {
    setCurrentView('request-review')
  }

  const handleSubmitAppeal = (application) => {
    // Set the results data and navigate to appeal page
    setResults({
      decision: application.ai_decision || 'REJECTED',
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

  // Submit new application handler
  const handleSubmitNewApplication = () => {
    // Clear form data and go back to upload
    setFormData({ document: null, trainingType: '' })
    setResults(null)
    setCurrentView('upload')
  }

  // Delete application handler
  const handleDeleteApplication = async (applicationId) => {
    try {
      const response = await fetch(`http://localhost:8000/certificate/${applicationId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Failed to delete application')
      }

      // Remove the application from the local state
      setApplications(prev => prev.filter(app => (app.certificate_id || app.id) !== applicationId))
    } catch (err) {
      console.error('Delete application error:', err)
      throw new Error(err.message || 'Failed to delete application')
    }
  }

  // Navigation handlers
  const handleViewApplications = () => {
    setCurrentView('applications')
  }

  const handleBackToDashboard = async (targetView = 'dashboard') => {
    setCurrentView(targetView)
    setFormData({ document: null, trainingType: '' })
    setError(null)
    setResults(null)
    setUserFeedback('')
    setCertificateId(null)
    setSelectedApplication(null)
    
    // Refresh applications when going to dashboard
    if (targetView === 'dashboard') {
      try {
        const applicationsResponse = await fetch(`http://localhost:8000/student/${encodeURIComponent(studentEmail)}/applications`)
        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json()
          setApplications(applicationsData.applications || [])
        }
      } catch (err) {
        console.warn('Failed to refresh applications:', err)
      }
    }
  }

  const handleViewApplicationDetails = (application) => {
    setSelectedApplication(application)
    setCurrentView('application-details')
  }

  const handleBackToApplications = () => {
    setCurrentView('applications')
    setSelectedApplication(null)
  }

  const handleLogout = () => {
    setCurrentView('email-entry')
    setStudentEmail('')
    setStudentData(null)
    setFormData({ document: null, trainingType: '' })
    setResults(null)
    setError(null)
    setUserFeedback('')
    setApplications([])
    setCertificateId(null)
  }

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'email-entry':
        return (
          <EmailEntry
            studentEmail={studentEmail}
            setStudentEmail={setStudentEmail}
            error={error}
            isProcessing={isProcessing}
            onEmailSubmit={handleEmailSubmit}
            onLogout={handleLogout}
          />
        )
      
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
          />
        )
      
      case 'review':
        return (
          <ReviewSubmit
            formData={formData}
            onBackToUpload={() => setCurrentView('upload')}
            onProcessDocument={handleProcessWithAI}
          />
        )
      
      case 'results':
        return (
          <Results
            results={results}
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
              // Set the results data and navigate to approval page
              setResults({
                decision: application.ai_decision || 'ACCEPTED',
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
          />
        )
      
      default:
      return (
          <EmailEntry
            studentEmail={studentEmail}
            setStudentEmail={setStudentEmail}
            error={error}
            isProcessing={isProcessing}
            onEmailSubmit={handleEmailSubmit}
            onLogout={handleLogout}
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

export default App
