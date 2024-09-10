import React from 'react'
import { useLocation } from 'react-router-dom'

export default function ResultsPage() {
  const location = useLocation()
  const result = location.state?.result

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">Results</h1>
      {result ? (
        <div>
          <h2 className="text-2xl font-semibold mb-2">Transcript</h2>
          <p className="mb-4">{result.transcript_result}</p>
          
          {result.summary && (
            <>
              <h2 className="text-2xl font-semibold mb-2">Summary</h2>
              <p className="mb-4">{result.summary}</p>
            </>
          )}
          
          {result.todos && result.todos.length > 0 && (
            <>
              <h2 className="text-2xl font-semibold mb-2">To-Dos</h2>
              <ul className="list-disc list-inside mb-4">
                {result.todos.map((todo, index) => (
                  <li key={index}>{todo}</li>
                ))}
              </ul>
            </>
          )}
          
          {result.sentiment && (
            <>
              <h2 className="text-2xl font-semibold mb-2">Sentiment</h2>
              <p className="mb-4">{result.sentiment}</p>
            </>
          )}
          
          {result.speech_rate && (
            <>
              <h2 className="text-2xl font-semibold mb-2">Speech Rate</h2>
              <p className="mb-4">{result.speech_rate} words per minute</p>
            </>
          )}
        </div>
      ) : (
        <p>No results to display. Please upload a file first.</p>
      )}
    </div>
  )
}