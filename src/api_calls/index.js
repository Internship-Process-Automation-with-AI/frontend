/**
 * API Calls Index
 *
 * Central export point for all API functions.
 */

// Export configuration
export * from './config.js'

// Export reviewer API functions
export {
  getReviewerByEmail,
  getReviewerCertificates,
  downloadCertificate,
  submitCertificateReview,
  triggerFileDownload,
  downloadAndSaveCertificate
} from './reviewerApi.js'

// Re-export for convenience
export { API_ENDPOINTS, buildUrl, ERROR_MESSAGES } from './config.js'
