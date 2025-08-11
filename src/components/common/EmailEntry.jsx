import { MailIcon, AlertCircleIcon, LoaderIcon } from './Icons.jsx'

const EmailEntry = ({ 
  studentEmail, 
  setStudentEmail, 
  error, 
  isProcessing, 
  onEmailSubmit, 
  onLogout,
  title = 'Student Portal',
  description = 'Access your training credit applications',
  label = 'Enter your student email',
  placeholder = 'firstname.lastname@students.oamk.fi'
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
          {label}
        </label>
        <div className="relative">
          <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="email"
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value)}
            placeholder={placeholder}
            className="input-field pl-10 h-12"
            onKeyPress={(e) => e.key === 'Enter' && onEmailSubmit()}
          />
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-3">
          <div className="flex">
            <AlertCircleIcon className="w-4 h-4 text-red-400 mr-2 mt-0.5" />
            <span className="text-red-800 text-sm font-medium">{error}</span>
          </div>
        </div>
      )}
      
      <button
        onClick={onEmailSubmit}
        disabled={isProcessing}
        className="btn-primary w-full h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
      >
        {isProcessing ? (
          <>
            <LoaderIcon className="w-5 h-5 mr-2" />
            Verifying...
          </>
        ) : (
          'Continue'
        )}
      </button>
    </div>
  )
}

export default EmailEntry 