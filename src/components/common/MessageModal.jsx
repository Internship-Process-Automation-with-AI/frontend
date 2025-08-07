import { CheckCircleIcon, XCircleIcon } from './Icons.jsx'

const MessageModal = ({ isOpen, onClose, type = 'success', title, message }) => {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-12 h-12 text-green-500" />
      case 'error':
        return <XCircleIcon className="w-12 h-12 text-red-500" />
      default:
        return null
    }
  }

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          button: 'bg-green-500 hover:bg-green-600'
        }
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          button: 'bg-red-500 hover:bg-red-600'
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          button: 'bg-gray-500 hover:bg-gray-600'
        }
    }
  }

  const colors = getColors()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`relative w-full max-w-md p-8 rounded-lg shadow-xl ${colors.bg} ${colors.border} border`}>
        <div className="flex flex-col items-center text-center">
          {getIcon()}
          <h3 className="mt-4 text-xl font-semibold text-gray-900">
            {title}
          </h3>
          <p className="mt-2 text-gray-600">
            {message}
          </p>
          <button
            onClick={onClose}
            className={`mt-6 px-6 py-2 text-white rounded-lg font-medium ${colors.button} transition-colors duration-200`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

export default MessageModal 