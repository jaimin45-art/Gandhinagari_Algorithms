import React, { useState, useEffect } from "react";
import "./Assessment.css";
import { FaCheck, FaTimes, FaArrowLeft, FaPlay, FaPause } from "react-icons/fa";
import { SignImageData } from "../../data/SignImageData";

const Assessment = ({ assessmentType, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [userAnswers, setUserAnswers] = useState([]);

  // Assessment questions based on type
  const getQuestions = () => {
    switch (assessmentType) {
      case "alphabet-quiz":
        return [
          {
            question: "What letter is this sign?",
            image: SignImageData.find(img => img.name === "A")?.url,
            options: ["A", "B", "C", "D"],
            correct: "A"
          },
          {
            question: "Spell the word 'HELLO' using ASL alphabet",
            options: ["H-E-L-L-O", "H-E-L-O", "H-E-L-L", "H-E-L"],
            correct: "H-E-L-L-O"
          },
          {
            question: "Which letter is this sign?",
            image: SignImageData.find(img => img.name === "M")?.url,
            options: ["M", "N", "W", "V"],
            correct: "M"
          },
          {
            question: "What letter is this sign?",
            image: SignImageData.find(img => img.name === "S")?.url,
            options: ["S", "T", "U", "V"],
            correct: "S"
          },
          {
            question: "Spell 'ASL' using the alphabet",
            options: ["A-S-L", "A-S", "S-L", "A-L"],
            correct: "A-S-L"
          }
        ];
      
      case "numbers-quiz":
        return [
          {
            question: "What number is this sign?",
            description: "Show the sign for number 5",
            options: ["3", "4", "5", "6"],
            correct: "5"
          },
          {
            question: "Count from 1 to 5 in ASL",
            options: ["1-2-3-4-5", "1-2-3-4", "1-2-3", "1-2"],
            correct: "1-2-3-4-5"
          },
          {
            question: "What number is this sign?",
            description: "Show the sign for number 10",
            options: ["8", "9", "10", "11"],
            correct: "10"
          },
          {
            question: "Sign the number 25",
            options: ["20-5", "25", "2-5", "Twenty-five"],
            correct: "25"
          },
          {
            question: "What number is this sign?",
            description: "Show the sign for number 100",
            options: ["50", "75", "100", "150"],
            correct: "100"
          }
        ];

      case "phrases-quiz":
        return [
          {
            question: "Sign 'Hello, how are you?'",
            options: ["Hello + How + You", "Hello + You + How", "How + Hello + You", "You + Hello + How"],
            correct: "Hello + How + You"
          },
          {
            question: "What does this phrase mean?",
            description: "Show the sign for 'Thank you'",
            options: ["Please", "Thank you", "You're welcome", "Sorry"],
            correct: "Thank you"
          },
          {
            question: "Respond to 'Thank you'",
            options: ["You're welcome", "Thank you", "Please", "Sorry"],
            correct: "You're welcome"
          },
          {
            question: "Sign 'My name is...'",
            options: ["My + Name + Is", "Name + My + Is", "Is + My + Name", "My + Is + Name"],
            correct: "My + Name + Is"
          },
          {
            question: "What does this phrase mean?",
            description: "Show the sign for 'Nice to meet you'",
            options: ["Hello", "Goodbye", "Nice to meet you", "Thank you"],
            correct: "Nice to meet you"
          }
        ];

      case "vocabulary-quiz":
        return [
          {
            question: "Identify the family member sign",
            description: "Show the sign for 'Mother'",
            options: ["Father", "Mother", "Sister", "Brother"],
            correct: "Mother"
          },
          {
            question: "What emotion is being expressed?",
            description: "Show the sign for 'Happy'",
            options: ["Sad", "Happy", "Angry", "Surprised"],
            correct: "Happy"
          },
          {
            question: "Match the sign to its meaning",
            description: "Show the sign for 'Learn'",
            options: ["Teach", "Learn", "Study", "Read"],
            correct: "Learn"
          },
          {
            question: "Identify the color sign",
            description: "Show the sign for 'Blue'",
            options: ["Red", "Blue", "Green", "Yellow"],
            correct: "Blue"
          },
          {
            question: "What action is this sign?",
            description: "Show the sign for 'Eat'",
            options: ["Drink", "Eat", "Cook", "Sleep"],
            correct: "Eat"
          }
        ];

      default:
        return [];
    }
  };

  const questions = getQuestions();

  useEffect(() => {
    let timer;
    if (isTimerRunning && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      finishAssessment();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, isTimerRunning]);

  const handleAnswer = (answer) => {
    const isCorrect = answer === questions[currentQuestion].correct;
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setUserAnswers([...userAnswers, { question: currentQuestion, answer, correct: isCorrect }]);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishAssessment();
    }
  };

  const finishAssessment = () => {
    setIsTimerRunning(false);
    setShowResults(true);
  };

  const restartAssessment = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setTimeLeft(300);
    setIsTimerRunning(true);
    setUserAnswers([]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAssessmentTitle = () => {
    switch (assessmentType) {
      case "alphabet-quiz": return "ASL Alphabet Quiz";
      case "numbers-quiz": return "ASL Numbers Quiz";
      case "phrases-quiz": return "ASL Phrases Quiz";
      case "vocabulary-quiz": return "ASL Vocabulary Quiz";
      default: return "ASL Assessment";
    }
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 90) return "Excellent! You're a natural!";
    if (percentage >= 80) return "Great job! Keep practicing!";
    if (percentage >= 70) return "Good work! You're improving!";
    if (percentage >= 60) return "Not bad! More practice needed.";
    return "Keep studying! Practice makes perfect!";
  };

  if (showResults) {
    return (
      <div className="assessment-container">
        <div className="assessment-header">
          <button className="back-btn" onClick={onClose}>
            <FaArrowLeft /> Back to Resources
          </button>
          <h1>{getAssessmentTitle()} - Results</h1>
        </div>
        
        <div className="results-container">
          <div className="score-display">
            <h2>Your Score: {score}/{questions.length}</h2>
            <div className="score-percentage">
              {Math.round((score / questions.length) * 100)}%
            </div>
            <p className="score-message">{getScoreMessage()}</p>
          </div>

          <div className="question-review">
            <h3>Question Review:</h3>
            {questions.map((q, index) => (
              <div key={index} className={`review-item ${userAnswers[index]?.correct ? 'correct' : 'incorrect'}`}>
                <div className="review-question">
                  <span className="question-number">Q{index + 1}:</span>
                  {q.question}
                </div>
                <div className="review-answer">
                  <span>Your answer: {userAnswers[index]?.answer}</span>
                  <span>Correct answer: {q.correct}</span>
                  {userAnswers[index]?.correct ? <FaCheck className="correct-icon" /> : <FaTimes className="incorrect-icon" />}
                </div>
              </div>
            ))}
          </div>

          <div className="assessment-actions">
            <button className="restart-btn" onClick={restartAssessment}>
              Try Again
            </button>
            <button className="close-btn" onClick={onClose}>
              Back to Resources
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-container">
      <div className="assessment-header">
        <button className="back-btn" onClick={onClose}>
          <FaArrowLeft /> Back to Resources
        </button>
        <h1>{getAssessmentTitle()}</h1>
        <div className="assessment-info">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>Score: {score}</span>
          <div className="timer">
            <button 
              className="timer-btn" 
              onClick={() => setIsTimerRunning(!isTimerRunning)}
            >
              {isTimerRunning ? <FaPause /> : <FaPlay />}
            </button>
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      <div className="question-container">
        <div className="question">
          <h2>{questions[currentQuestion].question}</h2>
          {questions[currentQuestion].description && (
            <p className="question-description">{questions[currentQuestion].description}</p>
          )}
          {questions[currentQuestion].image && (
            <div className="question-image">
              <img src={questions[currentQuestion].image} alt="ASL Sign" />
            </div>
          )}
        </div>

        <div className="options">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              className="option-btn"
              onClick={() => handleAnswer(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Assessment;
