import { ClockIcon, CheckCircleIcon, AlertCircleIcon, DownloadIcon } from './Icons.jsx'
import Header from './Header.jsx'

const Applications = ({ applications, onBackToDashboard }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'REJECTED':
        return <AlertCircleIcon className="w-5 h-5 text-red-500" />
      case 'PENDING':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'text-green-600 bg-green-50'
      case 'REJECTED': return 'text-red-600 bg-red-50'
      case 'PENDING': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <div className="max-w-6xl mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Applications</h1>
          <button
            onClick={onBackToDashboard}
            className="btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>
        
        {applications.length === 0 ? (
          <div className="card text-center py-12">
            <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Applications Yet</h3>
            <p className="text-gray-600 mb-6">You haven't submitted any applications for training credits yet.</p>
            <button
              onClick={onBackToDashboard}
              className="btn-primary"
            >
              Apply for Training Credits
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app, index) => (
              <div key={index} className="card hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(app.status)}
                    <div>
                      <h3 className="font-semibold text-gray-800">{app.training_type}</h3>
                      <p className="text-sm text-gray-600">
                        Submitted on {new Date(app.submitted_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                    
                    {app.status === 'ACCEPTED' && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Credits Awarded</p>
                        <p className="font-semibold text-green-600">{app.credits} ECTS</p>
                      </div>
                    )}
                    
                    {app.status === 'ACCEPTED' && (
                      <button className="btn-primary flex items-center">
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Download
                      </button>
                    )}
                  </div>
                </div>
                
                {app.status === 'PENDING' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Processing time: Usually 2-3 business days</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">Processing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Applications 