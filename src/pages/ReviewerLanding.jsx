import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EmailEntry from '../components/common/EmailEntry.jsx'
import MessageModal from '../components/common/MessageModal.jsx'
import { GraduationCapIcon } from '../components/common/Icons.jsx'
import { getReviewerByEmail } from '../api_calls/reviewerApi.js'

const ReviewerLanding = () => {
  const [reviewerEmail, setReviewerEmail] = useState('')
  const [error, setError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalConfig, setModalConfig] = useState({
    type: 'error',
    title: '',
    message: ''
  })
  const navigate = useNavigate()

  const handleEmailSubmit = async () => {
    if (!reviewerEmail.trim()) {
      setModalConfig({
        type: 'error',
        title: 'Missing Email',
        message: 'Please enter your reviewer email.'
      })
      setShowModal(true)
      return
    }
    setError(null)
    setIsProcessing(true)

    try {
      const reviewerData = await getReviewerByEmail(reviewerEmail)
      localStorage.setItem('reviewerId', reviewerData.reviewer_id)
      localStorage.setItem('reviewerEmail', reviewerEmail)
      navigate('/reviewer/portal', { 
        state: { 
          reviewerEmail,
          reviewerId: reviewerData.reviewer_id 
        },
        replace: true
      })
    } catch (err) {
      setError(err.message || 'Failed to verify reviewer email.')
      setModalConfig({
        type: 'error',
        title: 'Verification Failed',
        message: err.message || 'Failed to verify reviewer email. Please try again.'
      })
      setShowModal(true)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="card text-center">
          <div className="bg-gradient-to-r from-oamk-orange-500 to-oamk-orange-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <GraduationCapIcon className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Reviewer Portal</h1>
          <p className="text-gray-600 mb-8">Access and review student credit applications</p>
          
          <EmailEntry
            studentEmail={reviewerEmail}
            setStudentEmail={setReviewerEmail}
            error={error}
            isProcessing={isProcessing}
            onEmailSubmit={handleEmailSubmit}
            label="Enter your reviewer email"
            placeholder="firstname.lastname@oamk.fi"
          />
        </div>
      </div>
      
      <MessageModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
      />
    </div>
  )
}

export default ReviewerLanding 