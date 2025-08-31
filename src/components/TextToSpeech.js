import React, { useEffect, useState } from "react";

const TextToSpeech = ({ text }) => {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const synthVoices = window.speechSynthesis.getVoices();
      setVoices(synthVoices);
      setSelectedVoice(synthVoices.find(v => v.default) || synthVoices[0]);
    };

    loadVoices();

    // Some browsers load voices asynchronously
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speak = () => {
    if (!window.speechSynthesis) {
    alert("TTS is not supported in this browser.");
    return;
  }

  if (text.trim() === "") {
    alert("No text to speak!");
    return;
  }

  // Stop any previous speech before starting new one
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = selectedVoice;
  utterance.rate = rate;
  utterance.pitch = pitch;

  window.speechSynthesis.speak(utterance);

  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Text to Speech</h2>
      <textarea
        style={styles.textarea}
        rows="4"
        value={text}
        readOnly
      />

      <div style={styles.controls}>
        <label>
          Voice:
          <select
            style={styles.select}
            onChange={(e) => setSelectedVoice(voices[e.target.value])}
          >
            {voices.map((voice, index) => (
              <option key={index} value={index}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </label>

        <label>
          Rate: {rate}
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
        </label>

        <label>
          Pitch: {pitch}
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
          />
        </label>
      </div>

      <div style={styles.buttons}>
        <button style={styles.button} onClick={speak}>
          {isSpeaking ? "Stop" : "Speak"}
        </button>
        <button style={{ ...styles.button, background: "#ff4d4d" }} onClick={stopSpeaking}>
          Stop
        </button>
      </div>
    </div>
  );
};

// Inline styles for a modern look
const styles = {
  container: {
    background: "rgba(255,255,255,0.06)",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.12)",
    maxWidth: "500px",
    margin: "20px auto",
    color: "#fff",
    boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
    fontFamily: "'Poppins', sans-serif",
  },
  heading: {
    fontSize: "1.8rem",
    marginBottom: "10px",
    textAlign: "center",
    background: "linear-gradient(90deg,#ff7eb3,#ff758c,#ffb199)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "8px",
    background: "#1e1e1e",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.15)",
    marginBottom: "15px",
    resize: "none",
  },
  controls: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px",
    marginBottom: "15px",
  },
  select: {
    width: "100%",
    padding: "5px",
    borderRadius: "5px",
    fontSize: "14px",
  },
  buttons: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  },
  button: {
    padding: "10px 15px",
    background: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "0.3s",
  },
};

export default TextToSpeech;
