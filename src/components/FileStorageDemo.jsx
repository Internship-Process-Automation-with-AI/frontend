import { useState } from 'react';
import FileManager from './FileManager.jsx';

const FileStorageDemo = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">🗂️ File Storage System Demo</h2>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📋' },
              { id: 'files', label: 'File Manager', icon: '📁' },
              { id: 'structure', label: 'Directory Structure', icon: '📂' },
              { id: 'database', label: 'Database Integration', icon: '🗄️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-oamk-orange-500 text-oamk-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">🎉 New File Storage System</h3>
              <p className="text-blue-700 mb-4">
                Your uploaded files are now <strong>permanently saved</strong> in an organized directory structure!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">✅ What's New</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Files saved to <code>backend/uploads/</code></li>
                    <li>• Date-based organization (YYYY/MM/DD)</li>
                    <li>• Unique filenames with timestamps</li>
                    <li>• File management interface</li>
                    <li>• Storage statistics</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">🔄 File Journey</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>1. Upload → Browser memory</li>
                    <li>2. Send → Backend API</li>
                    <li>3. Save → Organized directory</li>
                    <li>4. Process → Temporary file</li>
                    <li>5. Results → processedData/</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">📄 Uploaded Files</h4>
                <p className="text-sm text-green-700">
                  Original work certificates saved with timestamps and organized by date.
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-2">📊 Processing Results</h4>
                <p className="text-sm text-purple-700">
                  OCR and LLM results saved in JSON format in processedData/ directory.
                </p>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-2">🗄️ Future Database</h4>
                <p className="text-sm text-orange-700">
                  File paths and metadata will be stored in database when implemented.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <FileManager />
        )}

        {activeTab === 'structure' && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📂 Directory Structure</h3>
              
              <div className="font-mono text-sm bg-white p-4 rounded border">
                <div className="text-gray-600">backend/</div>
                <div className="ml-4">
                  <div className="text-blue-600">├── uploads/</div>
                  <div className="ml-4">
                    <div className="text-green-600">├── 2024/</div>
                    <div className="ml-4">
                      <div className="text-green-600">├── 01/</div>
                      <div className="ml-4">
                        <div className="text-green-600">├── 15/</div>
                        <div className="ml-4">
                          <div className="text-blue-600">├── original/</div>
                          <div className="ml-4 text-gray-700">
                            <div>├── 20240115_143022_work_certificate.pdf</div>
                            <div>├── 20240115_143045_another_document.pdf</div>
                            <div>└── ...</div>
                          </div>
                          <div className="text-blue-600">└── processed/</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-orange-600">├── temp/</div>
                  <div className="ml-4 text-gray-700">
                    <div>├── tmp_processing_file_1.pdf</div>
                    <div>└── ...</div>
                  </div>
                  <div className="text-gray-600">└── .gitkeep</div>
                </div>
                <div className="mt-4">
                  <div className="text-purple-600">├── processedData/</div>
                  <div className="ml-4 text-gray-700">
                    <div>├── work_certificate_20240115_143022/</div>
                    <div>│   ├── aiworkflow_output_work_certificate_20240115_143022.json</div>
                    <div>│   └── ocr_text_work_certificate_20240115_143022.txt</div>
                    <div>└── ...</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-semibold text-gray-800 mb-3">📁 Uploads Directory</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li><strong>Purpose:</strong> Store original uploaded files</li>
                  <li><strong>Organization:</strong> Date-based (YYYY/MM/DD)</li>
                  <li><strong>Naming:</strong> Timestamp + original filename</li>
                  <li><strong>Security:</strong> No sensitive data in filenames</li>
                  <li><strong>Cleanup:</strong> Manual or automated retention policies</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-semibold text-gray-800 mb-3">📊 ProcessedData Directory</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li><strong>Purpose:</strong> Store processing results</li>
                  <li><strong>Content:</strong> OCR text, LLM results, evaluations</li>
                  <li><strong>Format:</strong> JSON files with complete analysis</li>
                  <li><strong>Linking:</strong> Connected to uploaded files</li>
                  <li><strong>Retention:</strong> Permanent storage of results</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="space-y-6">
            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">🗄️ Future Database Integration</h3>
              <p className="text-yellow-700 mb-4">
                When you implement a database, here's how the file storage will integrate:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-semibold text-gray-800 mb-3">📋 Database Schema (Future)</h4>
                <div className="font-mono text-xs bg-gray-50 p-3 rounded">
                  <div className="text-blue-600">uploads</div>
                  <div className="ml-4">
                    <div>id: UUID (Primary Key)</div>
                    <div>original_filename: String</div>
                    <div>stored_filename: String</div>
                    <div>file_path: String</div>
                    <div>file_size: Integer</div>
                    <div>upload_date: DateTime</div>
                    <div>student_email: String</div>
                    <div>degree_program: String</div>
                    <div>training_type: String</div>
                  </div>
                  <div className="mt-2 text-blue-600">processing_results</div>
                  <div className="ml-4">
                    <div>id: UUID (Primary Key)</div>
                    <div>upload_id: UUID (Foreign Key)</div>
                    <div>ocr_results: JSON</div>
                    <div>llm_results: JSON</div>
                    <div>processing_time: Float</div>
                    <div>created_at: DateTime</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-semibold text-gray-800 mb-3">🔗 Integration Benefits</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• <strong>File Tracking:</strong> Link files to student records</li>
                  <li>• <strong>Processing History:</strong> Track all processing attempts</li>
                  <li>• <strong>Search & Filter:</strong> Find files by student, date, degree</li>
                  <li>• <strong>Retention Policies:</strong> Automated file cleanup</li>
                  <li>• <strong>Audit Trail:</strong> Complete processing history</li>
                  <li>• <strong>User Management:</strong> Link files to user accounts</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">🚀 Migration Path</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>1. <strong>Current:</strong> Files stored in organized directory structure</p>
                <p>2. <strong>Database Setup:</strong> Create tables for uploads and results</p>
                <p>3. <strong>Migration Script:</strong> Import existing files into database</p>
                <p>4. <strong>API Updates:</strong> Modify endpoints to use database</p>
                <p>5. <strong>File Cleanup:</strong> Remove old files or keep as backup</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileStorageDemo; 