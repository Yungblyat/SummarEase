import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle, ChevronDown, ChevronUp, Copy } from 'lucide-react';

const ResultsPage = () => {
  const location = useLocation();
  const result = location.state?.result;

  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    transcript: true,
    diarization: true,
    todos: true,
    sentiment: true,
    speechRate: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Helper function to render diarization results
  const renderDiarizationResults = (diarization) => {
    if (typeof diarization === 'object' && diarization !== null) {
      return Object.entries(diarization).map(([speaker, text], i) => (
        <p key={i} className="mb-2">
          <strong className="text-purple-300">{speaker}:</strong> {text}
        </p>
      ));
    }
    return <p>No diarization data available.</p>;
  };


  // Helper function to render sentiment results
  const renderSentimentResults = (sentiment) => {
    if (typeof sentiment === 'object' && sentiment !== null) {
      return (
        <div>
          <p><strong>Average Polarity:</strong> {sentiment.average_polarity ? sentiment.average_polarity.toFixed(2) : 'N/A'}</p>
          <p><strong>Average Subjectivity:</strong> {sentiment.average_subjectivity ? sentiment.average_subjectivity.toFixed(2) : 'N/A'}</p>
          <p><strong>Polarity Label:</strong> {sentiment.polarity_label || 'N/A'}</p>
          <p><strong>Subjectivity Label:</strong> {sentiment.subjectivity_label || 'N/A'}</p>
        </div>
      );
    }
    return <p>No sentiment data available.</p>;
  };

  const sections = [
    { key: 'summary', title: 'Summary', content: result?.summary },
    { key: 'transcript', title: 'Transcript', content: result?.transcript_result },
    { key: 'diarization', title: 'Speech Diarization', content: result?.diarization_results, render: renderDiarizationResults },
    { key: 'todos', title: 'Todos', content: result?.todos },
    { key: 'sentiment', title: 'Sentiment', content: result?.sentiment, render: renderSentimentResults },
    { key: 'speechRate', title: 'Speech Rate', content: result?.speech_rate ? `${result.speech_rate} words per minute` : null },
  ].filter(section => {
    if (Array.isArray(section.content)) {
      return section.content.length > 0;
    }
    return section.content != null && section.content !== '';
  });

  const copyToClipboard = (content) => {
    let text;
    if (typeof content === 'object' && content !== null) {
      text = JSON.stringify(content, null, 2);
    } else {
      text = Array.isArray(content) ? content.join('\n') : content;
    }
    navigator.clipboard.writeText(text);
  };

  const renderContent = (section) => {
    if (section.render) {
      return section.render(section.content);
    }
    if (Array.isArray(section.content)) {
      return (
        <ul className="list-disc list-inside">
          {section.content.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }
    if (typeof section.content === 'object' && section.content !== null) {
      return Object.entries(section.content).map(([key, value], i) => (
        <p key={i}>
          <strong>{key}:</strong> {JSON.stringify(value)}
        </p>
      ));
    }
    return <p>{section.content}</p>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Results</h1>
      <div className="max-w-3xl mx-auto space-y-4">
        {sections.map((section) => (
          <div key={section.key} className="bg-purple-700 bg-opacity-50 rounded-lg overflow-hidden border border-purple-500">
            <button
              className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
              onClick={() => toggleSection(section.key)}
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-xl font-semibold">{section.title}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Copy
                  className="h-5 w-5 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(section.content);
                  }}
                />
                {expandedSections[section.key] ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </button>
            {expandedSections[section.key] && (
              <div className="p-4 bg-purple-800 bg-opacity-50 border-t border-purple-500">
                {renderContent(section)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsPage;
// import React, { useState } from 'react';
// import { useLocation } from 'react-router-dom';
// import { CheckCircle, ChevronDown, ChevronUp, Copy } from 'lucide-react';

// const ResultsPage = () => {
//   const location = useLocation();
//   const result = location.state?.result;

//   const [expandedSections, setExpandedSections] = useState({
//     summary: true,
//     transcript: true,
//     diarization: true,
//     todos: true,
//     sentiment: true,
//     speechRate: true
//   });

//   const toggleSection = (section) => {
//     setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
//   };

//   // Helper function to render diarization results
//   const renderDiarizationResults = (diarization) => {
//     if (typeof diarization === 'object' && diarization !== null) {
//       return Object.entries(diarization).map(([speaker, text], i) => (
//         <p key={i} className="mb-2">
//           <strong className="text-purple-300">{speaker}:</strong> {text}
//         </p>
//       ));
//     }
//     return <p>No diarization data available.</p>;
//   };

//   const sections = [
//     { key: 'summary', title: 'Summary', content: result?.summary },
//     { key: 'transcript', title: 'Transcript', content: result?.transcript_result },
//     { key: 'diarization', title: 'Speech Diarization', content: result?.diarization_results, render: renderDiarizationResults },
//     { key: 'todos', title: 'Todos', content: result?.todos },
//     { key: 'sentiment', title: 'Sentiment', content: result?.sentiment },
//     { key: 'speechRate', title: 'Speech Rate', content: result?.speech_rate ? `${result.speech_rate} words per minute` : null },
//   ].filter(section => {
//     if (Array.isArray(section.content)) {
//       return section.content.length > 0;
//     }
//     return section.content != null && section.content !== '';
//   });

//   const copyToClipboard = (content) => {
//     let text;
//     if (typeof content === 'object' && content !== null) {
//       text = Object.entries(content).map(([speaker, text]) => `${speaker}: ${text}`).join('\n');
//     } else {
//       text = Array.isArray(content) ? content.join('\n') : content;
//     }
//     navigator.clipboard.writeText(text);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 text-white p-8">
//       <h1 className="text-4xl font-bold mb-8 text-center">Results</h1>
//       <div className="max-w-3xl mx-auto space-y-4">
//         {sections.map((section) => (
//           <div key={section.key} className="bg-purple-700 bg-opacity-50 rounded-lg overflow-hidden border border-purple-500">
//             <button
//               className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
//               onClick={() => toggleSection(section.key)}
//             >
//               <div className="flex items-center space-x-2">
//                 <CheckCircle className="h-5 w-5 text-green-400" />
//                 <span className="text-xl font-semibold">{section.title}</span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <Copy
//                   className="h-5 w-5 cursor-pointer"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     copyToClipboard(section.content);
//                   }}
//                 />
//                 {expandedSections[section.key] ? (
//                   <ChevronUp className="h-5 w-5" />
//                 ) : (
//                   <ChevronDown className="h-5 w-5" />
//                 )}
//               </div>
//             </button>
//             {expandedSections[section.key] && (
//               <div className="p-4 bg-purple-800 bg-opacity-50 border-t border-purple-500">
//                 {section.render ? (
//                   section.render(section.content)
//                 ) : Array.isArray(section.content) ? (
//                   <ul className="list-disc list-inside">
//                     {section.content.map((item, i) => (
//                       <li key={i}>{item}</li>
//                     ))}
//                   </ul>
//                 ) : (
//                   <p>{section.content}</p>
//                 )}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ResultsPage;