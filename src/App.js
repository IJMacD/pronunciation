import { Logo } from './logo';
import './App.css';
import { useEffect, useRef, useState } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function App() {
  const [ active, setActive ] = useState(false);
  const [ result, setResult ] = useState(/** @type {SpeechRecognitionAlternative?} */(null));
  const [ isPlaying, setIsPlaying ] = useState(false);
  const [ correctText, setCorrectText ] = useState("");
  const recognitionRef = useRef(null);
  const [ error, setError ] = useState(null);
  const [ selectedVoice, setSelectedVoice ] = useState("");
  const [ voices, setVoices ] = useState(/** @type {SpeechSynthesisVoice[]} */([]));

  useEffect(() => {
    setVoices(speechSynthesis.getVoices());

    speechSynthesis.addEventListener("voiceschanged", () => setVoices(speechSynthesis.getVoices()));
  }, []);

  if (typeof SpeechRecognition == "undefined") {
    return <div className="App"><p className="error">Your browser doesn't support direct speech recognition.</p></div>;
  }

  if (typeof speechSynthesis == "undefined") {
    return <div className="App"><p className="error">Your browser doesn't support direct speech synthesis.</p></div>;
  }

  function handleClick () {
    if (recognitionRef.current == null) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-GB';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.onnomatch = (event) => {
        console.log(event);
        setError("Unable to recognise speech");
      };
      recognition.onerror = (event) => {
        console.log(event);
        setError("Unable to recognise speech");
        setActive(false);
      };
      recognition.onresult = (event) => {
        console.log(event);
        const alternative = event.results[0][0];
        setResult(alternative);
        setCorrectText(alternative.transcript);
      };
      recognition.onsoundend = (event) => {
        setActive(false);
      }
      recognitionRef.current = recognition;
    }

    if (active) {
      recognitionRef.current.stop();
      setActive(false);
    }
    else {
      recognitionRef.current.start();
      setActive(true);
    }
  }

  function handlePlay () {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
    else if (correctText) {
      const utterance = new SpeechSynthesisUtterance(correctText);
      utterance.addEventListener("end", () => setIsPlaying(false));
      const voice = voices.find(v => v.voiceURI === selectedVoice);
      utterance.voice = voice || null;
      speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  }


  return (
    <div className="App">
        <Logo pulse={active} onClick={handleClick} />
        {
          error &&
          <div>
            <hr />
            <p className="error">{error}</p>
          </div>
        }
        {
          result &&
          <div>
            <hr />
            <h2>Your speech:</h2>
            <p className="transcript">{result.transcript}</p>
            <p className="accuracy">Accuracy: {Math.floor(result.confidence*100)}%</p>
          </div>
        }
        <div>
          <hr />
          <h2>Native Robot:</h2>
          <p className="transcript"><input value={correctText} onChange={e => setCorrectText(e.target.value)} /></p>
          <p>
            <button onClick={handlePlay}>{isPlaying?"Stop":"Play"}</button>
            <select value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)}>
            {
              voices.map(v => <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>)
            }
            </select>
          </p>
        </div>
    </div>
  );
}

export default App;
