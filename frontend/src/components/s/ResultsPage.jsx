import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronDown, ChevronUp, Copy, Download, Mail } from 'lucide-react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import EmailModal from './EmailModal';

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  section: {
    margin: 5,
    padding: 5,
  },
  title: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 12,
    lineHeight: 1.5,
  },
  todoItem: {
    marginLeft: 10,
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

// PDF Document component
const MyDocument = ({ sections }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {sections.map((section) => (
        <View key={section.key} style={styles.section}>
          <Text style={styles.title}>{section.title}</Text>
          {section.key === 'diarization' ? (
            Object.entries(section.content).map(([speaker, text], index) => (
              <Text key={index} style={styles.content}>
                {cleanDataForPDF(text)}
              </Text>
            ))
          ) : section.key === 'todos' ? (
            section.content.map((todo, index) => (
              <Text key={index} style={styles.content}>
                {`${index + 1}. ${cleanDataForPDF(todo)}`}
              </Text>
            ))
          ) : (
            <Text style={styles.content}>
              {cleanDataForPDF(section.content)}
            </Text>
          )}
        </View>
      ))}
    </Page>
  </Document>
);

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

  const renderSentimentResults = (sentiment) => {
    if (typeof sentiment === 'object' && sentiment !== null) {
      return (
        <div className="space-y-4">
          <SentimentBar label="Positive" value={sentiment.average_positive} color="bg-green-500" />
          <SentimentBar label="Neutral" value={sentiment.average_neutral} color="bg-yellow-500" />
          <SentimentBar label="Negative" value={sentiment.average_negative} color="bg-red-500" />
        </div>
      );
    }
    return <p className="text-white">No sentiment data available.</p>;
  };

  const renderSpeechRateResults = (speechRate) => {
    if (typeof speechRate === 'object' && speechRate !== null) {
      return Object.entries(speechRate).map(([speaker, data]) => (
        <div key={speaker} className="mb-2 bg-purple-600 bg-opacity-50 p-2 rounded flex items-center">
          <span className="font-bold text-purple-200 mr-2">{speaker}:</span>
          <span className="text-white">
            {data.speech_rate.toFixed(2)} words per minute
          </span>
        </div>
      ));
    }
    return <p className="text-white">No speech rate data available.</p>;
  };
  const renderInterruptionsResults = (interruptions) => {
    if (typeof interruptions === 'object' && interruptions !== null) {
      return Object.entries(interruptions).map(([speaker, data]) => (
        <div key={speaker} className="mb-2 bg-purple-600 bg-opacity-50 p-2 rounded">
          <span className="font-bold text-purple-200 mr-2">{speaker} interrupted </span>
          <span className="text-white">
            {Object.entries(data).map(([interruptedSpeaker, count], index, array) => (
              <React.Fragment key={interruptedSpeaker}>
                {interruptedSpeaker} { count } time(s)
                {index < array.length - 1 ? ', ' : ''}
              </React.Fragment>
            ))}
          </span>
        </div>
      ));
    }
    return <p className="text-white">No interruptions data available.</p>;
  };
  const sections = result ? [
    { key: 'summary', title: 'Summary', content: result.summary },
    { key: 'transcript', title: 'Transcript', content: result.transcript_result },
    { key: 'diarization', title: 'Speech Diarization', content: result.diarization_results, render: renderDiarizationResults },
    { key: 'todos', title: 'Todos', content: result.todos },
    { key: 'sentiment', title: 'Sentiment', content: result.sentiment, render: renderSentimentResults },
    { key: 'speechRate', title: 'Speech Rate', content: result.speech_rate, render: renderSpeechRateResults },
    { key: 'interruptions', title: 'Interruptions', content: result.interruptions, render: renderInterruptionsResults },
  ].filter(section => {
    if (Array.isArray(section.content)) {
      return section.content.length > 0;
    }
    return section.content != null && section.content !== '';
  }) : [];

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