import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileUp, CheckSquare, BarChart2, ListTodo } from 'lucide-react'
import axios from 'axios'
import api from "../api"

export default function UploadSection() {
  const [file, setFile] = useState(null)
  const [options, setOptions] = useState({
    summary: true,
    diarization: false,
    engagement: false,
    todo: false,
  })
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0])
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setFile(event.dataTransfer.files[0])
    }
  }

  const handleUpload = async () => {
    if (file) {
      setIsUploading(true)
      setError(null)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('options', JSON.stringify(options))

      try {
        const response = await api.post('/summarease/upload/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        console.log('Upload successful:', response.data)
        navigate('/results', { state: { result: response.data } })
      } catch (err) {
        console.error('Error uploading file:', err)
        setError('Failed to upload file. Please try again.')
      } finally {
        setIsUploading(false)
      }
    }
  }

  return (
    <div className="bg-gradient-to-r from-purple-700 to-indigo-800 p-8">
      <div className="max-w-4xl mx-auto flex items-start justify-between">
        <div className="w-1/2 bg-purple-600 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Upload your file</h2>
          <p className="text-purple-200 mb-4">File should be an audio or video</p>
          <div 
            className="border-2 border-dashed border-purple-400 rounded-lg p-4 mb-4 text-center cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <p className="text-purple-200 mb-2">Drop files here</p>
            <p className="text-purple-300">or</p>
            <label className="block mt-2">
              <span className="sr-only">Choose file</span>
              <input 
                type="file" 
                className="block w-full text-sm text-purple-300
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-purple-700 file:text-purple-200
                  hover:file:bg-purple-800"
                onChange={handleFileChange}
                accept="audio/*,video/*"
              />
            </label>
          </div>
          <div className="space-y-2 mb-4">
            {Object.entries(options).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2 text-purple-200">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => setOptions(prev => ({ ...prev, [key]: !prev[key] }))}
                  className="form-checkbox h-5 w-5 text-purple-500"
                />
                <span className="capitalize">{key}</span>
                {key === 'summary' && <FileUp className="h-4 w-4" />}
                {key === 'diarization' && <CheckSquare className="h-4 w-4" />}
                {key === 'engagement' && <BarChart2 className="h-4 w-4" />}
                {key === 'todo' && <ListTodo className="h-4 w-4" />}
              </label>
            ))}
          </div>
          <button
            onClick={handleUpload}
            className={`w-full bg-purple-800 hover:bg-purple-900 text-white font-bold py-2 px-4 rounded-full flex items-center justify-center ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Upload className="mr-2 h-5 w-5" />
            )}
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
          {error && (
            <p className="mt-2 text-red-300 text-sm">{error}</p>
          )}
        </div>
        <div className="w-1/2 pl-8">
          <h2 className="text-4xl font-bold text-white mb-4">Revolutionize your Meetings</h2>
          <p className="text-purple-200">
            Upload your meeting, and watch as we transform it into clear summaries and deep insights—
            understanding made effortless.
          </p>
        </div>
      </div>
    </div>
  )
}