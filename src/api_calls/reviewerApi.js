/**
 * Reviewer API Functions
 *
 * Functions for making API calls related to reviewer operations.
 */

import {
  API_ENDPOINTS,
  buildUrl,
  DEFAULT_HEADERS,
  REQUEST_TIMEOUT,
  ERROR_MESSAGES
} from './config.js'

/**
 * Lookup reviewer by email address
 *
 * @param {string} email - Reviewer's email address
 * @returns {Promise<Object>} Reviewer information
 * @throws {Error} If request fails
 */
export async function getReviewerByEmail (email) {
  try {
    const response = await fetch(
      buildUrl(API_ENDPOINTS.REVIEWER_LOOKUP(email)),
      {
        method: 'GET',
        headers: DEFAULT_HEADERS,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT)
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Reviewer not found')
      } else if (response.status === 400) {
        throw new Error('Invalid email format')
      } else {
        throw new Error(
          `HTTP ${response.status}: ${ERROR_MESSAGES.SERVER_ERROR}`
        )
      }
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch reviewer')
    }

    return data.reviewer
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
 * Get all certificates assigned to a specific reviewer
 *
 * @param {string} reviewerId - Reviewer's UUID
 * @returns {Promise<Array>} List of applications assigned to the reviewer
 * @throws {Error} If request fails
 */
export async function getReviewerCertificates (reviewerId) {
  try {
    const response = await fetch(
      buildUrl(API_ENDPOINTS.REVIEWER_CERTIFICATES(reviewerId)),
      {
        method: 'GET',
        headers: DEFAULT_HEADERS,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT)
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Reviewer not found')
      } else if (response.status === 400) {
        throw new Error('Invalid reviewer ID')
      } else {
        throw new Error(
          `HTTP ${response.status}: ${ERROR_MESSAGES.SERVER_ERROR}`
        )
      }
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch reviewer certificates')
    }

    return data.applications || []
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
 * Download a certificate file
 *
 * @param {string} certificateId - Certificate's UUID
 * @returns {Promise<Blob>} Certificate file as blob
 * @throws {Error} If request fails
 */
export async function downloadCertificate (certificateId) {
  try {
    const response = await fetch(
      buildUrl(API_ENDPOINTS.DOWNLOAD_CERTIFICATE(certificateId)),
      {
        method: 'GET',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT)
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Certificate file not found')
      } else {
        throw new Error(
          `HTTP ${response.status}: ${ERROR_MESSAGES.SERVER_ERROR}`
        )
      }
    }

    // Return the blob for file download
    return await response.blob()
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
 * Submit reviewer decision for a certificate
 *
 * @param {string} certificateId - Certificate's UUID
 * @param {Object} reviewData - Review data
 * @param {string} reviewData.reviewer_comment - Reviewer's comments
 * @param {string} reviewData.reviewer_decision - Decision: "PASS" or "FAIL"
 * @returns {Promise<Object>} Review submission result
 * @throws {Error} If request fails
 */
export async function submitCertificateReview (certificateId, reviewData) {
  try {
    // Validate input
    if (!reviewData.reviewer_comment || !reviewData.reviewer_decision) {
      throw new Error('Both reviewer comment and decision are required')
    }

    if (
      !['PASS', 'FAIL'].includes(reviewData.reviewer_decision.toUpperCase())
    ) {
      throw new Error('Reviewer decision must be either "PASS" or "FAIL"')
    }

    const payload = {
      reviewer_comment: reviewData.reviewer_comment,
      reviewer_decision: reviewData.reviewer_decision.toUpperCase()
    }

    const response = await fetch(
      buildUrl(API_ENDPOINTS.CERTIFICATE_REVIEW(certificateId)),
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
      throw new Error(data.message || 'Failed to submit review')
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
