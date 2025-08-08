import { useState } from 'react'
import { SearchIcon } from '../common/Icons.jsx'

const ApplicationSearch = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearch(value)
  }

  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SearchIcon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-oamk-orange-500 focus:border-transparent sm:text-sm"
        placeholder="Search by student name or email..."
        value={searchTerm}
        onChange={handleSearch}
      />
    </div>
  )
}

export default ApplicationSearch 