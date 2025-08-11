import React from 'react'
import { XIcon } from './Icons.jsx'

const PreviewModal = ({ isOpen, onClose, previewUrl, filename }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-800">
            Document Preview: {filename}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {previewUrl && (
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title="Document Preview"
              onError={() => {
                console.error('Preview failed to load')
                onClose()
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default PreviewModal 