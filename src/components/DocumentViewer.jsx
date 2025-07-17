import { useState, useEffect } from 'react';

const DocumentViewer = ({ filename, date }) => {
  const [documentFiles, setDocumentFiles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);

  useEffect(() => {
    if (filename) {
      loadDocumentFiles();
    }
  }, [filename, date]);

  const loadDocumentFiles = async () => {
    setLoading(true);
    try {
      const url = `http://localhost:8000/api/files/document/${encodeURIComponent(filename)}${date ? `?date=${date}` : ''}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setDocumentFiles(data);
      }
    } catch (error) {
      console.error('Failed to load document files:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewFileContent = async (filePath) => {
    try {
      // For now, we'll just show the file path since we can't directly read files
      // In a real implementation, you'd have an endpoint to read file contents
      setSelectedFile(filePath);
      setFileContent(`File content for: ${filePath}\n\nThis would show the actual file content in a real implementation.`);
    } catch (error) {
      console.error('Failed to load file content:', error);
      setFileContent('Error loading file content');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-oamk-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document files...</p>
        </div>
      </div>
    );
  }

  if (!documentFiles) {
    return (
      <div className="card">
        <div className="text-center py-8 text-gray-500">
          No document files found
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Document Header */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📄 Document: {filename}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Date:</span> {documentFiles.date}
          </div>
          <div>
            <span className="font-medium text-gray-600">Folder:</span> 
            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded ml-2">
              {documentFiles.files.folder.path}
            </span>
          </div>
        </div>
      </div>

      {/* Files List */}
      <div className="card">
        <h4 className="text-md font-semibold text-gray-800 mb-4">📁 Related Files</h4>
        <div className="space-y-3">
          {Object.entries(documentFiles.files).map(([key, file]) => {
            if (key === 'folder') return null;
            
            return (
              <div key={key} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      file.exists ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <h5 className="font-medium text-gray-800 capitalize">
                      {key.replace('_', ' ')}
                    </h5>
                  </div>
                  <div className="text-sm text-gray-500">
                    {file.exists ? formatFileSize(file.size) : 'Missing'}
                  </div>
                </div>
                
                <div className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded mb-3">
                  {file.path}
                </div>
                
                {file.exists && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewFileContent(file.path)}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded"
                    >
                      View Content
                    </button>
                    <button
                      onClick={() => window.open(`file://${file.path}`, '_blank')}
                      className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded"
                    >
                      Open in System
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* File Content Viewer */}
      {selectedFile && fileContent && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-800">
              📄 File Content: {selectedFile.split('/').pop()}
            </h4>
            <button
              onClick={() => {
                setSelectedFile(null);
                setFileContent(null);
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ✕ Close
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {fileContent}
            </pre>
          </div>
        </div>
      )}

      {/* File Organization Info */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">📂 File Organization</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <p>• <strong>Original:</strong> The uploaded work certificate file</p>
          <p>• <strong>Results JSON:</strong> Complete processing results (OCR + LLM analysis)</p>
          <p>• <strong>OCR Text:</strong> Extracted text from the document for easy reading</p>
          <p>• <strong>All files</strong> are stored in the same date-based folder for easy tracing</p>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer; 