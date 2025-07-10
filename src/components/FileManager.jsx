import { useState, useEffect } from 'react';
import apiService from '../api.js';
import DocumentViewer from './DocumentViewer.jsx';

const FileManager = () => {
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    loadFiles();
    loadStats();
  }, [selectedDate]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/files${selectedDate ? `?date=${selectedDate}` : ''}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/files/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleCleanup = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/files/cleanup', {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        alert(`Cleanup completed: ${data.message}`);
        loadStats(); // Refresh stats after cleanup
      }
    } catch (error) {
      console.error('Failed to cleanup:', error);
      alert('Cleanup failed');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📁 File Management</h2>
        
        {/* Storage Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-700 mb-1">Total Files</div>
              <div className="text-2xl font-bold text-blue-800">{stats.total_files}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm font-medium text-green-700 mb-1">Total Size</div>
              <div className="text-2xl font-bold text-green-800">{stats.total_size_mb} MB</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm font-medium text-purple-700 mb-1">Storage Path</div>
              <div className="text-xs text-purple-600 truncate">{stats.uploads_directory}</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-sm font-medium text-orange-700 mb-1">Actions</div>
              <button
                onClick={handleCleanup}
                className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 px-2 py-1 rounded"
              >
                Cleanup Temp
              </button>
            </div>
          </div>
        )}

        {/* Date Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Date (YYYY-MM-DD)
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field flex-1"
            />
            <button
              onClick={() => setSelectedDate('')}
              className="btn-secondary"
            >
              Clear Filter
            </button>
          </div>
        </div>

        {/* Files List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-700">
              Uploaded Files ({files.length})
            </h3>
            <button
              onClick={loadFiles}
              disabled={loading}
              className="btn-secondary text-sm"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {files.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {loading ? 'Loading files...' : 'No files found'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Filename
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modified
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {files.map((file, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        <div className="flex items-center">
                          <span>{file.filename}</span>
                          <button
                            onClick={() => setSelectedDocument({ filename: file.filename, date: selectedDate })}
                            className="ml-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
                          >
                            View Details
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(file.created)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(file.modified)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* File Organization Info */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">📂 File Organization</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>• Files are organized by date: <code>uploads/YYYY/MM/DD/original/</code></p>
            <p>• Processing results are saved in <code>uploads/YYYY/MM/DD/results/</code></p>
            <p>• Original filenames are preserved with timestamp prefixes</p>
            <p>• All related files (original + results) are in the same folder</p>
            <p>• Temporary files are stored in <code>uploads/temp/</code> and auto-cleaned</p>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Document Details</h3>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕ Close
                </button>
              </div>
              <DocumentViewer 
                filename={selectedDocument.filename} 
                date={selectedDocument.date} 
              />
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default FileManager; 