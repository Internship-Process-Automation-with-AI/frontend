import { UploadIcon, FileTextIcon, XIcon, RefreshCwIcon } from '../common/Icons.jsx'
import Header from '../common/Header.jsx'
import StepIndicator from './StepIndicator.jsx'
import React from 'react'

const UploadCertificate = ({ 
  formData, 
  fileInputRef, 
  onFileSelect, 
  onInputChange, 
  onBackToDashboard, 
  onContinueProcessing 
}) => {
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