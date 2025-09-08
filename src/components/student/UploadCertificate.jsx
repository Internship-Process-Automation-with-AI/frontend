import { UploadIcon, FileTextIcon, XIcon, RefreshCwIcon } from '../common/Icons.jsx'
import Header from '../common/Header.jsx'
import StepIndicator from './StepIndicator.jsx'
import { useRef } from 'react'
import React from 'react'

const UploadCertificate = ({ 
  formData, 
  fileInputRef, 
  onFileSelect, 
  onInputChange, 
  onAdditionalDocsSelect,
  onBackToDashboard, 
  onContinueProcessing 
}) => {
  // Create a local ref for additional documents
  const localAdditionalDocsRef = useRef(null)

  const handleAdditionalDocsClick = () => {
    if (localAdditionalDocsRef?.current) {
      localAdditionalDocsRef.current.click()
    }
  }

  const [isDragOver, setIsDragOver] = React.useState(false)

  const handleReplaceFile = () => {
    fileInputRef.current?.click()
  }

  const handleDeleteFile = () => {
    onInputChange('document', null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleBackToDashboard = () => {
    try {
      if (typeof onBackToDashboard === 'function') {
        // Reset form data when going back
        onInputChange('document', null)
        onInputChange('trainingType', '')
        
        // Navigate back to dashboard
        onBackToDashboard('dashboard')
        console.log('Successfully called onBackToDashboard')
      } else {
        console.error('onBackToDashboard is not a function:', onBackToDashboard)
        // Fallback: try to navigate using window.location if function is not available
        alert('Function not available, trying alternative navigation')
        window.location.reload()
      }
    } catch (error) {
      console.error('Error in handleBackToDashboard:', error)
      alert('Error occurred: ' + error.message)
    }
  }

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set drag over to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'image/png',
        'image/jpeg',
        'image/jpg'
      ]
      
      if (allowedTypes.includes(file.type)) {
        // Create a synthetic event object similar to file input change event
        const syntheticEvent = {
          target: {
            files: [file]
          }
        }
        onFileSelect(syntheticEvent)
      } else {
        alert('Please select a valid file type: PDF, DOCX, DOC, PNG, JPG, or JPEG')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <div className="max-w-2xl mx-auto py-6 px-4">
        <StepIndicator currentStep={1} />
        
        <div className="card">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Work Certificate</h2>
            <p className="text-gray-600">Select your work certificate document for evaluation</p>
          </div>
          
          <div className="space-y-6">
            {/* File Upload Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Work Certificate Document
              </label>
              <div 
                className={`border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-oamk-orange-400 transition-colors duration-200 ${isDragOver ? 'border-oamk-orange-400 bg-oamk-orange-50' : ''}`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {!formData.document ? (
                  <div className="text-center">
                    <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    {isDragOver ? (
                      <>
                        <p className="text-oamk-orange-600 mb-2 font-semibold">Drop your file here!</p>
                        <p className="text-sm text-oamk-orange-500 mb-4">Release to upload your certificate</p>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-600 mb-2">Drag and drop your file here, or click to browse</p>
                        <p className="text-sm text-gray-500 mb-4">Supports PDF, DOCX, and image files</p>
                      </>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-primary"
                      disabled={isDragOver}
                    >
                      Select File
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileTextIcon className="w-8 h-8 text-oamk-orange-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-800">{formData.document.name}</p>
                        <p className="text-sm text-gray-500">
                          {(formData.document.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleReplaceFile}
                        className="p-2 text-gray-500 hover:text-oamk-orange-500 hover:bg-oamk-orange-50 rounded-full transition-colors duration-200"
                        title="Replace file"
                      >
                        <RefreshCwIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleDeleteFile}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
                        title="Delete file"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={onFileSelect}
                  accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
                  className="hidden"
                />
              </div>
            </div>
            
            {/* Training Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Training Type
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Select a training type for which you want credits for
              </p>
              <div className="space-y-3">
                <label className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-oamk-orange-300 cursor-pointer transition-colors duration-200">
                  <input
                    type="radio"
                    name="trainingType"
                    value="general"
                    checked={formData.trainingType === 'general'}
                    onChange={(e) => onInputChange('trainingType', e.target.value)}
                    className="mt-1 mr-3 text-oamk-orange-500 focus:ring-oamk-orange-500"
                  />
                  <div>
                    <div className="font-medium text-gray-800">General Training</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Broad-based training programs that enhance general knowledge and skills applicable across various fields. 
                      Examples include communication skills, time management, problem-solving, and personal development courses.
                    </div>
                  </div>
                </label>
                
                <label className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-oamk-orange-300 cursor-pointer transition-colors duration-200">
                  <input
                    type="radio"
                    name="trainingType"
                    value="professional"
                    checked={formData.trainingType === 'professional'}
                    onChange={(e) => onInputChange('trainingType', e.target.value)}
                    className="mt-1 mr-3 text-oamk-orange-500 focus:ring-oamk-orange-500"
                  />
                  <div>
                    <div className="font-medium text-gray-800">Professional Training</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Specialized training focused on specific professional skills, industry knowledge, or technical expertise. 
                      Examples include software development, project management, data analysis, and industry-specific certifications.
                    </div>
                  </div>
                </label>
              </div>
            </div>
            
            {/* Self-Paced Work Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Work Schedule
              </label>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-oamk-orange-300 cursor-pointer transition-colors duration-200">
                  <input
                    type="checkbox"
                    checked={formData.isSelfPaced || false}
                    onChange={(e) => onInputChange('isSelfPaced', e.target.checked)}
                    className="mr-3 text-oamk-orange-500 focus:ring-oamk-orange-500"
                  />
                  <div>
                    <div className="font-medium text-gray-800">Self-Paced Work</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Check this if your work was done on a flexible schedule or as a project-based assignment
                    </div>
                  </div>
                </label>
                
                {/* Additional Documents Upload - only show if self-paced is checked */}
                {formData.isSelfPaced && (
                  <div className="ml-6 mt-3">
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Additional Documentation
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Upload documents showing your working hours
                    </p>
                    
                    <div className="border border-dashed border-gray-200 rounded-md p-3 bg-gray-50 hover:border-gray-300 hover:bg-gray-100 transition-colors duration-200">
                      {!formData.additionalDocuments || formData.additionalDocuments.length === 0 ? (
                        <div className="text-center">
                          <UploadIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-500 mb-2">Click to upload files</p>
                          <button
                            onClick={() => localAdditionalDocsRef?.current?.click()}
                            className="px-3 py-1 text-xs bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
                          >
                            Select Files
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {formData.additionalDocuments.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between bg-white rounded border border-gray-200 p-2">
                              <div className="flex items-center">
                                <FileTextIcon className="w-4 h-4 text-gray-500 mr-2" />
                                <div>
                                  <p className="text-xs font-medium text-gray-700 truncate max-w-32">{doc.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {(doc.size / 1024 / 1024).toFixed(1)} MB
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => localAdditionalDocsRef?.current?.click()}
                                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors duration-200"
                                  title="Add more files"
                                >
                                  <RefreshCwIcon className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => {
                                    const newDocs = formData.additionalDocuments.filter((_, i) => i !== index)
                                    onInputChange('additionalDocuments', newDocs)
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors duration-200"
                                  title="Delete file"
                                >
                                  <XIcon className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                          
                          {/* Add more files button */}
                          <div className="pt-2 border-t border-gray-200">
                            <button
                              onClick={() => localAdditionalDocsRef?.current?.click()}
                              className="w-full px-2 py-1 text-xs bg-white border border-gray-300 text-gray-600 rounded hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
                            >
                              <UploadIcon className="w-3 h-3 mr-1 inline" />
                              Add More Files
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <input
                        ref={localAdditionalDocsRef}
                        type="file"
                        multiple
                        onChange={onAdditionalDocsSelect}
                        accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
                        className="hidden"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBackToDashboard}
              className="btn-secondary relative z-10 cursor-pointer"
              style={{ pointerEvents: 'auto' }}
            >
              Back to Dashboard
            </button>
            <button
              onClick={onContinueProcessing}
              disabled={!formData.document || !formData.trainingType}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue Processing
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadCertificate 