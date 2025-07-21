import React, { useState } from 'react'
import ProcessingModal from './ProcessingModal'

const Results = ({ 
  results, 
  onBackToDashboard,
  onSendForApproval,
  onRequestReview,
  onSubmitNewApplication
}) => {
  const getDecisionBg = (decision) => {
    return decision === 'ACCEPTED' 
      ? 'bg-green-50 border-green-200' 
      : 'bg-red-50 border-red-200'
  }

  const getDecisionColor = (decision) => {
    return decision === 'ACCEPTED' 
      ? 'bg-green-500 text-white' 
      : 'bg-red-500 text-white'
  }



  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-lg">No results available</div>
          <button
            onClick={() => onBackToDashboard('dashboard')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Processing Complete!</h1>
          <p className="text-gray-600">Your work certificate has been successfully analyzed</p>
        </div>

        {/* Decision Box */}
        <div className={`rounded-lg border p-6 mb-6 ${getDecisionBg(results.decision)}`}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">DECISION</h2>
            <div className="flex items-center justify-center space-x-4">
              <span className={`px-8 py-3 rounded-full text-xl font-bold ${getDecisionColor(results.decision)}`}>
                {results.decision}
              </span>
              <span className="text-3xl font-bold text-gray-600">{results.credits || 0} ECTS</span>
            </div>
          </div>
        </div>

        {/* Document Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-gray-600 text-sm mb-1">Document</div>
            <div className="font-semibold text-gray-800">{results.filename || 'Document'}</div>
          </div>
          <div className="card text-center">
            <div className="text-gray-600 text-sm mb-1">Degree</div>
            <div className="font-semibold text-gray-800">{results.student_degree || 'Not specified'}</div>
          </div>
        </div>
        
        {/* Evaluation Results Box */}
        <div className="card mb-6">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Evaluation Results</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left Column - Key Metrics */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Working Hours</p>
                <p className="text-xl font-bold text-gray-800">
                  {results.training_hours ? results.training_hours.toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Requested Training Type</p>
                <p className="text-xl font-bold text-gray-800">{results.requested_training_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Credits Calculated</p>
                <p className="text-xl font-bold text-gray-800">{results.credits || 'N/A'} ECTS</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Degree Relevance</p>
                <p className="text-xl font-bold text-gray-800 capitalize">{results.degree_relevance}</p>
              </div>
            </div>
            
            {/* Right Column - Evidence Boxes */}
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Supporting Evidence</h4>
                <p className="text-green-700 text-sm">
                  {results.supporting_evidence || 'No supporting evidence available.'}
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Challenging Evidence</h4>
                <p className="text-yellow-700 text-sm">
                  {results.challenging_evidence || 'No challenging evidence available.'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Justification Section */}
          <div className="mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Justification</h4>
              <p className="text-blue-700 text-sm leading-relaxed">
                {results.justification || 'No justification available.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => onBackToDashboard('dashboard')}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
          {results.decision === 'ACCEPTED' && (
            <button
              onClick={onSendForApproval}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Send for Approval
            </button>
          )}
          {results.decision === 'REJECTED' && (
            <>
              <button
                onClick={onRequestReview}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Request Review
              </button>
              <button
                onClick={onSubmitNewApplication}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Submit New Application
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Results 