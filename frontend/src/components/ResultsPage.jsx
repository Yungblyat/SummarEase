import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronDown, ChevronUp, Copy, Download, Mail } from 'lucide-react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import EmailModal from './EmailModal';


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

// PDF Document component
const MyDocument = ({ sections }) => (
  <Document>
  <Page size="A4" style={styles.page}>
    {/* Title */}
    <Text style={styles.title}>SummarEase</Text>

    {/* Mapping through sections */}
    {sections.map((section) => (
      <View key={section.key} style={styles.section}>
        <Text style={styles.sectionTitle}>{section.title}</Text>

        {/* Handling the 'summary' section */}
        {section.key === 'summary' && (
          <Text style={styles.content}>{cleanDataForPDF(section.content)}</Text>
        )}

        {/* Handling the 'todos' section */}
        {section.key === 'todos' && (
          section.content.map((todo, index) => (
            <Text key={index} style={styles.content}>
              {`${index + 1}. ${cleanDataForPDF(todo)}`}
            </Text>
          ))
        )}

        {/* Handling the 'sentiment' section */}
        {section.key === 'sentiment' && (
          <>
            <SentimentBar label="Positive" value={section.content.positive} color="#4caf50" />
            <SentimentBar label="Neutral" value={section.content.neutral} color="#ff9800" />
            <SentimentBar label="Negative" value={section.content.negative} color="#f44336" />
            {/* Showing sentiment as percentages */}
            {Object.entries(section.content).map(([key, value], index) => (
              <Text key={index} style={styles.content}>
                {`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value.toFixed(2)}%`}
              </Text>
            ))}
          </>
        )}

        {/* Handling the 'diarization' section */}
        {section.key === 'diarization' && (
          Object.entries(section.content).map(([speaker, text], index) => (
            <Text key={index} style={styles.content}>
              {cleanDataForPDF(text)}
            </Text>
          ))
        )}

        {/* Handling the 'speechRate' section */}
        {section.key === 'speechRate' && (
          Object.entries(section.content).map(([speaker, data], index) => (
            <Text key={index} style={styles.content}>
              <Text style={styles.speakerText}>{speaker}:</Text> {`${data.speech_rate.toFixed(2)} words per minute`}
            </Text>
          ))
        )}

        {/* Handling the 'interruptions' section */}
        {section.key === 'interruptions' && (
          Object.entries(section.content).map(([speaker, data], index) => (
            <Text key={index} style={styles.content}>
              <Text style={styles.speakerText}>{speaker} interrupted:</Text>
              {Object.entries(data).map(([interruptedSpeaker, count], i, arr) => (
                `${interruptedSpeaker} ${count} time(s)${i < arr.length - 1 ? ', ' : ''}`
              )).join('')}
            </Text>
          ))
        )}
      </View>
    ))}
  </Page>
</Document>

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
        <div key={i} className="mb-2 bg-purple-600 bg-opacity-50 p-2 rounded">
          {/* <span className="font-bold text-purple-200">{speaker}:</span> */}
          <p className="ml-4 text-white">{text}</p>
        </div>
      ));
    }
    return <p className="text-white">No diarization data available.</p>;
  };

  const renderEngagementMetrics = (result) => {
    const { interruptions, speech_rate, sentiment } = result

    return (
      <div className="engagement-metrics">
        {interruptions && (
          <div className="interruptions mb-4">
            <h3 className="text-lg font-bold text-purple-400 mb-2">Interruptions</h3>
            {typeof interruptions === 'object' && interruptions !== null ? (
              Object.entries(interruptions).map(([speaker, data]) => (
                <div key={speaker} className="mb-2 bg-purple-600 bg-opacity-50 p-2 rounded">
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
          <div className="speech-rate mb-4">
            <h3 className="text-lg font-bold text-purple-400 mb-2">Speech Rate</h3>
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

        {sentiment && (
          <div className="sentiment mb-4">
            <h3 className="text-lg font-bold text-purple-400 mb-2">Sentiment Analysis</h3>
            {typeof sentiment === 'object' && sentiment !== null ? (
              Object.entries(sentiment).map(([key, value]) => (
                <p key={key} className="text-white">
                  {key.charAt(0).toUpperCase() + key.slice(1)}: {value.toFixed(2)}%
                </p>
              ))
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
        { key: 'summary', title: 'Summary', content: result.summary },
        { key: 'transcript', title: 'Transcript', content: result.transcript_result },
        { key: 'diarization', title: 'Speech Diarization', content: result.diarization_results, render: renderDiarizationResults },
        { key: 'todos', title: 'Todos', content: result.todos },
        { key: 'engagementMetrics', title: 'Engagement Metrics', content: result, render: renderEngagementMetrics },
      ].filter((section) => {
        if (Array.isArray(section.content)) {
          return section.content.length > 0
        }
        return section.content != null && section.content !== ''
      })
    : []


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
      className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 text-white overflow-y-auto scrollbar-hide"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Results</h1>
        <div className="space-y-4 mb-8">
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
                <div className="p-4 bg-purple-800 bg-opacity-50 border-t border-purple-500 max-h-96 overflow-y-auto scrollbar-hide">
                  {renderContent(section)}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-4">
          <PDFDownloadLink
            document={<MyDocument sections={sections} />}
            fileName="meeting_summary.pdf"
            className="bg-white text-purple-700 px-4 py-2 rounded-full flex items-center hover:bg-purple-100 transition-colors duration-200"
          >
            {({ blob, url, loading, error }) =>
              loading ? 'Loading document...' : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Download PDF
                </>
              )
            }
          </PDFDownloadLink>
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="bg-white text-purple-700 px-4 py-2 rounded-full flex items-center hover:bg-purple-100 transition-colors duration-200"
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
    </div>
  );
};

export default ResultsPage;
