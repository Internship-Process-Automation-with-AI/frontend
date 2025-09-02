/**
 * Student API Functions
 *
 * Functions for making API calls related to student operations.
 */

import {
  API_ENDPOINTS,
  buildUrl,
  DEFAULT_HEADERS,
  REQUEST_TIMEOUT,
  ERROR_MESSAGES
} from './config.js'

/**
 * Request interceptor for tracking API calls
 */
class RequestInterceptor {
  constructor () {
    this.subscribers = []
    this.activeRequests = []
  }

  subscribe (callback) {
    this.subscribers.push(callback)
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback)
    }
  }

  notifySubscribers () {
    this.subscribers.forEach(callback => callback([...this.activeRequests]))
  }

  addRequest (request) {
    this.activeRequests.push(request)
    this.notifySubscribers()
  }

  updateRequest (requestId, updates) {
    const index = this.activeRequests.findIndex(req => req.id === requestId)
    if (index !== -1) {
      this.activeRequests[index] = { ...this.activeRequests[index], ...updates }
      this.notifySubscribers()
    }
  }

  removeRequest (requestId) {
    this.activeRequests = this.activeRequests.filter(
      req => req.id !== requestId
    )
    this.notifySubscribers()
  }

  generateRequestId () {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}

// Create singleton instance
const requestInterceptor = new RequestInterceptor()

/**
 * Verify student by email address
 *
 * @param {string} email - Student's email address
 * @returns {Promise<Object>} Student information
 * @throws {Error} If request fails
 */
export async function verifyStudent (email) {
  try {
    const response = await fetch(
      buildUrl(API_ENDPOINTS.STUDENT_LOOKUP(email)),
      {
        method: 'GET',
        headers: DEFAULT_HEADERS,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT)
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Student not found')
      } else if (response.status === 400) {
        throw new Error('Invalid email format')
      } else {
        throw new Error(
          `HTTP ${response.status}: ${ERROR_MESSAGES.SERVER_ERROR}`
        )
      }
    }

    const data = await response.json()

    // Backend returns student data directly, not wrapped in success/student fields
    return data
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR)
    } else if (error.name === 'TypeError') {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR)
    }
    throw error
  }
}

/**
 * Get all applications for a student
 *
 * @param {string} email - Student's email address
 * @returns {Promise<Array>} List of student applications
 * @throws {Error} If request fails
 */
export async function getStudentApplications (email) {
  const requestId = requestInterceptor.generateRequestId()
  const request = {
    id: requestId,
    type: 'fetch_applications',
    progress: 0,
    startTime: Date.now()
  }

  requestInterceptor.addRequest(request)

  try {
    requestInterceptor.updateRequest(requestId, { progress: 25 })
    const response = await fetch(
      buildUrl(`/student/${encodeURIComponent(email)}/applications`),
      {
        method: 'GET',
        headers: DEFAULT_HEADERS,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT)
      }
    )

    requestInterceptor.updateRequest(requestId, { progress: 75 })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Student not found')
      } else if (response.status === 400) {
        throw new Error('Invalid email format')
      } else {
        throw new Error(
          `HTTP ${response.status}: ${ERROR_MESSAGES.SERVER_ERROR}`
        )
      }
    }

    const data = await response.json()
    requestInterceptor.updateRequest(requestId, { progress: 100 })
    requestInterceptor.removeRequest(requestId)

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch applications')
    }

    return data.applications || []
  } catch (error) {
    requestInterceptor.removeRequest(requestId)
    if (error.name === 'TimeoutError') {
      throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR)
    } else if (error.name === 'TypeError') {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR)
    }
    throw error
  }
}

/**
 * Upload a certificate file for a student
 *
 * @param {string} studentId - Student's UUID
 * @param {File} file - Certificate file to upload
 * @param {string} trainingType - Type of training (GENERAL/PROFESSIONAL)
 * @returns {Promise<Object>} Upload result
 * @throws {Error} If request fails
 */
