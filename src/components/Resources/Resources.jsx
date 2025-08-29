import React, { useState } from "react";
import "./Resources.css";
import { FaYoutube, FaBook, FaFilePdf, FaExternalLinkAlt, FaPlay, FaDownload } from "react-icons/fa";
import { SignImageData } from "../../data/SignImageData";
import { 
  learningVideos, 
  learningMaterials, 
  usefulLinks, 
  practiceExercises, 
  learningTips 
} from "../../data/ResourcesData";
import Assessment from "../Assessment/Assessment";

const Resources = () => {
  const [activeTab, setActiveTab] = useState("videos");
  const [currentAssessment, setCurrentAssessment] = useState(null);

  const renderVideos = () => (
    <div className="resources-grid">
      {learningVideos.map((video) => (
        <div key={video.id} className="resource-card video-card">
          <div className="video-thumbnail">
            <img src={video.thumbnail} alt={video.title} />
            <div className="video-overlay">
              <FaPlay className="play-icon" />
            </div>
            <span className="video-duration">{video.duration}</span>
            <span className="video-category">{video.category}</span>
          </div>
          <div className="resource-content">
            <h3>{video.title}</h3>
            <p>{video.description}</p>
            <a 
              href={video.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="resource-link"
            >
              <FaYoutube /> Watch Video
            </a>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMaterials = () => (
    <div className="resources-grid">
      {learningMaterials.map((material) => (
        <div key={material.id} className="resource-card material-card">
          <div className="material-icon">
            <FaFilePdf />
          </div>
          <div className="resource-content">
            <h3>{material.title}</h3>
            <p>{material.description}</p>
            <div className="material-meta">
              <span className="material-type">{material.type}</span>
              <span className="material-category">{material.category}</span>
              {material.fileSize && <span className="material-size">{material.fileSize}</span>}
            </div>
            <a 
              href={material.downloadUrl} 
              className="resource-link"
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaDownload /> Download
            </a>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLinks = () => (
    <div className="resources-grid">
      {usefulLinks.map((link) => (
        <div key={link.id} className="resource-card link-card">
          <div className="link-icon">
            <FaExternalLinkAlt />
          </div>
          <div className="resource-content">
            <h3>{link.title}</h3>
            <p>{link.description}</p>
            <div className="link-meta">
              <span className="link-category">{link.category}</span>
            </div>
            <a 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="resource-link"
            >
              <FaExternalLinkAlt /> Visit Site
            </a>
          </div>
        </div>
      ))}
    </div>
  );

  const renderExercises = () => (
    <div className="resources-grid">
      {practiceExercises.map((exercise) => (
        <div key={exercise.id} className="resource-card exercise-card">
          <div className="exercise-icon">
            <FaBook />
          </div>
          <div className="resource-content">
            <h3>{exercise.title}</h3>
            <p>{exercise.description}</p>
            <div className="exercise-meta">
              <span className="exercise-difficulty">{exercise.difficulty}</span>
              <span className="exercise-time">{exercise.estimatedTime}</span>
            </div>
            {exercise.exercises && (
              <div className="exercise-details">
                <h4>Includes:</h4>
                <ul>
                  {exercise.exercises.map((ex, index) => (
                    <li key={index}>{ex}</li>
                  ))}
                </ul>
              </div>
            )}
            <button 
              className="resource-link exercise-btn"
              onClick={() => setCurrentAssessment(exercise.assessmentUrl.split('/').pop())}
            >
              Start Practice
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAlphabetGuide = () => (
    <div className="alphabet-guide">
      <h2>ASL Alphabet Reference</h2>
      <div className="alphabet-grid">
        {SignImageData.slice(0, 26).map((letter) => (
          <div key={letter.name} className="alphabet-item">
            <img src={letter.url} alt={`ASL sign for letter ${letter.name}`} />
            <span className="letter-name">{letter.name}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // If an assessment is active, show the assessment component
  if (currentAssessment) {
    return (
      <Assessment 
        assessmentType={currentAssessment} 
        onClose={() => setCurrentAssessment(null)} 
      />
    );
  }

  return (
    <div className="resources-container">
      <div className="resources-header">
        <h1 className="gradient__text">Learning Resources</h1>
        <p>Comprehensive materials to help you learn American Sign Language</p>
      </div>

      <div className="resources-tabs">
        <button 
          className={`tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          <FaYoutube /> Videos
        </button>
        <button 
          className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
          onClick={() => setActiveTab('materials')}
        >
          <FaFilePdf /> Materials
        </button>
        <button 
          className={`tab-btn ${activeTab === 'links' ? 'active' : ''}`}
          onClick={() => setActiveTab('links')}
        >
          <FaExternalLinkAlt /> Links
        </button>
        <button 
          className={`tab-btn ${activeTab === 'exercises' ? 'active' : ''}`}
          onClick={() => setActiveTab('exercises')}
        >
          <FaBook /> Practice
        </button>
        <button 
          className={`tab-btn ${activeTab === 'alphabet' ? 'active' : ''}`}
          onClick={() => setActiveTab('alphabet')}
        >
          <FaBook /> Alphabet
        </button>
      </div>

      <div className="resources-content">
        {activeTab === 'videos' && renderVideos()}
        {activeTab === 'materials' && renderMaterials()}
        {activeTab === 'links' && renderLinks()}
        {activeTab === 'exercises' && renderExercises()}
        {activeTab === 'alphabet' && renderAlphabetGuide()}
      </div>

      <div className="resources-footer">
        <div className="learning-tips">
          <h3>Learning Tips</h3>
          <ul>
            {learningTips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Resources;
