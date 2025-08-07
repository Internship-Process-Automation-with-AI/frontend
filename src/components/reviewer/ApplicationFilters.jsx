import { useState } from 'react'
import { ChevronDownIcon } from '../common/Icons.jsx'

const ApplicationFilters = ({ onFilterChange }) => {
  const [trainingType, setTrainingType] = useState('')
  const [aiDecision, setAiDecision] = useState('')

  const handleTrainingTypeChange = (value) => {
    setTrainingType(value)
    onFilterChange({ trainingType: value, aiDecision })
  }

  const handleAiDecisionChange = (value) => {
    setAiDecision(value)
    onFilterChange({ trainingType, aiDecision: value })
  }

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {/* Training Type Filter */}
      <div className="relative">
        <select
          value={trainingType}
          onChange={(e) => handleTrainingTypeChange(e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-oamk-orange-500 focus:border-transparent"
        >
          <option value="">Training Types</option>
          <option value="GENERAL">General</option>
          <option value="PROFESSIONAL">Professional</option>
        </select>
        <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {/* AI Decision Filter */}
      <div className="relative">
        <select
          value={aiDecision}
          onChange={(e) => handleAiDecisionChange(e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-oamk-orange-500 focus:border-transparent"
        >
          <option value="">AI Decisions</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Active Filters */}
      {(trainingType || aiDecision) && (
        <div className="flex items-center gap-2">
          {trainingType && (
            <span className="bg-oamk-orange-100 text-oamk-orange-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              Training: {trainingType}
              <button
                onClick={() => handleTrainingTypeChange('')}
                className="hover:text-oamk-orange-600"
              >
                ×
              </button>
            </span>
          )}
          {aiDecision && (
            <span className="bg-oamk-orange-100 text-oamk-orange-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              AI: {aiDecision}
              <button
                onClick={() => handleAiDecisionChange('')}
                className="hover:text-oamk-orange-600"
              >
                ×
              </button>
            </span>
          )}
          {(trainingType || aiDecision) && (
            <button
              onClick={() => {
                setTrainingType('')
                setAiDecision('')
                onFilterChange({ trainingType: '', aiDecision: '' })
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ApplicationFilters 