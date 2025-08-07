import { useState, useRef, useEffect } from 'react'
import apiService from '../api.js'
import LoadingOverlay from './LoadingOverlay.jsx'
import { useDocumentProcessing } from '../hooks/useApiLoading.js'

// Inline SVG Icon Components
const UploadIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

const FileTextIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const GraduationCapIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
)

const MailIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const ClockIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CheckCircleIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const AlertCircleIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const LoaderIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24" {...props}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
)

const DownloadIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)

const AwardIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
)

const TargetIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const LightbulbIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
)

function Student() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    document: null,
    degree: '',
    email: '',
    trainingType: 'general'
  })
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [degreePrograms, setDegreePrograms] = useState([])
  const [showApprovalView, setShowApprovalView] = useState(false)
  const [selectedApprover, setSelectedApprover] = useState('')
  const [approvalSent, setApprovalSent] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [userFeedback, setUserFeedback] = useState('')
  const [isAnalysisRequest, setIsAnalysisRequest] = useState(false)
  const fileInputRef = useRef(null)
  
  // Use the new loading hook
  const { isProcessing: apiIsProcessing, progress } = useDocumentProcessing()

  // Mock approvers list - you can replace this with API call
  // const approvers = [
  //   { id: '1', name: 'Dr. Anna Mäkinen', role: 'Head of Business Administration' },
  //   { id: '2', name: 'Prof. Jussi Virtanen', role: 'Head of Information Technology' },
  //   { id: '3', name: 'Dr. Maria Koskinen', role: 'Head of Engineering' },
  //   { id: '4', name: 'Prof. Pekka Laaksonen', role: 'Head of Nursing' },
  //   { id: '5', name: 'Dr. Liisa Järvinen', role: 'Head of Social Services' },
  // ]

  // Load degree programs from API on component mount
  useEffect(() => {
    const loadDegreePrograms = async () => {
      try {
        const degrees = await apiService.getDegreePrograms()
        if (degrees.length > 0) {
          setDegreePrograms([...degrees, 'Custom Degree'])
        }
      } catch (error) {
        console.warn('Failed to load degree programs from API, using defaults:', error)
      }
    }

    loadDegreePrograms()
  }, [])

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, document: file }))
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setError(null)
    
    try {
      // Call the real API
      const results = await apiService.processDocument(
        formData.document,
        formData.degree,
        formData.email,
        formData.trainingType
      )
      
      setResults(results)
      setCurrentStep(4)
    } catch (err) {
      setError(err.message || 'Processing failed. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      document: null,
      degree: '',
      email: '',
      trainingType: 'general'
    })
    setResults(null)
    setError(null)
    setCurrentStep(1)
    setShowApprovalView(false)
    setSelectedApprover('')
    setApprovalSent(false)
    setShowFeedback(false)
    setUserFeedback('')
    setIsAnalysisRequest(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSendForApproval = () => {
    setShowApprovalView(true)
    setIsAnalysisRequest(false)
  }

  const handleAddFeedback = () => {
    setShowFeedback(true)
  }

  const handleRequestAnalysis = () => {
    if (!userFeedback.trim()) {
      alert('Please provide feedback before requesting analysis')
      return
    }
    setShowApprovalView(true)
    setIsAnalysisRequest(true)
  }

  const handleApprovalSubmit = () => {
    if (!selectedApprover) {
      alert('Please select an approver')
      return
    }
    setApprovalSent(true)
  }

  const handleProcessAnother = () => {
    resetForm()
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.document !== null
      case 2:
        return formData.degree && formData.email && formData.trainingType
      default:
        return true
    }
  }

  const nextStep = () => {
    if (canProceed()) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
            step <= currentStep 
              ? 'bg-oamk-orange-500 text-white' 
              : 'bg-gray-200 text-gray-500'
          }`}>
            {step < currentStep ? <CheckCircleIcon size={20} /> : step}
          </div>
          {step < 3 && (
            <div className={`w-16 h-1 mx-2 ${
              step < currentStep ? 'bg-oamk-orange-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <div className="card max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <UploadIcon className="w-16 h-16 text-oamk-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Work Certificate</h2>
        <p className="text-gray-600">Please upload your work certificate document</p>
      </div>
      
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-oamk-orange-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
          <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            {formData.document ? formData.document.name : 'Click to select or drag and drop'}
          </p>
          <p className="text-sm text-gray-500">
            Supported formats: PDF, PNG, JPG, DOCX
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary mt-4"
          >
            Select File
          </button>
        </div>
        
        {formData.document && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <FileTextIcon className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-green-800 font-medium">
              {formData.document.name} selected
            </span>
          </div>
        )}
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="card max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <GraduationCapIcon className="w-16 h-16 text-oamk-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Student Information</h2>
        <p className="text-gray-600">Please provide your degree and contact information</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Degree Program
          </label>
          <select
            value={formData.degree}
            onChange={(e) => handleInputChange('degree', e.target.value)}
            className="input-field"
          >
            <option value="">Select your degree program</option>
            {degreePrograms.map(degree => (
              <option key={degree} value={degree}>{degree}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Student Email
          </label>
          <div className="relative">
            <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="firstname.lastname@students.oamk.fi"
              className="input-field pl-10"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Training Type Application
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleInputChange('trainingType', 'general')}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.trainingType === 'general'
                  ? 'border-oamk-orange-500 bg-oamk-orange-50'
                  : 'border-gray-200 hover:border-oamk-orange-300'
              }`}
            >
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">General Training</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Transferable skills, not degree-specific
                </p>
              </div>
            </button>
            
            <button
              onClick={() => handleInputChange('trainingType', 'professional')}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.trainingType === 'professional'
                  ? 'border-oamk-orange-500 bg-oamk-orange-50'
                  : 'border-gray-200 hover:border-oamk-orange-300'
              }`}
            >
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Professional Training</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Degree-related, specialized work
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="card max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <TargetIcon className="w-16 h-16 text-oamk-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Review & Submit</h2>
        <p className="text-gray-600">Please review your information before processing</p>
      </div>
      
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Document</h3>
          <p className="text-gray-600">{formData.document?.name}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Student Information</h3>
          <div className="space-y-2 text-gray-600">
            <p><span className="font-medium">Degree:</span> {formData.degree}</p>
            <p><span className="font-medium">Email:</span> {formData.email}</p>
            <p><span className="font-medium">Training Type:</span> {formData.trainingType}</p>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <LightbulbIcon className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-800 mb-1">Processing Information</h4>
              <p className="text-blue-700 text-sm">
                Your document will be processed using OCR technology and AI analysis to evaluate 
                your work experience for academic credits. This process typically takes 2-3 minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderResults = () => {
    if (!results) return null
    
    const evalData = results.llm_results?.evaluation_results?.results || {}
    
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="card text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Complete!</h2>
          <p className="text-gray-600">
            Your work certificate has been successfully analyzed
          </p>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <div className="flex items-center mb-2">
              <FileTextIcon className="w-5 h-5 text-oamk-orange-500 mr-2" />
              <h3 className="font-semibold">Document</h3>
            </div>
            <p className="text-gray-600">{results.file_path}</p>
          </div>
          
          <div className="card">
            <div className="flex items-center mb-2">
              <GraduationCapIcon className="w-5 h-5 text-oamk-orange-500 mr-2" />
              <h3 className="font-semibold">Degree</h3>
            </div>
            <p className="text-gray-600">{results.student_degree}</p>
          </div>
        </div>

        {/* Storage Information */}
        {results.storage_info && (
          <div className="card">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <svg className="w-6 h-6 text-oamk-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              Storage Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Document Folder</label>
                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded font-mono">
                  {results.storage_info.document_folder}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Results File</label>
                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded font-mono">
                  {results.storage_info.results_file}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">OCR Text File</label>
                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded font-mono">
                  {results.storage_info.ocr_text_file}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Files in Folder</label>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>📄 Original document</div>
                  <div>📊 Complete results (JSON)</div>
                  <div>📝 OCR extracted text</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Evaluation Results */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <AwardIcon className="w-6 h-6 text-oamk-orange-500 mr-2" />
            Evaluation Results
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Working Hours</label>
                <p className="text-lg font-semibold">{evalData.total_working_hours || 'N/A'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Requested Training Type</label>
                <p className="text-lg font-semibold capitalize">{evalData.requested_training_type || 'N/A'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Credits Calculated</label>
                <p className="text-lg font-semibold text-oamk-orange-600">
                  {evalData.credits_calculated || evalData.credits_qualified || 'N/A'} ECTS
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Degree Relevance</label>
                <p className="text-lg font-semibold capitalize">{evalData.degree_relevance || 'N/A'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {evalData.supporting_evidence && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Supporting Evidence</label>
                  <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                    {evalData.supporting_evidence}
                  </p>
                </div>
              )}
              
              {evalData.challenging_evidence && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Challenging Evidence</label>
                  <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg">
                    {evalData.challenging_evidence}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Decision - ONLY the decision, no extra text */}
          {evalData.decision && (
            <div className="mt-4 p-4 bg-oamk-orange-50 border border-oamk-orange-200 rounded-lg">
              <h4 className="font-semibold text-oamk-orange-800 mb-2">Decision</h4>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                evalData.decision === 'ACCEPTED' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {evalData.decision}
              </span>
            </div>
          )}

          {/* Justification */}
          {evalData.justification && (
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-600">Justification</label>
              <p className="text-gray-700 mt-1">{evalData.justification}</p>
            </div>
          )}

          {/* Recommendation - only for rejected cases */}
          {evalData.recommendation && evalData.decision === 'REJECTED' && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center mb-2">
                <TargetIcon className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-semibold text-blue-800">AI Recommendation</h4>
              </div>
              <p className="text-blue-700 font-medium mb-2">{evalData.recommendation}</p>
              {evalData.recommendation_reasoning && (
                <p className="text-blue-600 text-sm">{evalData.recommendation_reasoning}</p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          {evalData.decision === 'REJECTED' ? (
            <>
              <button 
                disabled 
                className="btn-primary opacity-50 cursor-not-allowed"
                title="Approval not available for rejected applications"
              >
                <TargetIcon className="w-4 h-4 mr-2" />
                Send for Approval
              </button>
              <button onClick={handleAddFeedback} className="btn-secondary">
                <LightbulbIcon className="w-4 h-4 mr-2" />
                Add Your Feedback
              </button>
            </>
          ) : (
            <button onClick={handleSendForApproval} className="btn-primary">
              <TargetIcon className="w-4 h-4 mr-2" />
              Send for Approval
            </button>
          )}
        </div>

        {/* Feedback Section - only for rejected cases */}
        {showFeedback && evalData.decision === 'REJECTED' && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center mb-4">
              <LightbulbIcon className="w-5 h-5 text-yellow-600 mr-2" />
              <h4 className="font-semibold text-yellow-800">Provide Feedback</h4>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-yellow-700 mb-2">
                  Please provide additional information or feedback about your work experience:
                </label>
                <textarea
                  value={userFeedback}
                  onChange={(e) => setUserFeedback(e.target.value)}
                  placeholder="Describe your work experience in more detail, explain how it relates to your degree program, or provide any additional context that might help with the evaluation..."
                  className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
                  rows="6"
                />
              </div>
              <div className="flex justify-center">
                <button 
                  onClick={handleRequestAnalysis}
                  disabled={!userFeedback.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TargetIcon className="w-4 h-4 mr-2" />
                  Request Analysis
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderApprovalView = () => {
    if (approvalSent) {
      return (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Success Notification */}
          <div className="card text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isAnalysisRequest ? 'Analysis Request Sent' : 'Credit Application Sent for Approval'}
            </h2>
            <p className="text-gray-600 mb-4">
              {isAnalysisRequest 
                ? 'The teacher will review your feedback and provide a new analysis. You will receive a notification of the updated decision.'
                : 'The teacher will review your application and you will receive a notification of the final decision.'
              }
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <TargetIcon className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-semibold text-blue-800">
                  {isAnalysisRequest ? 'Analysis Request Details' : 'Application Details'}
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <label className="text-sm font-medium text-blue-600">Document</label>
                  <p className="text-blue-800">{results.file_path}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-600">Reviewer</label>
                  <p className="text-blue-800">
                    {approvers.find(a => a.id === selectedApprover)?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-600">Student</label>
                  <p className="text-blue-800">{results.student_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-600">Degree</label>
                  <p className="text-blue-800">{results.student_degree}</p>
                </div>
              </div>
              {isAnalysisRequest && userFeedback && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <label className="text-sm font-medium text-blue-600">Your Feedback</label>
                  <p className="text-blue-800 text-sm bg-blue-100 p-3 rounded mt-1">
                    {userFeedback}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button onClick={handleProcessAnother} className="btn-primary">
              <FileTextIcon className="w-4 h-4 mr-2" />
              Process Another Document
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="card text-center">
          <TargetIcon className="w-16 h-16 text-oamk-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isAnalysisRequest ? 'Request Analysis' : 'Send for Approval'}
          </h2>
          <p className="text-gray-600">
            {isAnalysisRequest 
              ? 'Select a teacher to review your feedback and provide a new analysis'
              : 'Select an approver to review your credit application'
            }
          </p>
        </div>

        {/* Approver Selection */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <GraduationCapIcon className="w-6 h-6 text-oamk-orange-500 mr-2" />
            Select {isAnalysisRequest ? 'Reviewer' : 'Approver'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose a {isAnalysisRequest ? 'reviewer' : 'approver'} from the list below:
              </label>
              <select
                value={selectedApprover}
                onChange={(e) => setSelectedApprover(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oamk-orange-500 focus:border-oamk-orange-500"
              >
                <option value="">Select a {isAnalysisRequest ? 'reviewer' : 'approver'}...</option>
                {approvers.map((approver) => (
                  <option key={approver.id} value={approver.id}>
                    {approver.name} - {approver.role}
                  </option>
                ))}
              </select>
            </div>

            {selectedApprover && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="font-semibold text-blue-800">
                    Selected {isAnalysisRequest ? 'Reviewer' : 'Approver'}
                  </h4>
                </div>
                <p className="text-blue-700">
                  <strong>{approvers.find(a => a.id === selectedApprover)?.name}</strong>
                </p>
                <p className="text-blue-600 text-sm">
                  {approvers.find(a => a.id === selectedApprover)?.role}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button 
            onClick={handleApprovalSubmit}
            disabled={!selectedApprover}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TargetIcon className="w-4 h-4 mr-2" />
            {isAnalysisRequest ? 'Request Analysis' : 'Send for Approval'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Loading Overlay */}
      <LoadingOverlay />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!results ? (
          <>
            {renderStepIndicator()}
            
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            
            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 max-w-2xl mx-auto">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={apiIsProcessing}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {apiIsProcessing ? (
                    <>
                      <LoaderIcon className="w-4 h-4 mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Process Document'
                  )}
                </button>
              )}
            </div>
            
            {error && (
              <div className="mt-4 max-w-2xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                  <AlertCircleIcon className="w-5 h-5 text-red-600 mr-3" />
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}
          </>
        ) : (
          showApprovalView ? renderApprovalView() : renderResults()
        )}
      </div>
    </div>
  )
}

export default Student 