export async function uploadCertificate (studentId, file, trainingType, workType = 'REGULAR', additionalDocuments = []) {
  const requestId = requestInterceptor.generateRequestId()
  const request = {
    id: requestId,
    type: 'upload_certificate',
    progress: 0,
    startTime: Date.now(),
    fileName: file.name,
    fileSize: file.size
  }

  requestInterceptor.addRequest(request)

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('training_type', trainingType)
    formData.append('work_type', workType)
    
    // Add additional documents for self-paced work
    if (workType === 'SELF_PACED' && additionalDocuments && additionalDocuments.length > 0) {
      additionalDocuments.forEach(doc => {
        formData.append('additional_documents', doc)
      })
    }

    requestInterceptor.updateRequest(requestId, { progress: 25 })

    const response = await fetch(
      buildUrl(API_ENDPOINTS.UPLOAD_CERTIFICATE(studentId)),
      {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT)
      }
    )

    requestInterceptor.updateRequest(requestId, { progress: 75 })

    if (!response.ok) {
      if (response.status === 400) {
        const errorData = await response.json()
        throw new Error(errorData.detail || ERROR_MESSAGES.VALIDATION_ERROR)
      } else {
        throw new Error(
          `HTTP ${response.status}: ${ERROR_MESSAGES.SERVER_ERROR}`
        )
      }
    }

    const result = await response.json()
    requestInterceptor.updateRequest(requestId, { progress: 100 })
    requestInterceptor.removeRequest(requestId)

    if (!result.success) {
      throw new Error(result.message || 'Failed to upload certificate')
    }

    return result
  } catch (error) {
    requestInterceptor.removeRequest(requestId)
    if (error.name === 'TimeoutError') {
      throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR)
    } else if (error.name === 'TypeError') {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR)
    }
    throw error
  }
}

/**
 * Process a certificate using AI
 *
 * @param {string} certificateId - Certificate's UUID
 * @returns {Promise<Object>} Processing result
 * @throws {Error} If request fails
 */
export async function processCertificate (certificateId) {
  const requestId = requestInterceptor.generateRequestId()
  const request = {
    id: requestId,
    type: 'process_certificate',
    progress: 0,
    startTime: Date.now()
  }

  requestInterceptor.addRequest(request)

  try {
    requestInterceptor.updateRequest(requestId, { progress: 25 })
    const response = await fetch(
      buildUrl(API_ENDPOINTS.PROCESS_CERTIFICATE(certificateId)),
      {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT)
      }
    )

    requestInterceptor.updateRequest(requestId, { progress: 75 })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Certificate not found')
      } else if (response.status === 400) {
        const errorData = await response.json()
        throw new Error(errorData.detail || ERROR_MESSAGES.VALIDATION_ERROR)
      } else {
        throw new Error(
          `HTTP ${response.status}: ${ERROR_MESSAGES.SERVER_ERROR}`
        )
      }
    }

    const result = await response.json()
    requestInterceptor.updateRequest(requestId, { progress: 100 })
    requestInterceptor.removeRequest(requestId)

    if (!result.success) {
      throw new Error(result.message || 'Failed to process certificate')
    }

    return result
  } catch (error) {
    requestInterceptor.removeRequest(requestId)
    if (error.name === 'TimeoutError') {
      throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR)
    } else if (error.name === 'TypeError') {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR)
    }
    throw error
  }
}

/**
 * Download a certificate file
 *
 * @param {string} certificateId - Certificate's UUID
 * @returns {Promise<Blob>} Certificate file as blob
 * @throws {Error} If request fails
 */
export async function downloadCertificate (certificateId) {
  const requestId = requestInterceptor.generateRequestId()
  const request = {
    id: requestId,
    type: 'download_certificate',
    progress: 0,
    startTime: Date.now()
  }

  requestInterceptor.addRequest(request)

  try {
    requestInterceptor.updateRequest(requestId, { progress: 25 })
    const response = await fetch(
      buildUrl(API_ENDPOINTS.DOWNLOAD_CERTIFICATE(certificateId)),
      {
        method: 'GET',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT)
      }
    )

    requestInterceptor.updateRequest(requestId, { progress: 75 })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Certificate file not found')
      } else {
        throw new Error(
          `HTTP ${response.status}: ${ERROR_MESSAGES.SERVER_ERROR}`
        )
      }
    }

    const blob = await response.blob()
    requestInterceptor.updateRequest(requestId, { progress: 100 })
    requestInterceptor.removeRequest(requestId)

    return blob
  } catch (error) {
    requestInterceptor.removeRequest(requestId)
    if (error.name === 'TimeoutError') {
      throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR)
    } else if (error.name === 'TypeError') {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR)
    }
    throw error
  }
}

/**
 * Helper function to trigger file download from blob
 *
 * @param {Blob} blob - File blob
 * @param {string} filename - Suggested filename
 */
