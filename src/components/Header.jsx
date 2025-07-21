import { GraduationCapIcon } from './Icons.jsx'

const Header = ({ studentData, onLogout }) => {
  return (
    <header className="bg-gradient-to-r from-oamk-orange-600 to-oamk-orange-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center">
            <div className="bg-white rounded-full p-1.5 mr-3 shadow-md">
              <GraduationCapIcon className="w-6 h-6 text-oamk-orange-500" />
            </div>
            <span className="text-white text-xl font-bold">OAMK</span>
          </div>
          {studentData && (
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                <span className="text-white text-sm font-medium">
                  {studentData.first_name} {studentData.last_name}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header 