import React, { useState, useRef } from "react";
import "./ImageGenerator.css";
import OpenAI from "openai";
import defaultImg from "../Assets/Logo.jpg";

const ImageGenerator = () => {
  const [imageUrl, setImageURL] = useState(null);
  const [transcription, setTranscription] = useState("");
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);

  const openai = new OpenAI({ apiKey: "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", dangerouslyAllowBrowser: true });

  const imageGenerator = async () => {
    if (inputRef.current.value === "") {
      return;
    }

    try {
      const response = await openai.images.generate({
        prompt: inputRef.current.value,
        n: 1,
        size: "1024x1024",
      });

      const generatedImageUrl = response.data[0].url;
      setImageURL(generatedImageUrl);
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          const audioUrl = URL.createObjectURL(audioBlob);

          handleAudioTranscription(audioBlob);

          setIsRecording(false);
          audioChunksRef.current = [];
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
      });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleAudioTranscription = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);

      const response = await fetch("http://localhost:3000/transcribe", {
        method: "POST",
        body: formData,
      });

      const transcriptionData = await response.json();

      setTranscription(transcriptionData.transcription);
    } catch (error) {
      console.error("Error transcribing audio:", error);
    }
  };

  return (
    <div className="ai-image-generator">
      <div className="header">
        <span>Ai Image Generator</span>
        <div className="img-loading">
          {imageUrl ? <img src={imageUrl} alt="" /> : <img src={defaultImg} alt="" />}
        </div>
        <div className="text-box">
          <input
            type="text"
            ref={inputRef}
            className="generator-input"
            placeholder="Describe your innovation!"
          />
          <div className="generator-btn" onClick={imageGenerator}>
            Generate
          </div>
        </div>
        <div className="speech-to-text">
          <div className="transcription-btn" onClick={isRecording ? stopRecording : startRecording}>
            {isRecording ? "Stop Recording" : "Start Recording"}
          </div>
          <div className="transcription">
            <p>{transcription}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
