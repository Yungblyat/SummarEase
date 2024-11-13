import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckIcon, ChevronDown, ChevronUp, CopyIcon, Download, Mail, FileUp, CheckSquare, BarChart2, ListTodo, ClipboardPen, SquareChevronLeft, MessageSquare, Activity, Speech, Zap  } from 'lucide-react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import EmailModal from './EmailModal';
import ChatInterface from './Chat';
import "../styles/Result.css"
import DownloadPDF from './DownloadPDF';




// Define styles for PDF
// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#f3e5f5', // This color should stay as the background
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#6a1b9a',
  },
  section: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#ffffff', // Set white only for the section, not the entire screen
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: '#6a1b9a',
  },
  content: {
    fontSize: 12,
    marginBottom: 5,
  },
  sentimentBar: {
    height: 10, // Defines the height of the bar
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 10,
  },
  sentimentLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  positiveBar: {
    backgroundColor: '#4caf50', // Green for Positive
  },
  neutralBar: {
    backgroundColor: '#ff9800', // Orange for Neutral
  },
  negativeBar: {
    backgroundColor: '#f44336', // Red for Negative
  },
});



// Helper function to clean up data for PDF
const cleanDataForPDF = (data) => {
  if (typeof data === 'string') {
    return data.replace(/^\s*\d+\s*/, '').replace(/\n\s*\d+\s*/g, '\n').trim();
  }
  if (Array.isArray(data)) {
    return data.map(cleanDataForPDF).join('\n');
  }
  if (typeof data === 'object' && data !== null) {
    return Object.entries(data)
      .map(([key, value]) => `${cleanDataForPDF(value)}`)
      .join('\n');
  }
  return String(data);
};
// Sentiment Bar component
const SentimentBar = ({ label, value, color }) => (
  <div className="mb-2">
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium text-white">{label}</span>
      <span className="text-sm font-medium text-white">{value}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    transcript: true,
    diarization: true,
    todos: true,
    sentiment: true,
    speechRate: true
  });
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emails, setEmails] = useState([]);
  const pageRef = useRef(null);
  const goToHome= () => {
    navigate('/');
  };

  useEffect(() => {
    if (location.state?.result) {
      setResult(location.state.result);
    } else {
      navigate('/');
    }
  }, [location, navigate]);

  useEffect(() => {
    const checkScroll = () => {
      if (pageRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = pageRef.current;
        setShowScrollIndicator(scrollTop < scrollHeight - clientHeight - 20);
      }
    };

    const pageElement = pageRef.current;
    if (pageElement) {
      pageElement.addEventListener('scroll', checkScroll);
      checkScroll(); // Initial check
    }

    return () => {
      if (pageElement) {
        pageElement.removeEventListener('scroll', checkScroll);
      }
    };
  }, [result]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const renderDiarizationResults = (diarization) => {
    if (typeof diarization === 'object' && diarization !== null) {
      return Object.entries(diarization).map(([speaker, text], i) => (
        <div key={i} className="mb-2 p-2 rounded">
          {/* <span className="font-bold text-purple-200">{speaker}:</span> */}
          <p className="ml-4 text-white">{text}</p>
        </div>
      ));
    }
    return <p className="text-white">No diarization data available.</p>;
  };

  const renderEngagementMetrics = (result) => {
    
    const { interruptions, speech_rate, sentiment, metrics } = result

    return (
      <div className="engagement-metrics">
        {interruptions && (
          <div className="engagement-metrics-container">
            <div className="heading-div">
              <MessageSquare className="icons"/>
               <h2 className="heading">Interruptions</h2>
            </div>
          
            {typeof interruptions === 'object' && interruptions !== null ? (
              Object.entries(interruptions).map(([speaker, data]) => (
                <div key={speaker} className="mb-2 p-2 rounded">
                  <span className="font-bold text-purple-200 mr-2">{speaker} interrupted:</span>
                  <span className="text-white">
                    {Object.entries(data).map(([interruptedSpeaker, count], index, array) => (
                      <React.Fragment key={interruptedSpeaker}>
                        {`${interruptedSpeaker} ${count} time(s)`}
                        {index < array.length - 1 ? ', ' : ''}
                      </React.Fragment>
                    ))}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-white">No interruptions data available.</p>
            )}
          </div>
        )}

        {speech_rate && (
          <div className="engagement-metrics-container">
            <div className='heading-div'>
              <Speech className='icons'/>
               <h2 className="heading">Speech Rate</h2>
            </div>
            
            {typeof speech_rate === 'object' && speech_rate !== null ? (
              Object.entries(speech_rate).map(([speaker, rate]) => (
                <p key={speaker} className="text-white">
                  {speaker}: {rate.speech_rate.toFixed(2)} words per minute
                </p>
              ))
            ) : (
              <p className="text-white">{speech_rate} words per minute</p>
            )}
          </div>
        )}
        {metrics && (
          <div className="engagement-metrics-container">
            <div className='heading-div'>
              <Activity className='icons'/>
              <h2 className="heading">Metrics</h2>
            </div>
            
            {typeof metrics === 'object' && metrics !== null ? (
              Object.entries(metrics).map(([speaker, data]) => (
                <p key={speaker} className="text-white">
                  {speaker}: Total Time: {data.total_time}, Turns: {data.turns}, Avg_Time_Per_turn: {data.average_time_per_turn}
                </p>
              ))
            ) : (
              <p className="text-white">{metrics} Blyat</p>
            )}
          </div>
        )}

{sentiment && (
  <div className="engagement-metrics-container">
    <div className='heading-div'>
      <Zap className='icons'/>
      <h3 className="heading">Sentiment Analysis</h3>
    </div>

    {typeof sentiment === 'object' && sentiment !== null ? (
      Object.entries(sentiment).map(([key, value]) => {
        // Determine color based on sentiment value
        let color = 'bg-yellow-500'; // default color for neutral
        if (value > 50) color = 'bg-green-500'; // positive sentiment (good)
        if (value < -50) color = 'bg-red-500'; // negative sentiment (bad)

        return (
          <div key={key} className="mb-4">
            <SentimentBar label={key.charAt(0).toUpperCase() + key.slice(1)} value={value.toFixed(2)} color={color} />
          </div>
        );
      })
    ) : (
      <p className="text-white">Overall sentiment: {sentiment}</p>
    )}
  </div>
        )}
      </div>
    )
  }

  const sections = result
  ? [
      { key: 'summary', title: 'Summary', content: result.summary, image: <FileUp /> },
      { key: 'transcript', title: 'Transcript', content: result.transcript_result, image: <ClipboardPen /> },
      { key: 'diarization', title: 'Speech Diarization', content: result.diarization_results, render: renderDiarizationResults, image: <CheckSquare /> },
      { key: 'todos', title: 'Todos', content: result.todos, image: <ListTodo /> },
      // Add a conditional check for engagementMetrics
      result.interruptions || result.speech_rate || result.metrics || result.sentiment ? 
      { key: 'engagementMetrics', title: 'Engagement Metrics', content: result, render: renderEngagementMetrics, image: <BarChart2 /> } 
      : null,
    ]
    .filter((section) => section !== null && (Array.isArray(section.content) ? section.content.length > 0 : section.content != null && section.content !== ''))
  : [];

   
  const copyToClipboard = (content) => {
    let text;
    if (typeof content === 'object' && content !== null) {
      text = JSON.stringify(content, null, 2);
    } else {
      text = Array.isArray(content) ? content.join('\n') : content;
    }
    navigator.clipboard.writeText(text);
  };


  const CopyButton = ({ content }) => {
    const [isCopied, setIsCopied] = useState(false); // State to track if text is copied

    const handleCopy = (e) => {
        e.stopPropagation(); // Prevent event bubbling
        navigator.clipboard.writeText(content) // Use the Clipboard API to copy text
            .then(() => {
                setIsCopied(true); // Set copied state
                setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
            })
            .catch((err) => console.error('Failed to copy: ', err));
    };

    return (
        <div className="flex items-center space-x-2">
            {isCopied ? (
                <CheckIcon className="h-5 w-5 text-green-300" /> // Show check icon when copied
            ) : (
                <CopyIcon 
                    className="h-5 w-5 cursor-pointer" 
                    onClick={handleCopy} // Call handleCopy directly
                /> // Show copy icon when not copied
            )}
        </div>
    );
  }



  const renderContent = (section) => {
    if (section.render) {
      return section.render(section.content);
    }
    if (Array.isArray(section.content)) {
      return (
        <ol className="list-decimal list-inside text-white">
          {section.content.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );
    }
    if (typeof section.content === 'object' && section.content !== null) {
      return Object.entries(section.content).map(([key, value], i) => (
        <p key={i} className="text-white">
          <span className="font-bold">{key}:</span> {JSON.stringify(value)}
        </p>
      ));
    }
    return <p className="text-white">{section.content}</p>;
  };

  if (!result) {
    return <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 text-white p-8 flex items-center justify-center">Loading...</div>;
  }

  
  return (
    <div 
      ref={pageRef}
      className="result-page"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <div className="main-result-page">
       
        <div onClick={goToHome} className='back-btn-div'>
          <SquareChevronLeft className="back-btn" />
         
        </div>
        <h1 className="main-title">Results</h1>
        <div className="space-y-4 mb-8">
          {sections.map((section) => (
            <div key={section.key} className="box">
              <button
                className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                onClick={() => toggleSection(section.key)}
              >
                <div className="flex items-center space-x-2">
                 
                  <span  className="h-5 w-5 text-white" >{section.image}</span>
                  <span className="text-xl font-semibold ml-2 mt-1">{section.title}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                <CopyButton content={section.content} />
                  {expandedSections[section.key] ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </button>
              {expandedSections[section.key] && (
                <div className="box-text">
                  {renderContent(section)}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-4">
        <DownloadPDF></DownloadPDF>
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="bg-white text-purple-700 px-4 py-2 rounded-lg flex items-center hover:bg-purple-100 transition-colors duration-200"
          >
            <Mail className="mr-2 h-5 w-5" />
            Email Results
          </button>
        </div>
      </div>
      {showScrollIndicator && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-white opacity-75" />
        </div>
      )}
      <EmailModal
        isOpen={isEmailModalOpen}
        setIsOpen={setIsEmailModalOpen}
        emails={emails}
        setEmails={setEmails}
      />
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <ChatInterface></ChatInterface>
    </div>
  );
};

export default ResultsPage;
