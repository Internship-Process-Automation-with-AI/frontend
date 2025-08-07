import { useState, useMemo, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '../common/Icons.jsx'
import ApplicationSearch from './ApplicationSearch.jsx'
import ApplicationFilters from './ApplicationFilters.jsx'
import Pagination from './Pagination.jsx'

const ITEMS_PER_PAGE = 10

const ReviewerApplicationsList = ({ applications, onReview, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('pending')
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    trainingType: '',
    aiDecision: ''
  })

  // Reset page when tab changes, search term changes, or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchTerm, filters])

  const filteredAndCategorizedApplications = useMemo(() => {
    const filtered = applications.filter(app => {
      // Search filter
      const searchLower = searchTerm.toLowerCase()
      const studentName = `${app.student.first_name} ${app.student.last_name}`.toLowerCase()
      const studentEmail = app.student.email.toLowerCase()
      const matchesSearch = !searchTerm || 
        studentName.includes(searchLower) || 
        studentEmail.includes(searchLower)

      // Training type filter
      const matchesTrainingType = !filters.trainingType || 
        app.certificate.training_type === filters.trainingType

      // AI decision filter
      const matchesAiDecision = !filters.aiDecision || 
        app.decision.ai_decision === filters.aiDecision

      return matchesSearch && matchesTrainingType && matchesAiDecision
    })

    return {
      pending: filtered.filter(app => !app.decision.reviewer_decision),
      reviewed: filtered.filter(app => app.decision.reviewer_decision)
    }
  }, [applications, searchTerm, filters])

  const paginatedApplications = useMemo(() => {
    const currentApps = activeTab === 'pending' 
      ? filteredAndCategorizedApplications.pending 
      : filteredAndCategorizedApplications.reviewed

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    return currentApps.slice(startIndex, endIndex)
  }, [filteredAndCategorizedApplications, activeTab, currentPage])

  const totalPages = useMemo(() => {
    const currentApps = activeTab === 'pending' 
      ? filteredAndCategorizedApplications.pending 
      : filteredAndCategorizedApplications.reviewed

    return Math.ceil(currentApps.length / ITEMS_PER_PAGE)
  }, [filteredAndCategorizedApplications, activeTab])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'REJECTED':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      case 'PENDING':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const renderApplicationList = (apps) => {
    if (!apps.length) {
      return (
        <div className="text-center text-gray-500 py-8">
          {searchTerm 
            ? `No ${activeTab} applications found matching "${searchTerm}"`
            : `No ${activeTab} applications`}
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {apps.map(app => (
          <div key={app.certificate.certificate_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
            <div className="flex flex-col space-y-3">
              {/* Student Info */}
              <div>
                <div className="font-semibold text-gray-800">
                  {app.student.first_name} {app.student.last_name}
                </div>
                <div className="text-gray-600 text-sm">
                  {app.student.email}
                </div>
              </div>

              {/* Application Info - Single Line */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  {/* Training Type */}
                  <div className="text-gray-600 text-sm">
                    <span className="font-medium">Training:</span> {app.certificate.training_type}
                  </div>

                  {/* AI Decision */}
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 font-medium">AI:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      app.decision.ai_decision === 'ACCEPTED' 
                        ? 'bg-green-100 text-green-800' 
                        : app.decision.ai_decision === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {app.decision.ai_decision}
                    </span>
                  </div>

                  {/* Reviewer Decision - Only show if exists */}
                  {app.decision.reviewer_decision && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600 font-medium">Decision:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        app.decision.reviewer_decision === 'PASS' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {app.decision.reviewer_decision}
                      </span>
                    </div>
                  )}
                </div>

                {/* Review Button */}
                <button
                  className="btn-primary px-4 py-2 text-sm font-semibold"
                  onClick={() => onReview(app.certificate.certificate_id)}
                >
                  {app.decision.reviewer_decision ? 'View Review' : 'Review'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return <div className="text-center text-gray-500 py-8">Loading applications...</div>
  }

  if (!applications?.length) {
    return <div className="text-center text-gray-500 py-8">No applications assigned.</div>
  }

  const { pending, reviewed } = filteredAndCategorizedApplications

  return (
    <div>
      <ApplicationSearch onSearch={setSearchTerm} />
      
      <ApplicationFilters onFilterChange={setFilters} />
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-6 py-3 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'pending'
              ? 'border-oamk-orange-500 text-oamk-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('pending')}
        >
          Pending
          {pending.length > 0 && (
            <span className="ml-2 bg-oamk-orange-100 text-oamk-orange-600 px-2.5 py-0.5 rounded-full text-xs">
              {pending.length}
            </span>
          )}
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'reviewed'
              ? 'border-oamk-orange-500 text-oamk-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('reviewed')}
        >
          Reviewed
          {reviewed.length > 0 && (
            <span className="ml-2 bg-oamk-orange-100 text-oamk-orange-600 px-2.5 py-0.5 rounded-full text-xs">
              {reviewed.length}
            </span>
          )}
        </button>
      </div>

      {/* Active Tab Content */}
      {renderApplicationList(paginatedApplications)}

      {/* Pagination */}
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}

export default ReviewerApplicationsList 