export function triggerFileDownload (blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || 'certificate'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Download certificate and trigger browser download
 *
 * @param {string} certificateId - Certificate's UUID
 * @param {string} filename - Optional filename override
 * @returns {Promise<void>}
 * @throws {Error} If download fails
 */
export async function downloadAndSaveCertificate (certificateId, filename) {
  try {
    const blob = await downloadCertificate(certificateId)
    triggerFileDownload(blob, filename)
  } catch (error) {
    throw new Error(`Failed to download certificate: ${error.message}`)
  }
}

/**
 * Preview certificate file
 *
 * @param {string} certificateId - Certificate's UUID
 * @returns {Promise<string>} Preview URL
 * @throws {Error} If request fails
 */
export async function previewCertificate (certificateId) {
  const requestId = requestInterceptor.generateRequestId()
  const request = {
    id: requestId,
    type: 'preview_certificate',
    progress: 0,
    startTime: Date.now()
  }

  requestInterceptor.addRequest(request)

  try {
    requestInterceptor.updateRequest(requestId, { progress: 25 })

    // For preview, we'll return the direct URL instead of fetching the blob
    // This allows the iframe to load the content directly
    const previewUrl = buildUrl(`/certificate/${certificateId}/preview`)

    requestInterceptor.updateRequest(requestId, { progress: 100 })
    requestInterceptor.removeRequest(requestId)

    return previewUrl
  } catch (error) {
    requestInterceptor.removeRequest(requestId)
    console.error('Error previewing certificate:', error)
    throw error
  }
}

/**
 * Add student feedback to a certificate decision
 *
 * @param {string} certificateId - Certificate's UUID
 * @param {string} feedback - Student's feedback
 * @param {string} reviewerId - Optional reviewer ID
 * @returns {Promise<Object>} Result
 * @throws {Error} If request fails
 */
export async function addFeedback (certificateId, feedback, reviewerId = null) {
  try {
    const payload = { student_feedback: feedback }
    if (reviewerId) {
      payload.reviewer_id = reviewerId
    }

    const response = await fetch(
      buildUrl(API_ENDPOINTS.CERTIFICATE_FEEDBACK(certificateId)),
      {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT)
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Certificate not found')
      } else if (response.status === 400) {
        const errorData = await response.json()
        throw new Error(errorData.detail || ERROR_MESSAGES.VALIDATION_ERROR)
      } else {
        throw new Error(
          `HTTP ${response.status}: ${ERROR_MESSAGES.SERVER_ERROR}`
        )
      }
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || 'Failed to add feedback')
    }

    return data
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR)
    } else if (error.name === 'TypeError') {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR)
    }
    throw error
  }
}

/**
 * Delete a certificate application
 *
 * @param {string} certificateId - Certificate's UUID
 * @returns {Promise<boolean>} True if deletion successful
 * @throws {Error} If request fails
 */
export async function deleteApplication (certificateId) {
  try {
    console.log('API: deleteApplication called with ID:', certificateId)
    
    const response = await fetch(buildUrl(`/certificate/${certificateId}`), {
      method: 'DELETE',
      headers: DEFAULT_HEADERS,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    })

    console.log('API: deleteApplication response status:', response.status)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Certificate not found')
      } else {
        throw new Error(
          `HTTP ${response.status}: ${ERROR_MESSAGES.SERVER_ERROR}`
        )
      }
    }

    // Try to parse the response, but handle cases where there might be no body
    let data = null
    try {
      const responseText = await response.text()
      if (responseText) {
        data = JSON.parse(responseText)
      }
    } catch (parseError) {
      console.log('API: No response body or invalid JSON, treating as successful')
      // If there's no response body or invalid JSON, treat as successful
      return true
    }

    console.log('API: deleteApplication response data:', data)

    // Check if deletion was successful
    if (data && data.success === false) {
      throw new Error(data.message || 'Failed to delete application')
    }

    // If we reach here, consider it successful
    return true
  } catch (error) {
    console.error('API: deleteApplication error:', error)
    if (error.name === 'TimeoutError') {
      throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR)
    } else if (error.name === 'TypeError') {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR)
    }
    throw error
  }
}

/**
 * Send certificate for reviewer approval
 *
 * @param {string} certificateId - Certificate's UUID
 * @param {string} reviewerId - Reviewer's UUID
 * @returns {Promise<Object>} Result
 * @throws {Error} If request fails
 */
