import speech_icon from "../assets/voice-recognition.png";
import nlp_icon from "../assets/nlp.png";
import tokenization_icon from "../assets/tokenization.png";
import punctuation_icon from "../assets/punctuation.png";
import "../styles/About.css";
const About = () => {
  return (
    <>
      <div className="abt" id="about">
        <div className="abt-head">
          <h2>How Everything Works?</h2>
          <p>
            Elevate Your Meeting Experience: With the power of Ai our
            cutting-edge meeting summarizer is designed to revolutionize your
            approach towards meetings
          </p>
        </div>
        <div className="abt-tiles">
          <div className="abt-card">
            <div className="abt-card-inner">
              <img src={speech_icon} alt="" />
              <h3>Speech Recognition</h3>
              <p>
                This Process involves converting spoken language into text. It
                uses machine learning algorithms to analyze audio inputs and
                transcribe them accurately into written text.
              </p>
            </div>
          </div>
          <div className="abt-card">
            <div className="abt-card-inner">
              <img src={punctuation_icon} alt="" />
              <h3>Speech Punctuation</h3>
              <p>
                Speech punctuation involves adding punctuation marks (like
                periods, commas, question marks) to transcribed speech, making
                the text more readable and grammatically correct.
              </p>
            </div>
          </div>
          <div className="abt-card">
            <div className="abt-card-inner">
              <img src={nlp_icon} alt="" />
              <h3>Natural Language Processing</h3>
              <p>
                Leverage the power of NLP to understand and analyze meeting
                content. Our feature extracts key information, identifies
                topics, and provides deeper insights into your discussions
              </p>
            </div>
          </div>
          <div className="abt-card">
            <div className="abt-card-inner">
              <img src={tokenization_icon} alt="" />
              <h3>Tokenization</h3>
              <p>
                Tokenization breaks down text into individual units or tokens,
                such as words, phrases, or sentences. It's a fundamental step in
                Natural Language Processing (NLP) for analyzing and processing
                textual data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
