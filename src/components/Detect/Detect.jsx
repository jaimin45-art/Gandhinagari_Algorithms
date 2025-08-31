import React, { useState, useRef, useEffect, useCallback } from "react";
import "./Detect.css";
import { v4 as uuidv4 } from "uuid";
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import {
  drawConnectors,
  drawLandmarks,
} from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import Webcam from "react-webcam";
import { SignImageData } from "../../data/SignImageData";
import { useDispatch, useSelector } from "react-redux";
import { addSignData } from "../../redux/actions/signdataaction";
import ProgressBar from "./ProgressBar/ProgressBar";
import DisplayImg from "../../assests/displayGif.gif";

let startTime = "";

// Helper function to transform landmarks to match display coordinates
const transformLandmarks = (landmarks, videoWidth, videoHeight, displayWidth, displayHeight) => {
  return landmarks.map(landmark => ({
    x: landmark.x * displayWidth,
    y: landmark.y * displayHeight,
    z: landmark.z
  }));
};

const Detect = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [gestureOutput, setGestureOutput] = useState("");
  const [gestureRecognizer, setGestureRecognizer] = useState(null);
  const [runningMode, setRunningMode] = useState("IMAGE");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const requestRef = useRef();
  const [detectedData, setDetectedData] = useState([]);
  const user = useSelector((state) => state.auth?.user);
  const { accessToken } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [currentImage, setCurrentImage] = useState(null);

  // ------------------- Enhanced Text-to-Speech and Sentence Building States -------------------
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // New states for sentence building
  const [currentSentence, setCurrentSentence] = useState("");
  const [sentenceHistory, setSentenceHistory] = useState([]);
  const [isBuildingSentence, setIsBuildingSentence] = useState(false);
  const [lastGestureTime, setLastGestureTime] = useState(0);
  const [gestureTimeout, setGestureTimeout] = useState(null);

  // ------------------- Speech-to-Text States -------------------
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [speechHistory, setSpeechHistory] = useState([]);
  const [micPermission, setMicPermission] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');

  // Load voices when the component mounts
  useEffect(() => {
    const loadVoices = () => {
      const synthVoices = window.speechSynthesis.getVoices();
      setVoices(synthVoices);
      setSelectedVoice(synthVoices.find((v) => v.default) || synthVoices[0]);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Handle canvas resizing when webcam dimensions change
  useEffect(() => {
    const handleResize = () => {
      if (webcamRef.current && canvasRef.current) {
        const video = webcamRef.current.video;
        if (video && video.videoWidth && video.videoHeight) {
          const displayWidth = video.offsetWidth;
          const displayHeight = video.offsetHeight;
          
          canvasRef.current.width = displayWidth;
          canvasRef.current.height = displayHeight;
        }
      }
    };

    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Initial setup
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [webcamRunning]);

  // Initialize Speech Recognition
  useEffect(() => {
    const initSpeechRecognition = () => {
      // Check if browser supports Speech Recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = selectedLanguage;
        
        recognition.onstart = () => {
          setIsListening(true);
          setTranscript("");
        };
        
        recognition.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            setTranscript(prev => prev + ' ' + finalTranscript);
          }
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setMicPermission(false);
          }
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        setSpeechRecognition(recognition);
      } else {
        console.error('Speech recognition not supported in this browser');
      }
    };

    initSpeechRecognition();
  }, [selectedLanguage]);

  // Load sentence history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('signLanguageSentenceHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setSentenceHistory(parsedHistory);
      } catch (error) {
        console.error('Error parsing saved sentence history:', error);
        setSentenceHistory([]);
      }
    }
  }, []);

  // Save sentence history to localStorage whenever it changes
  useEffect(() => {
    if (sentenceHistory.length > 0) {
      localStorage.setItem('signLanguageSentenceHistory', JSON.stringify(sentenceHistory));
    }
  }, [sentenceHistory]);

  // Function to add word to sentence with proper spacing
  const addWordToSentence = (newWord) => {
    if (!newWord || newWord.trim() === "") return;
    
    setCurrentSentence(prev => {
      if (prev === "") {
        return newWord;
      } else {
        return prev + " " + newWord;
      }
    });
  };

  // Function to speak the current sentence
  const speakSentence = (text) => {
    if (!text || text.trim() === "") return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.cancel(); // Stop any previous speech
    window.speechSynthesis.speak(utterance);
  };

  // Function to clear current sentence
  const clearSentence = () => {
    setCurrentSentence("");
    setIsBuildingSentence(false);
  };

  // Function to save sentence to history
  const saveSentenceToHistory = () => {
    if (currentSentence.trim() !== "") {
      const newHistoryItem = {
        id: Date.now(),
        sentence: currentSentence,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setSentenceHistory(prev => {
        const updatedHistory = [...prev, newHistoryItem];
        // Save to localStorage immediately
        localStorage.setItem('signLanguageSentenceHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      });
      
      clearSentence();
    }
  };

  // Function to speak sentence from history
  const speakFromHistory = (sentence) => {
    speakSentence(sentence);
  };

  // Function to clear all sentence history
  const clearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all sentence history? This action cannot be undone.')) {
      setSentenceHistory([]);
      localStorage.removeItem('signLanguageSentenceHistory');
      console.log('Cleared all sentence history');
    }
  };

  // Function to export sentence history
  const exportSentenceHistory = () => {
    if (sentenceHistory.length === 0) {
      alert('No sentence history to export.');
      return;
    }

          try {
        // Extract only the sentences without timestamps or metadata
        const sentencesOnly = sentenceHistory.map(item => item.sentence);
        
        const exportData = {
          sentences: sentencesOnly
        };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sign-language-sentences.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      console.log('Exported sentence history:', exportData.totalSentences, 'sentences');
    } catch (error) {
      console.error('Error exporting sentence history:', error);
      alert('Failed to export sentence history. Please try again.');
    }
  };

  // Function to get localStorage usage info
  const getStorageInfo = () => {
    try {
      const used = JSON.stringify(sentenceHistory).length;
      const total = 5 * 1024 * 1024; // 5MB typical localStorage limit
      const percentage = (used / total * 100).toFixed(2);
      return { used, total, percentage };
    } catch (error) {
      return { used: 0, total: 0, percentage: 0 };
    }
  };

  // Auto speak whenever gestureOutput changes and build sentence
  useEffect(() => {
    if (gestureOutput && gestureOutput.trim() !== "") {
      // Add the detected gesture to the sentence
      addWordToSentence(gestureOutput);
      
      // Set building sentence mode
      setIsBuildingSentence(true);
      
      // Update last gesture time
      setLastGestureTime(Date.now());
      
      // Clear previous timeout
      if (gestureTimeout) {
        clearTimeout(gestureTimeout);
      }
      
      // Set new timeout to auto-complete sentence after 5 seconds of no new gestures
      // Increased from 3 seconds to 5 seconds to ensure last gesture is captured
      const timeout = setTimeout(() => {
        if (currentSentence.trim() !== "") {
          // Add a buffer delay to ensure the last gesture is fully processed
          setTimeout(() => {
            saveSentenceToHistory();
          }, 1000); // 1 second buffer
        }
      }, 5000);
      
      setGestureTimeout(timeout);
    }
  }, [gestureOutput]);

  // Manual control for speaking/stopping
  const handleSpeak = () => {
    if (!currentSentence || currentSentence.trim() === "") return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      speakSentence(currentSentence);
    }
  };

  // Function to manually complete sentence with delay to ensure last gesture is captured
  const manualCompleteSentence = () => {
    if (currentSentence && currentSentence.trim() !== "") {
      // Add a delay to ensure the last gesture is fully processed
      setTimeout(() => {
        saveSentenceToHistory();
      }, 800); // 800ms delay
    }
  };

  // Function to speak individual gesture
  const speakGesture = () => {
    if (gestureOutput && gestureOutput.trim() !== "") {
      speakSentence(gestureOutput);
    }
  };

  // Handle language change for speech recognition
  const handleLanguageChange = (newLanguage) => {
    setSelectedLanguage(newLanguage);
    
    // If currently listening, stop and restart with new language
    if (isListening && speechRecognition) {
      try {
        speechRecognition.stop();
        // The useEffect will automatically restart with new language
      } catch (error) {
        console.error('Error stopping speech recognition for language change:', error);
      }
    }
  };

  // ------------------- Speech-to-Text Functions -------------------
  
  // Start listening for speech
  const startListening = () => {
    if (speechRecognition && !isListening) {
      try {
        speechRecognition.start();
        setMicPermission(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  // Stop listening for speech
  const stopListening = () => {
    if (speechRecognition && isListening) {
      try {
        speechRecognition.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  };

  // Save speech transcript to history
  const saveSpeechToHistory = () => {
    if (transcript && transcript.trim() !== "") {
      const newSpeechItem = {
        id: Date.now(),
        text: transcript.trim(),
        timestamp: new Date().toLocaleTimeString()
      };
      
      setSpeechHistory(prev => {
        const updatedHistory = [...prev, newSpeechItem];
        localStorage.setItem('signLanguageSpeechHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      });
      
      setTranscript("");
      console.log('Speech saved:', newSpeechItem.text);
    }
  };

  // Clear speech transcript
  const clearTranscript = () => {
    setTranscript("");
  };

  // Clear all speech history
  const clearAllSpeechHistory = () => {
    if (window.confirm('Are you sure you want to clear all speech history? This action cannot be undone.')) {
      setSpeechHistory([]);
      localStorage.removeItem('signLanguageSpeechHistory');
      console.log('Cleared all speech history');
    }
  };

  // Export speech history
  const exportSpeechHistory = () => {
    if (speechHistory.length === 0) {
      alert('No speech history to export.');
      return;
    }

    try {
      // Extract only the speech text without timestamps or metadata
      const speechTextOnly = speechHistory.map(item => item.text);
      
      const exportData = {
        speech: speechTextOnly
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'speech-to-text-history.json';
      link.click();
      
      URL.revokeObjectURL(url);
      console.log('Exported speech history:', speechTextOnly.length, 'entries');
    } catch (error) {
      console.error('Error exporting speech history:', error);
      alert('Failed to export speech history. Please try again.');
    }
  };

  // Find image for detected gesture
  const findImageForGesture = (gestureName) => {
    const normalizedGestureName = gestureName.toLowerCase().replace(/\s+/g, "");
    let foundImage = SignImageData.find((image) => {
      const normalizedImageName = image.name.toLowerCase().replace(/\s+/g, "");
      return normalizedImageName === normalizedGestureName;
    });
    if (!foundImage) {
      foundImage = SignImageData.find((image) => {
        const normalizedImageName = image.name.toLowerCase().replace(/\s+/g, "");
        return (
          normalizedImageName.includes(normalizedGestureName) ||
          normalizedGestureName.includes(normalizedImageName)
        );
      });
    }
    if (!foundImage) {
      foundImage = SignImageData.find(
        (image) => image.name.toLowerCase() === gestureName.toLowerCase()
      );
    }
    return foundImage;
  };

  // Update current image when gesture detected
  useEffect(() => {
    if (gestureOutput && gestureOutput.trim() !== "") {
      const matchingImage = findImageForGesture(gestureOutput);
      if (matchingImage) {
        setCurrentImage(matchingImage);
      } else {
        setCurrentImage({
          name: "Unknown",
          url: "/logo192.png",
        });
      }
    }
  }, [gestureOutput]);

  const predictWebcam = useCallback(() => {
    if (runningMode === "IMAGE") {
      setRunningMode("VIDEO");
      gestureRecognizer.setOptions({ runningMode: "VIDEO" });
    }

    let nowInMs = Date.now();
    const results = gestureRecognizer.recognizeForVideo(
      webcamRef.current.video,
      nowInMs
    );

    const canvasCtx = canvasRef.current.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Get the actual video dimensions from the webcam
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;
    
    // Get the displayed webcam dimensions (CSS dimensions)
    const displayWidth = webcamRef.current.video.offsetWidth;
    const displayHeight = webcamRef.current.video.offsetHeight;
    
    // Set canvas dimensions to match the displayed webcam size
    canvasRef.current.width = displayWidth;
    canvasRef.current.height = displayHeight;
    
    // Calculate scaling factors to map video coordinates to display coordinates
    const scaleX = displayWidth / videoWidth;
    const scaleY = displayHeight / videoHeight;

    // Debug logging (remove in production)
    if (results.landmarks && results.landmarks.length > 0) {
      console.log('Video dimensions:', videoWidth, 'x', videoHeight);
      console.log('Display dimensions:', displayWidth, 'x', displayHeight);
      console.log('Scaling factors:', scaleX, scaleY);
      console.log('First landmark:', results.landmarks[0][0]);
    }

    if (results.landmarks) {
      for (const landmarks of results.landmarks) {
        // Transform landmarks to match the display coordinates using helper function
        const transformedLandmarks = transformLandmarks(
          landmarks, 
          videoWidth, 
          videoHeight, 
          displayWidth, 
          displayHeight
        );
        
        drawConnectors(canvasCtx, transformedLandmarks, HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 5,
        });
        drawLandmarks(canvasCtx, transformedLandmarks, { color: "#FF0000", lineWidth: 2 });
      }
    }
    
    if (results.gestures.length > 0) {
      const detectedGesture = results.gestures[0][0].categoryName;
      const confidence = parseFloat(results.gestures[0][0].score);
      
      // Only update if confidence is high enough and gesture is different
      if (confidence > 0.5 && detectedGesture !== gestureOutput) {
        setDetectedData((prevData) => [
          ...prevData,
          {
            SignDetected: detectedGesture,
          },
        ]);

        setGestureOutput(detectedGesture);
        setProgress(Math.round(confidence * 100));
        
        // Reset the gesture timeout when a new gesture is detected
        if (gestureTimeout) {
          clearTimeout(gestureTimeout);
        }
      }
    } else {
      // No gesture detected - but don't immediately clear to allow for processing
      // Only clear after a longer delay to ensure the last gesture is captured
      if (gestureOutput) {
        setTimeout(() => {
          if (results.gestures.length === 0) {
            setGestureOutput("");
            setProgress("");
            setCurrentImage(null);
          }
        }, 800); // Increased delay to 800ms to ensure last gesture is captured
      }
    }

    if (webcamRunning === true) {
      // Set FPS to 0.5 (2000ms delay between predictions)
      setTimeout(() => {
        requestRef.current = requestAnimationFrame(predictWebcam);
      }, 2000);
    }
  }, [webcamRunning, runningMode, gestureRecognizer, gestureOutput, gestureTimeout]);

  const animate = useCallback(() => {
    requestRef.current = requestAnimationFrame(animate);
    predictWebcam();
  }, [predictWebcam]);

  const enableCam = useCallback(() => {
    if (!gestureRecognizer || isLoading) {
      alert("Please wait for gesture recognizer to load");
      return;
    }

    if (webcamRunning === true) {
      setWebcamRunning(false);
      cancelAnimationFrame(requestRef.current);
      setCurrentImage(null);
      
      // Save current sentence if building
      if (isBuildingSentence && currentSentence.trim() !== "") {
        saveSentenceToHistory();
      }

      const endTime = new Date();
      const timeElapsed = (
        (endTime.getTime() - startTime.getTime()) /
        1000
      ).toFixed(2);

      const nonEmptyData = detectedData.filter(
        (data) => data.SignDetected !== "" && data.DetectedScore !== ""
      );

      const resultArray = [];
      let current = nonEmptyData[0];

      for (let i = 1; i < nonEmptyData.length; i++) {
        if (nonEmptyData[i].SignDetected !== current.SignDetected) {
          resultArray.push(current);
          current = nonEmptyData[i];
        }
      }
      resultArray.push(current);

      const countMap = new Map();
      for (const item of resultArray) {
        const count = countMap.get(item.SignDetected) || 0;
        countMap.set(item.SignDetected, count + 1);
      }

      const sortedArray = Array.from(countMap.entries()).sort(
        (a, b) => b[1] - a[1]
      );

      const outputArray = sortedArray
        .slice(0, 5)
        .map(([sign, count]) => ({ SignDetected: sign, count }));

      const data = {
        signsPerformed: outputArray,
        id: uuidv4(),
        username: user?.name,
        userId: user?.userId,
        createdAt: String(endTime),
        secondsSpent: Number(timeElapsed),
      };

      dispatch(addSignData(data));
      setDetectedData([]);
    } else {
      setWebcamRunning(true);
      startTime = new Date();
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [
    webcamRunning,
    gestureRecognizer,
    animate,
    detectedData,
    user?.name,
    user?.userId,
    dispatch,
    isLoading,
    isBuildingSentence,
    currentSentence,
  ]);

  useEffect(() => {
    async function loadGestureRecognizer() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "/sign_language_recognizer_25-04-2023.task",
          },
          numHands: 2,
          runningMode: runningMode,
        });

        setGestureRecognizer(recognizer);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading custom gesture recognizer:", error);
        setIsLoading(false);
        alert("Failed to load gesture recognizer. Please refresh the page.");
      }
    }
    loadGestureRecognizer();
  }, [runningMode]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (gestureTimeout) {
        clearTimeout(gestureTimeout);
      }
    };
  }, [gestureTimeout]);

  return (
    <>
      <div className="signlang_detection-container">
        <div className="image-glass"></div>
        {accessToken ? (
          <>
            <div style={{ position: "relative" }}>
              <div className="signlang_webcam">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  style={{ 
                    width: "100%", 
                    height: "100%",
                    objectFit: "cover",
                    display: "block"
                  }}
                />
                <canvas ref={canvasRef} className="signlang_canvas" />
              </div>
              <div className="signlang_data-container">
                <button onClick={enableCam} disabled={isLoading}>
                  {isLoading ? "Loading..." : webcamRunning ? "Stop" : "Start"}
                </button>
                <div className="signlang_data">
                  <p className="gesture_output">{gestureOutput}</p>
                  {progress ? <ProgressBar progress={progress} /> : null}
                </div>
              </div>
            </div>

            {/* Enhanced Text-to-Speech and Sentence Building Controls */}
            <div className="tts-container">
              <h2 className="gradient__text">Speech & Sentence Builder</h2>
              
              {/* Speech Settings */}
              <div className="speech-settings">
                <h3>Speech Settings:</h3>
                <label>
                  Rate: {rate}
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                  />
                </label>
                <label>
                  Pitch: {pitch}
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                  />
                </label>
                
                {/* Manual Sentence Completion */}
                {/* <div className="manual-completion">
                  <h4>Manual Control:</h4>
                  <button 
                    onClick={manualCompleteSentence} 
                    disabled={!currentSentence || currentSentence.trim() === ""}
                    className="complete-sentence-btn"
                  >
                    Complete Sentence Now
                  </button>
                  
                </div> */}
              </div>

              {/* Speech-to-Text Section */}
              <div className="speech-to-text-section">
                <h3>Speech-to-Text</h3>
                
                {/* Language Selection */}
                <div className="language-selector">
                  <label htmlFor="language-select">Select Language:</label>
                  <select 
                    id="language-select"
                    value={selectedLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="language-dropdown"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="gu-IN">ગુજરાતી (Gujarati)</option>
                    <option value="hi-IN">हिंदी (Hindi)</option>
                    
                  </select>
                </div>
                
                <div className="stt-controls">
                  <button 
                    onClick={isListening ? stopListening : startListening}
                    className={`mic-button ${isListening ? 'listening' : ''}`}
                    disabled={!speechRecognition}
                  >
                    {isListening ? '🛑 Stop Listening' : '🎤 Start Listening'}
                  </button>
                  
                  {!speechRecognition && (
                    <p className="stt-error">
                      Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.
                    </p>
                  )}
                </div>

                {transcript && (
                  <div className="transcript-display">
                    <h4>Live Transcript:</h4>
                    <div className="transcript-text">{transcript}</div>
                    <div className="transcript-actions">
                      <button onClick={saveSpeechToHistory} className="save-transcript-btn">
                        Save to History
                      </button>
                      <button onClick={clearTranscript} className="clear-transcript-btn">
                        Clear
                      </button>
                    </div>
                  </div>
                )}

                {/* Speech History */}
                <div className="speech-history">
                  <div className="speech-history-header">
                    <h4>Speech History:</h4>
                    <div className="speech-history-buttons">
                      <button onClick={clearAllSpeechHistory} className="clear-speech-btn">
                        Clear All
                      </button>
                      <button onClick={exportSpeechHistory} className="export-speech-btn">
                        Export
                      </button>
                    </div>
                  </div>
                  
                  {speechHistory.length > 0 ? (
                    <div className="speech-history-list">
                      {speechHistory.map((item) => (
                        <div key={item.id} className="speech-history-item">
                          <span className="speech-timestamp">{item.timestamp}</span>
                          <span className="speech-text">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-speech">No speech recorded yet. Start speaking to see your transcripts here!</p>
                  )}
                </div>
              </div>

              {/* Sentence History */}
              <div className="sentence-history">
                <div className="history-header">
                  <h3>Sentence History:</h3>
                  <div className="history-buttons">
                    <button onClick={clearAllHistory} className="clear-history-btn">
                      Clear All History
                    </button>
                    <button onClick={exportSentenceHistory} className="export-history-btn">
                      Export History
                    </button>
                  </div>
                </div>
                {sentenceHistory.length > 0 ? (
                  <div className="history-list">
                    {sentenceHistory.map((item) => (
                      <div key={item.id} className="history-item">
                        <span className="timestamp">{item.timestamp}</span>
                        <span className="sentence">{item.sentence}</span>
                        <button onClick={() => speakFromHistory(item.sentence)}>
                          Speak
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No sentences completed yet. Start building your first sentence!</p>
                )}
                <div className="storage-info">
                  <p>Storage Usage: {getStorageInfo().percentage}%</p>
                  <p>Used: {getStorageInfo().used / 1024 / 1024} MB</p>
                  <p>Total: {getStorageInfo().total / 1024 / 1024} MB</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="signlang_detection_notLoggedIn">
            <h1 className="gradient__text">Please Login !</h1>
            <img src={DisplayImg} alt="display-img" />
            <p>
              We Save Your Detection Data to show your progress and learning in
              dashboard, So please Login to Test this Detection Feature.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Detect;
