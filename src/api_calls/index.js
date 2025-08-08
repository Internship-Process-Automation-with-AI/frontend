/**
 * API Calls Index
 *
 * Central export point for all API functions.
 */

// Export configuration
export * from './config.js'

// Export student API functions
export {
  verifyStudent,
  getStudentApplications,
  uploadCertificate,
  processCertificate,
  downloadCertificate as downloadCertificateStudent,
  triggerFileDownload as triggerFileDownloadStudent,
  downloadAndSaveCertificate as downloadAndSaveCertificateStudent,
  previewCertificate,
  addFeedback,
  deleteApplication,
  sendForApproval,
  submitAppeal,
  getReviewers as getReviewersStudent,
  requestInterceptor as studentRequestInterceptor
} from './studentAPI.js'

// Export reviewer API functions
export {
  getReviewerByEmail,
  getReviewerCertificates,
  getCertificateDetails,
  downloadCertificate as downloadCertificateReviewer,
  submitCertificateReview,
  submitAppealReview,
  triggerFileDownload as triggerFileDownloadReviewer,
  downloadAndSaveCertificate as downloadAndSaveCertificateReviewer
} from './reviewerApi.js'

// Re-export for convenience
export { API_ENDPOINTS, buildUrl, ERROR_MESSAGES } from './config.js'
