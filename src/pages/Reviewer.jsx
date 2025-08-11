import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/common/Header.jsx'
import ReviewerApplicationsList from '../components/reviewer/ReviewerApplicationsList.jsx'
import {
  getReviewerByEmail,
  getReviewerCertificates
} from '../api_calls/reviewerApi.js'

function Reviewer() {
  const location = useLocation()
  const navigate = useNavigate()
  const reviewerEmail = location.state?.reviewerEmail || localStorage.getItem('reviewerEmail')
  const reviewerId = location.state?.reviewerId || localStorage.getItem('reviewerId')
  const [reviewer, setReviewer] = useState(null)
  const [applications, setApplications] = useState([])
  const [error, setError] = useState('')
  const [fetching, setFetching] = useState(false)
  const [fetchingApplications, setFetchingApplications] = useState(false)

  useEffect(() => {
    if (!reviewerEmail && !reviewerId) {
      navigate('/reviewer')
      return
    }
    async function fetchReviewer() {
      setFetching(true)
      setError('')
      try {
        // If we don't have reviewer data, fetch it
        if (!reviewer) {
          const reviewerData = await getReviewerByEmail(reviewerEmail)
          setReviewer(reviewerData)
          localStorage.setItem('reviewerId', reviewerData.reviewer_id)
          localStorage.setItem('reviewerEmail', reviewerEmail)
        }
        
        // Fetch applications using the reviewer ID
        setFetchingApplications(true)
        try {
          const apps = await getReviewerCertificates(reviewerId || reviewer?.reviewer_id)
          setApplications(apps)
        } catch (appErr) {
          console.warn('Failed to fetch applications:', appErr)
          setError(`Failed to load applications: ${appErr.message}`)
        } finally {
          setFetchingApplications(false)
        }
      } catch (err) {
        setError(err.message || 'Failed to load reviewer data')
        // If we fail to verify the reviewer, clear storage and redirect
        localStorage.removeItem('reviewerId')
        localStorage.removeItem('reviewerEmail')
        navigate('/reviewer')
      } finally {
        setFetching(false)
      }
    }
    fetchReviewer()
  }, [reviewerEmail, reviewerId, navigate, reviewer])

  const handleLogout = () => {
    localStorage.removeItem('reviewerId')
    localStorage.removeItem('reviewerEmail')
    navigate('/reviewer', { replace: true })
  }

  const handleReview = (certificateId) => {
    navigate(`/reviewer/portal/applications/${certificateId}`, { 
      state: { reviewerId: reviewerId || reviewer?.reviewer_id } 
    })
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header reviewerData={reviewer} onLogout={handleLogout} />
        <div className="text-center py-12 text-gray-500">Loading reviewer data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header reviewerData={reviewer} onLogout={handleLogout} />
        <div className="text-center py-12 text-red-600">{error}</div>
      </div>
    )
  }

  if (!reviewer) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header reviewerData={reviewer} onLogout={handleLogout} />
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Applications Section */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-4">Assigned Applications</h3>
          <ReviewerApplicationsList 
            applications={applications}
            onReview={handleReview}
            isLoading={fetchingApplications}
          />
        </div>
      </div>
    </div>
  )
}

export default Reviewer 