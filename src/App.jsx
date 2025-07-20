import { useState, useRef, useEffect } from 'react'
import './App.css'
import apiService from './api.js'
import LoadingOverlay from './components/LoadingOverlay.jsx'
import { useDocumentProcessing } from './hooks/useApiLoading.js'

// Import components
import EmailEntry from './components/EmailEntry.jsx'
import Dashboard from './components/Dashboard.jsx'
import UploadCertificate from './components/UploadCertificate.jsx'
import ReviewSubmit from './components/ReviewSubmit.jsx'
import ProcessingModal from './components/ProcessingModal.jsx'
import Feedback from './components/Feedback.jsx'
import Applications from './components/Applications.jsx'

function App() {
  // App states following the user flow diagram
  const [currentView, setCurrentView] = useState('email-entry') // email-entry, dashboard, upload, process, feedback, applications
  const [studentEmail, setStudentEmail] = useState('')
  const [studentData, setStudentData] = useState(null)
  const [formData, setFormData] = useState({
    document: null,
    trainingType: ''
  })
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDocumentProcessing, setIsDocumentProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState(0)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [userFeedback, setUserFeedback] = useState('')
  const [applications, setApplications] = useState([])
  const [certificateId, setCertificateId] = useState(null)
  const fileInputRef = useRef(null)
  
  // Use the new loading hook
  const { isProcessing: apiIsProcessing, progress } = useDocumentProcessing()

  // Load student data when email is validated
  const handleEmailSubmit = async () => {
    if (!studentEmail.trim()) {
      setError('Please enter your email address')
      return
    }

    if (!studentEmail.includes('@students.oamk.fi')) {
      setError('Please use your OAMK student email address')
      return
    }

    try {
      setError(null)
      setIsProcessing(true)
      
      // Call the backend API to get student data
      const response = await fetch(`http://localhost:8000/student/${encodeURIComponent(studentEmail)}`)
      
      if (response.ok) {
        const data = await response.json()
        setStudentData(data)
        
        // Fetch applications with decision information
        try {
          const applicationsResponse = await fetch(`http://localhost:8000/student/${encodeURIComponent(studentEmail)}/applications`)
          if (applicationsResponse.ok) {
            const applicationsData = await applicationsResponse.json()
            setApplications(applicationsData.applications || [])
          }
        } catch (err) {
          console.warn('Failed to fetch applications:', err)
          setApplications([])
        }
        
        setCurrentView('dashboard')
      } else {
        setError('Student not found. Please check your email address.')
      }
    } catch (err) {
      setError('Failed to verify student. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, document: file }))
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleUploadCertificate = () => {
    if (!formData.document) {
      setError('Please select a file first')
      return
    }
    setCurrentView('review')
  }

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
      setCertificateId(certificateId) // Store certificateId
      
      setProcessingProgress(25)
      
      // Stage 2: Process certificate (OCR + LLM)
      setProcessingStage(1)
      setProcessingProgress(40)
      
      const processResponse = await fetch(`http://localhost:8000/certificate/${certificateId}/process`, {
        method: 'POST'
      })
      
      console.log('Process response status:', processResponse.status)
      console.log('Process response headers:', processResponse.headers)
      
      if (!processResponse.ok) {
        const errorData = await processResponse.json().catch(() => ({}))
        console.error('Process error response:', errorData)
        throw new Error(errorData.detail || 'Failed to process certificate')
      }
      
      const processResult = await processResponse.json()
      console.log('Process result:', processResult)
      
      setProcessingProgress(100)
      setProcessingStage(5) // Final stage
      
      // Extract results from backend response
      const llmResults = processResult.llm_results
      const decision = processResult.decision
      const evaluationResults = llmResults.evaluation_results?.results || {}
      
      console.log('LLM Results:', llmResults)
      console.log('Decision:', decision)
      console.log('Evaluation Results:', evaluationResults)
      console.log('Form Data Training Type:', formData.trainingType)
      console.log('Evaluation Results Requested Training Type:', evaluationResults.requested_training_type)
      
      // Check if LLM processing failed
      if (!llmResults.success) {
        console.warn('LLM processing failed:', llmResults.error)
        // Still show results but with error indication
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
                setResults({
          success: llmResults.success,
          decision: decision.ai_decision,
          training_hours: evaluationResults.total_working_hours || 0,
          credits: decision.ai_decision === 'REJECTED' ? 0 : (evaluationResults.credits_qualified || 0),
          training_type: formData.trainingType,
          requested_training_type: evaluationResults.requested_training_type || 'Not specified',
          degree_relevance: evaluationResults.degree_relevance || 'Not specified',
          duration: evaluationResults.duration || 'Not specified',
          institution: evaluationResults.institution || 'Not specified',
          summary: evaluationResults.justification || decision.ai_justification || 'Processing completed successfully.',
          summary_justification: evaluationResults.summary_justification || '',
          supporting_evidence: evaluationResults.supporting_evidence || '',
          challenging_evidence: evaluationResults.challenging_evidence || '',
          recommendation: evaluationResults.recommendation || '',
          justification: evaluationResults.justification || '',
          filename: formData.document?.name || 'Document',
          student_degree: student.degree || 'Not specified',
        })
      }
      
      setCurrentView('feedback')
    } catch (err) {
      console.error('Processing error:', err)
      setError(err.message || 'Processing failed. Please try again.')
    } finally {
      setIsDocumentProcessing(false)
    }
  }

  const handleSendFeedback = async () => {
    if (!certificateId) {
      setError('Certificate ID not available. Cannot send feedback.')
      return
    }

    if (!userFeedback.trim()) {
      setError('Please provide feedback.')
      return
    }

    try {
      setError(null)
      setIsProcessing(true)
      
      const feedbackPayload = {
        student_feedback: userFeedback,
        reviewer_id: null // Optional, can be null for student feedback
      }

      const response = await fetch(`http://localhost:8000/certificate/${certificateId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackPayload)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Failed to send feedback')
      }

      const result = await response.json()
      console.log('Feedback submitted successfully:', result)
      setShowFeedback(true)
      
      // Refresh applications list from backend
      try {
        const applicationsResponse = await fetch(`http://localhost:8000/student/${encodeURIComponent(studentEmail)}/applications`)
        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json()
          setApplications(applicationsData.applications || [])
        }
      } catch (err) {
        console.warn('Failed to refresh applications:', err)
      }
      
      // Clear form data
      setFormData({ document: null, trainingType: '' })
      setUserFeedback('')
      setCertificateId(null) // Clear certificateId after feedback
    } catch (err) {
      console.error('Feedback submission error:', err)
      setError(err.message || 'Failed to send feedback. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleViewApplications = () => {
    setCurrentView('applications')
  }

  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
    // Clear form data when going back to dashboard
    setFormData({ document: null, trainingType: '' })
    setError(null)
    setResults(null)
    setUserFeedback('')
    setCertificateId(null) // Clear certificateId when going back
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
    setCertificateId(null) // Clear certificateId on logout
  }

  // Render the appropriate view based on currentView state
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
      
      case 'feedback':
        return (
          <Feedback
            results={results}
            userFeedback={userFeedback}
            setUserFeedback={setUserFeedback}
            onSendFeedback={handleSendFeedback}
            onBackToDashboard={handleBackToDashboard}
          />
        )
      
      case 'applications':
        return (
          <Applications
            applications={applications}
            onBackToDashboard={handleBackToDashboard}
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
