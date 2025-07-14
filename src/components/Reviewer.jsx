import { useState, useEffect } from 'react'
import apiService from '../api.js'

// Inline SVG Icon Components
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

const XCircleIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const EyeIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const MessageIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

const AwardIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
)

const InboxIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
)

function Reviewer() {
  const [applications, setApplications] = useState([])
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [reviewerComment, setReviewerComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('pending') // pending, approved, rejected, all

  // Mock applications data - in a real app, this would come from an API
  const mockApplications = [
    {
      id: 1,
      student_name: 'Anna Korhonen',
      student_email: 'anna.korhonen@students.oamk.fi',
      student_degree: 'Business Information Technology',
      document_name: 'work_certificate_anna.pdf',
      submitted_at: '2025-01-15 10:30:00',
      status: 'pending',
      ai_decision: 'ACCEPTED',
      credits_calculated: 15,
      training_type: 'professional',
      working_hours: 600,
      degree_relevance: 'high',
      justification: 'Strong experience in software development and project management, directly relevant to the degree program.',
      supporting_evidence: 'Documented experience with modern web technologies and agile methodologies.',
      challenging_evidence: 'Some tasks were more generic IT support rather than specialized development work.',
      student_feedback: null
    },
    {
      id: 2,
      student_name: 'Mikko Virtanen',
      student_email: 'mikko.virtanen@students.oamk.fi',
      student_degree: 'Mechanical Engineering',
      document_name: 'employment_letter_mikko.pdf',
      submitted_at: '2025-01-14 14:15:00',
      status: 'pending',
      ai_decision: 'REJECTED',
      credits_calculated: 0,
      training_type: 'general',
      working_hours: 320,
      degree_relevance: 'low',
      justification: 'Work experience is primarily in customer service, not directly related to mechanical engineering.',
      supporting_evidence: 'Good communication skills and teamwork experience.',
      challenging_evidence: 'No technical engineering tasks or use of engineering principles.',
      student_feedback: 'I worked closely with the technical team and helped with quality control processes. I also assisted in testing new equipment and documenting procedures.'
    },
    {
      id: 3,
      student_name: 'Sari Laine',
      student_email: 'sari.laine@students.oamk.fi',
      student_degree: 'Nursing',
      document_name: 'certificate_sari.pdf',
      submitted_at: '2025-01-13 09:45:00',
      status: 'approved',
      credits_calculated: 20,
      training_type: 'professional',
      working_hours: 800,
      degree_relevance: 'high',
      justification: 'Extensive healthcare experience directly applicable to nursing education.',
      supporting_evidence: 'Direct patient care, medical procedures, and healthcare team collaboration.',
      challenging_evidence: 'Some administrative tasks were less relevant to clinical nursing skills.',
      reviewer_decision: 'approved',
      reviewer_comment: 'Excellent healthcare background with strong clinical experience.',
      reviewed_at: '2025-01-13 16:20:00'
    },
    {
      id: 4,
      student_name: 'Jari Mäkelä',
      student_email: 'jari.makela@students.oamk.fi',
      student_degree: 'Business Administration',
      document_name: 'work_experience_jari.pdf',
      submitted_at: '2025-01-12 11:00:00',
      status: 'rejected',
      credits_calculated: 5,
      training_type: 'general',
      working_hours: 200,
      degree_relevance: 'medium',
      justification: 'Limited business-related tasks and insufficient working hours.',
      supporting_evidence: 'Some exposure to business operations and customer interaction.',
      challenging_evidence: 'Most work was manual labor with minimal business decision-making.',
      reviewer_decision: 'rejected',
      reviewer_comment: 'Insufficient relevant business experience. Recommend more specialized business role.',
      reviewed_at: '2025-01-12 15:30:00'
    }
  ]

  useEffect(() => {
    // In a real app, this would fetch from an API
    setApplications(mockApplications)
  }, [])

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true
    return app.status === filter
  })

  const handleReviewApplication = (application) => {
    setSelectedApplication(application)
    setReviewerComment(application.reviewer_comment || '')
  }

  const handleApprove = async () => {
    setLoading(true)
    try {
      // In a real app, this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedApplications = applications.map(app => 
        app.id === selectedApplication.id 
          ? { 
              ...app, 
              status: 'approved', 
              reviewer_decision: 'approved',
              reviewer_comment: reviewerComment,
              reviewed_at: new Date().toISOString()
            }
          : app
      )
      
      setApplications(updatedApplications)
      setSelectedApplication(null)
      setReviewerComment('')
    } catch (error) {
      console.error('Error approving application:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      // In a real app, this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedApplications = applications.map(app => 
        app.id === selectedApplication.id 
          ? { 
              ...app, 
              status: 'rejected', 
              reviewer_decision: 'rejected',
              reviewer_comment: reviewerComment,
              reviewed_at: new Date().toISOString()
            }
          : app
      )
      
      setApplications(updatedApplications)
      setSelectedApplication(null)
      setReviewerComment('')
    } catch (error) {
      console.error('Error rejecting application:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Review' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const getAIDecisionBadge = (decision) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        decision === 'ACCEPTED' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        AI: {decision}
      </span>
    )
  }

  const renderApplicationsList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Credit Applications</h2>
          <p className="text-gray-600">Review and approve student work experience applications</p>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex space-x-2">
          {['pending', 'approved', 'rejected', 'all'].map(filterType => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterType
                  ? 'bg-oamk-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              {filterType !== 'all' && (
                <span className="ml-2 bg-white bg-opacity-30 px-2 py-1 rounded-full text-xs">
                  {applications.filter(app => app.status === filterType).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <InboxIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No applications found for the selected filter.</p>
          </div>
        ) : (
          filteredApplications.map(application => (
            <div key={application.id} className="card border-l-4 border-oamk-orange-500">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {application.student_name}
                    </h3>
                    {getStatusBadge(application.status)}
                    {getAIDecisionBadge(application.ai_decision)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span> {application.student_email}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Degree:</span> {application.student_degree}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Document:</span> {application.document_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Working Hours:</span> {application.working_hours}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Training Type:</span> {application.training_type}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Credits:</span> {application.credits_calculated} ECTS
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Submitted:</span> {new Date(application.submitted_at).toLocaleString()}
                  </p>
                  
                  {application.student_feedback && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center mb-2">
                        <MessageIcon className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-800">Student Feedback</span>
                      </div>
                      <p className="text-sm text-blue-700">{application.student_feedback}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => handleReviewApplication(application)}
                    className="btn-primary px-4 py-2 text-sm"
                  >
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Review
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderApplicationDetails = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Application Review</h2>
          <p className="text-gray-600">{selectedApplication.student_name}</p>
        </div>
        <button
          onClick={() => setSelectedApplication(null)}
          className="btn-secondary"
        >
          Back to List
        </button>
      </div>

      {/* Application Overview */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <GraduationCapIcon className="w-5 h-5 text-oamk-orange-500 mr-2" />
          Application Overview
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Student Name</label>
              <p className="text-gray-800">{selectedApplication.student_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-gray-800">{selectedApplication.student_email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Degree Program</label>
              <p className="text-gray-800">{selectedApplication.student_degree}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Document</label>
              <p className="text-gray-800">{selectedApplication.document_name}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Working Hours</label>
              <p className="text-gray-800">{selectedApplication.working_hours}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Training Type</label>
              <p className="text-gray-800 capitalize">{selectedApplication.training_type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Credits Calculated</label>
              <p className="text-gray-800">{selectedApplication.credits_calculated} ECTS</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Submitted</label>
              <p className="text-gray-800">{new Date(selectedApplication.submitted_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <AwardIcon className="w-5 h-5 text-oamk-orange-500 mr-2" />
          AI Analysis
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium text-gray-600">AI Decision</label>
              <div className="mt-1">
                {getAIDecisionBadge(selectedApplication.ai_decision)}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Degree Relevance</label>
              <p className="text-gray-800 capitalize">{selectedApplication.degree_relevance}</p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Justification</label>
            <p className="text-gray-800 mt-1">{selectedApplication.justification}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Supporting Evidence</label>
              <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg mt-1">
                {selectedApplication.supporting_evidence}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Challenging Evidence</label>
              <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg mt-1">
                {selectedApplication.challenging_evidence}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Feedback */}
      {selectedApplication.student_feedback && (
        <div className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <MessageIcon className="w-5 h-5 text-oamk-orange-500 mr-2" />
            Student Feedback
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">{selectedApplication.student_feedback}</p>
          </div>
        </div>
      )}

      {/* Review Section */}
      {selectedApplication.status === 'pending' && (
        <div className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <ClockIcon className="w-5 h-5 text-oamk-orange-500 mr-2" />
            Your Review
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reviewer Comments
              </label>
              <textarea
                value={reviewerComment}
                onChange={(e) => setReviewerComment(e.target.value)}
                placeholder="Add your comments about this application..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oamk-orange-500 focus:border-oamk-orange-500 resize-none"
                rows="4"
              />
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleApprove}
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                {loading ? 'Processing...' : 'Approve Application'}
              </button>
              <button
                onClick={handleReject}
                disabled={loading}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <XCircleIcon className="w-4 h-4 mr-2" />
                {loading ? 'Processing...' : 'Reject Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review History */}
      {selectedApplication.status !== 'pending' && (
        <div className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <ClockIcon className="w-5 h-5 text-oamk-orange-500 mr-2" />
            Review History
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Final Decision</label>
              <div className="mt-1">
                {getStatusBadge(selectedApplication.status)}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Reviewed At</label>
              <p className="text-gray-800">{new Date(selectedApplication.reviewed_at).toLocaleString()}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Reviewer Comments</label>
              <p className="text-gray-800 bg-gray-50 p-3 rounded-lg mt-1">
                {selectedApplication.reviewer_comment || 'No comments provided'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {selectedApplication ? renderApplicationDetails() : renderApplicationsList()}
    </div>
  )
}

export default Reviewer 