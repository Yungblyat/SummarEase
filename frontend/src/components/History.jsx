import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import api from '../api'; // Assuming you have an api.js file for axios configuration

function History() {
  const [audioFiles, setAudioFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/summarease/history/', { timeout: 10000 });
        setAudioFiles(response.data.audio_files);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch audio files. Please try again later.');
      }
    };

    fetchData();
  }, [refreshKey]);

  const handleFileClick = async (fileId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/summarease/process/', { audio_file_id: fileId });
      console.log(`File processed successfully ${JSON.stringify(response.data)}`);
      navigate('/results', { state: { result: response.data } });
    } catch (error) {
      console.error('Error processing file:', error);
      setError('Failed to process the file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await api.post('/summarease/delete/', { audio_file_id: fileId });
      setRefreshKey(prevKey => prevKey + 1);
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Failed to delete the file. Please try again.');
    }
  };

  const getFileName = (filePath) => {
    let parts = filePath.split('/');
    parts = parts[3].split('_');
    return parts[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold mb-8 text-center">History</h2>
        {error && (
          <p className="text-red-300 mb-4 p-3 bg-red-900 bg-opacity-50 rounded" role="alert">
            {error}
          </p>
        )}
        <ul className="space-y-4">
          {audioFiles.map((file) => (
            <li key={file.id} className="bg-purple-700 bg-opacity-50 rounded-lg p-4 border border-purple-500">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium break-all">
                  {getFileName(file.file)}
                </span>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="text-white hover:text-red-300 transition-colors duration-200"
                  aria-label="Delete file"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-purple-200 mt-2">
                Uploaded at: {new Date(file.uploaded_at).toLocaleString()}
              </p>
              <button
                onClick={() => handleFileClick(file.id)}
                disabled={loading}
                className={`mt-3 px-4 py-2 rounded-full text-purple-700 font-semibold transition-colors duration-200 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-white hover:bg-purple-100'
                }`}
              >
                {loading ? 'Processing...' : 'Show Result'}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default History;