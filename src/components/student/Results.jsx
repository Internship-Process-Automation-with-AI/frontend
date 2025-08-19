import React, { useState } from 'react'
import ProcessingModal from './ProcessingModal'
import StepIndicator from './StepIndicator.jsx'

const Results = ({ 
  results, 
  onBackToDashboard,
  onSendForApproval,
  onRequestReview,
  onSubmitNewApplication,
  formData,        // Add formData prop to get original form values
  studentData      // Add studentData prop to get student information
}) => {
  // Debug the results structure
  React.useEffect(() => {
    console.log('=== RESULTS DEBUG ===')
    console.log('Full results object:', results)
    console.log('Results type:', typeof results)
    if (results) {
      console.log('Results keys:', Object.keys(results))
      Object.keys(results).forEach(key => {
        console.log(`${key}:`, results[key], `(type: ${typeof results[key]})`)
      })
      
      // Check for nested objects
      if (results.decision) {
        console.log('Decision object:', results.decision, typeof results.decision)
      }
      if (results.certificate) {
        console.log('Certificate object:', results.certificate)
      }
      if (results.student) {
        console.log('Student object:', results.student)
      }
    }
    console.log('=== END DEBUG ===')
  }, [results])

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

  // Helper function to safely render values
  const safeRender = (value, fallback = 'N/A') => {
    if (value === null || value === undefined) return fallback
    if (typeof value === 'object') {
      // If it's an object, try to extract meaningful value or convert to string
      if (value.toString && value.toString !== Object.prototype.toString) {
        return value.toString()
      }
      return JSON.stringify(value)
    }
    return String(value)
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

  // Extract the actual decision and values, handling the correct API structure
  // Based on backend API: { ocr_results: {...}, llm_results: {...}, decision: {...} }
  
  const decisionData = results.decision || {}
  const certificateData = results.certificate || {}
  const apiStudentData = results.student || {}
  const llmData = results.llm_results || {}

  // New: fallback helpers from llm_results
  const llmEval = llmData?.evaluation_results?.results || {}
  const llmExtract = llmData?.extraction_results?.results || {}

  // Extract values with fallback to LLM outputs when decisionData misses fields
  const decision = (decisionData.ai_decision 
    || llmEval.decision 
    || 'UNKNOWN')

  const credits = (typeof decisionData.credits_awarded === 'number' ? decisionData.credits_awarded
    : (typeof llmEval.credits_qualified === 'number' ? llmEval.credits_qualified
      : (typeof llmEval.credits_calculated === 'number' ? llmEval.credits_calculated : 0)))

  const trainingHours = (typeof decisionData.total_working_hours === 'number' ? decisionData.total_working_hours
    : (typeof llmEval.total_working_hours === 'number' ? llmEval.total_working_hours
      : (typeof llmEval.training_hours === 'number' ? llmEval.training_hours : 0)))

  const degreeRelevance = (decisionData.degree_relevance
    || llmEval.degree_relevance
    || 'Not specified')

  const supportingEvidence = (decisionData.supporting_evidence
    || llmEval.supporting_evidence
    || 'No supporting evidence available.')

  const challengingEvidence = (decisionData.challenging_evidence
    || llmEval.challenging_evidence
    || 'No challenging evidence available.')

  const justification = (decisionData.ai_justification
    || llmEval.justification
    || 'No justification available.')
  
  // Get document filename from form data (original file) or API response
  const filename = formData?.document?.name || 
                   certificateData.filename || 
                   results.filename || 
                   'Document'
  
  // Get training type from form data (user selection) or API response
  let requestedTrainingType = formData?.trainingType || 
                             certificateData.training_type || 
                             results.requested_training_type || 
                             llmEval.requested_training_type ||
                             'Not specified'
  
  // Format training type for better display
  if (requestedTrainingType && requestedTrainingType !== 'Not specified') {
    requestedTrainingType = requestedTrainingType
      .split(/[_-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }
  
  // Get student degree from studentData prop or API response
  const studentDegree = studentData?.degree || 
                       apiStudentData.degree || 
                       results.student_degree || 
                       'Not specified'

  // Additional logging for extracted values
  console.log('Extracted values:', {
    decision, credits, filename, studentDegree, trainingHours, 
    requestedTrainingType, degreeRelevance, supportingEvidence, 
    challengingEvidence, justification
  })
  
  console.log('Source data:', {
    formData, studentData, decisionData, certificateData, llmEval
  })

  // Ensure decision is a string, not an object
  const displayDecision = typeof decision === 'string' ? decision : 'UNKNOWN'
  const displayCredits = typeof credits === 'number' ? credits : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Step Indicator */}
        <StepIndicator currentStep={3} />
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Processing Complete!</h1>
          <p className="text-gray-600">Your work certificate has been successfully analyzed</p>
        </div>

        {/* Decision Box */}
        <div className={`rounded-lg border p-6 mb-6 ${getDecisionBg(displayDecision)}`}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">AI DECISION</h2>
            <div className="flex items-center justify-center space-x-4">
              <span className={`px-8 py-3 rounded-full text-xl font-bold ${getDecisionColor(displayDecision)}`}>
                {displayDecision}
              </span>
            </div>
          </div>
        </div>

        {/* Document Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-gray-600 text-sm mb-1">Document</div>
            <div className="font-semibold text-gray-800">{safeRender(filename)}</div>
          </div>
          <div className="card text-center">
            <div className="text-gray-600 text-sm mb-1">Degree</div>
            <div className="font-semibold text-gray-800">{safeRender(studentDegree)}</div>
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
                  {trainingHours && typeof trainingHours === 'number' ? trainingHours.toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Requested Training Type</p>
                <p className="text-xl font-bold text-gray-800">{safeRender(requestedTrainingType)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Credits Calculated</p>
                <p className="text-xl font-bold text-gray-800">{displayCredits} ECTS</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Degree Relevance</p>
                <p className="text-xl font-bold text-gray-800 capitalize">{safeRender(degreeRelevance)}</p>
              </div>
            </div>
            
            {/* Right Column - Evidence Boxes */}
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Supporting Evidence</h4>
                <p className="text-green-700 text-sm">
                  {safeRender(supportingEvidence)}
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Challenging Evidence</h4>
                <p className="text-yellow-700 text-sm">
                  {safeRender(challengingEvidence)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Justification Section */}
          <div className="mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Justification</h4>
              <p className="text-blue-700 text-sm leading-relaxed">
                {safeRender(justification)}
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
          {displayDecision === 'ACCEPTED' && (
            <button
              onClick={onSendForApproval}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Send for Approval
            </button>
          )}
          {displayDecision === 'REJECTED' && (
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