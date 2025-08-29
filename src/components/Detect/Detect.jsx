import React, { useState, useRef, useEffect, useCallback } from "react";
import "./Detect.css";
import { v4 as uuidv4 } from "uuid";
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import {
  drawConnectors,
  drawLandmarks,
  // HAND_CONNECTIONS,
} from "@mediapipe/drawing_utils";

import { HAND_CONNECTIONS } from "@mediapipe/hands";

import Webcam from "react-webcam";
import { SignImageData } from "../../data/SignImageData";
import { useDispatch, useSelector } from "react-redux";
import { addSignData } from "../../redux/actions/signdataaction";
import ProgressBar from "./ProgressBar/ProgressBar";

import DisplayImg from "../../assests/displayGif.gif";

let startTime = "";

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

  // Function to find image based on detected gesture
  const findImageForGesture = (gestureName) => {
    console.log("Looking for gesture:", gestureName);
    console.log("Available images:", SignImageData.map(img => img.name));
    
    // Handle common variations in gesture names
    const normalizedGestureName = gestureName.toLowerCase().replace(/\s+/g, '');
    console.log("Normalized gesture name:", normalizedGestureName);
    
    // Try exact match first
    let foundImage = SignImageData.find(image => {
      const normalizedImageName = image.name.toLowerCase().replace(/\s+/g, '');
      console.log(`Comparing: "${normalizedImageName}" with "${normalizedGestureName}"`);
      return normalizedImageName === normalizedGestureName;
    });
    
    // If no exact match, try partial match
    if (!foundImage) {
      foundImage = SignImageData.find(image => {
        const normalizedImageName = image.name.toLowerCase().replace(/\s+/g, '');
        return normalizedImageName.includes(normalizedGestureName) || 
               normalizedGestureName.includes(normalizedImageName);
      });
    }
    
    // If still no match, try case-insensitive match
    if (!foundImage) {
      foundImage = SignImageData.find(image => 
        image.name.toLowerCase() === gestureName.toLowerCase()
      );
    }
    
    console.log("Found image:", foundImage);
    return foundImage;
  };

  // Update current image when gesture is detected
  useEffect(() => {
    console.log("Gesture output changed:", gestureOutput);
    if (gestureOutput && gestureOutput.trim() !== "") {
      const matchingImage = findImageForGesture(gestureOutput);
      if (matchingImage) {
        console.log("Setting current image to:", matchingImage);
        setCurrentImage(matchingImage);
      } else {
        console.log("No matching image found for gesture:", gestureOutput);
        // Show a default image or message for unrecognized gestures
        setCurrentImage({
          name: "Unknown",
          url: "/logo192.png" // Use a default image
        });
      }
    }
  }, [gestureOutput]);

  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "production"
  ) {
    console.log = function () {};
  }

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
    canvasCtx.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    // Set video width
    webcamRef.current.video.width = videoWidth;
    webcamRef.current.video.height = videoHeight;

    // Set canvas height and width
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    // Draw the results on the canvas, if any.
    if (results.landmarks) {
      for (const landmarks of results.landmarks) {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 5,
        });

        drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
      }
    }
    if (results.gestures.length > 0) {
      console.log("Detected gestures:", results.gestures);
      console.log("Category name:", results.gestures[0][0].categoryName);
      console.log("Score:", results.gestures[0][0].score);
      
      setDetectedData((prevData) => [
        ...prevData,
        {
          SignDetected: results.gestures[0][0].categoryName,
        },
      ]);

      setGestureOutput(results.gestures[0][0].categoryName);
      setProgress(Math.round(parseFloat(results.gestures[0][0].score) * 100));
    } else {
      setGestureOutput("");
      setProgress("");
      // Clear the current image when no gesture is detected
      setCurrentImage(null);
    }

    if (webcamRunning === true) {
      requestRef.current = requestAnimationFrame(predictWebcam);
    }
  }, [webcamRunning, runningMode, gestureRecognizer, setGestureOutput]);

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

      const endTime = new Date();

      const timeElapsed = (
        (endTime.getTime() - startTime.getTime()) /
        1000
      ).toFixed(2);

      // Remove empty values
      const nonEmptyData = detectedData.filter(
        (data) => data.SignDetected !== "" && data.DetectedScore !== ""
      );

      //to filter continous same signs in an array
      const resultArray = [];
      let current = nonEmptyData[0];

      for (let i = 1; i < nonEmptyData.length; i++) {
        if (nonEmptyData[i].SignDetected !== current.SignDetected) {
          resultArray.push(current);
          current = nonEmptyData[i];
        }
      }

      resultArray.push(current);

      //calculate count for each repeated sign
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

      // object to send to action creator
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
  ]);
  useEffect(() => {
    async function loadGestureRecognizer() {
      try {
        console.log("Loading custom sign language gesture recognizer...");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        // Use the custom trained sign language model
        const recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "/sign_language_recognizer_25-04-2023.task",
          },
          numHands: 2,
          runningMode: runningMode,
        });
        
        console.log("Custom sign language gesture recognizer loaded successfully!");
        setGestureRecognizer(recognizer);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading custom gesture recognizer:", error);
        setIsLoading(false);
        alert("Failed to load custom gesture recognizer. Please refresh the page and try again.");
      }
    }
    loadGestureRecognizer();
  }, [runningMode]);

  return (
    <>
      <div className="signlang_detection-container">
         <div class="image-glass"></div>
        {accessToken ? (
          <>
            <div style={{ position: "relative" }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                // screenshotFormat="image/jpeg"
                className="signlang_webcam"
              />

              <canvas ref={canvasRef} className="signlang_canvas" />

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

            <div className="signlang_imagelist-container">
              <h2 className="gradient__text">Image</h2>

              <div className="signlang_image-div">
                {currentImage ? (
                  currentImage.name === "Unknown" ? (
                    <div>
                      <img src={currentImage.url} alt="Unknown gesture" />
                      <h3 className="gradient__text">
                        Gesture detected: {gestureOutput}
                      </h3>
                    </div>
                  ) : (
                    <img src={currentImage.url} alt={`Sign for ${currentImage.name}`} />
                  )
                ) : (
                  <h3 className="gradient__text">
                    Perform a sign to see the reference image
                  </h3>
                )}
              </div>
            </div>
          </>
        ) : 
        (
          <div className="signlang_detection_notLoggedIn">

             <h1 className="gradient__text">Please Login !</h1>
             <img src={DisplayImg} alt="diplay-img"/>
             <p>
              We Save Your Detection Data to show your progress and learning in dashboard, So please Login to Test this Detection Feature.
             </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Detect;