export async function sendForApproval (certificateId, reviewerId) {
  const requestId = requestInterceptor.generateRequestId()
  const request = {
    id: requestId,
    type: 'send_for_approval',
    progress: 0,
    startTime: Date.now()
  }

  requestInterceptor.addRequest(request)

  try {
    requestInterceptor.updateRequest(requestId, { progress: 25 })
    const response = await fetch(
      buildUrl(`/certificate/${certificateId}/send-for-approval`),
      {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({
          reviewer_id: reviewerId
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT)
      }
    )

    requestInterceptor.updateRequest(requestId, { progress: 75 })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Certificate not found')
      } else if (response.status === 400) {
        const errorData = await response.json()
        throw new Error(errorData.detail || ERROR_MESSAGES.VALIDATION_ERROR)
      } else {
        throw new Error(
          `HTTP ${response.status}: ${ERROR_MESSAGES.SERVER_ERROR}`
        )
      }
    }

    const result = await response.json()
    requestInterceptor.updateRequest(requestId, { progress: 100 })
    requestInterceptor.removeRequest(requestId)

    if (!result.success) {
      throw new Error(result.message || 'Failed to send for approval')
    }

    return result
  } catch (error) {
    requestInterceptor.removeRequest(requestId)
    if (error.name === 'TimeoutError') {
      throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR)
    } else if (error.name === 'TypeError') {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR)
    }
    throw error
  }
}

/**
 * Submit an appeal for a certificate decision
 *
 * @param {string} certificateId - Certificate's UUID
 * @param {string} appealReason - Reason for the appeal
 * @param {string} reviewerId - Optional reviewer ID to assign appeal to
 * @returns {Promise<Object>} Result
 * @throws {Error} If request fails
 */
export async function submitAppeal (
  certificateId,
  appealReason,
  reviewerId = null
) {
  const requestId = requestInterceptor.generateRequestId()
  const request = {
    id: requestId,
    type: 'submit_appeal',
    progress: 0,
    startTime: Date.now()
  }

  requestInterceptor.addRequest(request)

  try {
    requestInterceptor.updateRequest(requestId, { progress: 25 })

    const payload = { appeal_reason: appealReason }
    if (reviewerId) {
      payload.reviewer_id = reviewerId
    }

    const response = await fetch(
      buildUrl(`/certificate/${certificateId}/appeal`),
      {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT)
      }
    )

    requestInterceptor.updateRequest(requestId, { progress: 75 })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Certificate not found')
      } else if (response.status === 400) {
        const errorData = await response.json()
        throw new Error(errorData.detail || ERROR_MESSAGES.VALIDATION_ERROR)
      } else {
        throw new Error(
          `HTTP ${response.status}: ${ERROR_MESSAGES.SERVER_ERROR}`
        )
      }
    }

    const result = await response.json()
    requestInterceptor.updateRequest(requestId, { progress: 100 })
    requestInterceptor.removeRequest(requestId)

    if (!result.success) {
      throw new Error(result.message || 'Failed to submit appeal')
    }

    return result
  } catch (error) {
    requestInterceptor.removeRequest(requestId)
    if (error.name === 'TimeoutError') {
      throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR)
    } else if (error.name === 'TypeError') {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR)
    }
    throw error
  }
}

/**
 * Get list of available reviewers
 *
 * @returns {Promise<Array>} List of reviewers
 * @throws {Error} If request fails
 */
export async function getReviewers () {
  const requestId = requestInterceptor.generateRequestId()
  const request = {
    id: requestId,
    type: 'fetch_reviewers',
    progress: 0,
    startTime: Date.now()
  }

  requestInterceptor.addRequest(request)

  try {
    requestInterceptor.updateRequest(requestId, { progress: 25 })
    const response = await fetch(buildUrl(API_ENDPOINTS.REVIEWERS_LIST), {
      method: 'GET',
      headers: DEFAULT_HEADERS,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    })

    requestInterceptor.updateRequest(requestId, { progress: 75 })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${ERROR_MESSAGES.SERVER_ERROR}`)
    }

    const data = await response.json()
    requestInterceptor.updateRequest(requestId, { progress: 100 })
    requestInterceptor.removeRequest(requestId)

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch reviewers')
    }

    return data.reviewers || []
  } catch (error) {
    requestInterceptor.removeRequest(requestId)
    if (error.name === 'TimeoutError') {
      throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR)
    } else if (error.name === 'TypeError') {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR)
    }
    throw error
  }
}

// Export the request interceptor for use by components
export { requestInterceptor }
