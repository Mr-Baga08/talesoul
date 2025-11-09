import React, { useRef, useEffect, useState } from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ videoUrl, onProgress }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const percent = (video.currentTime / video.duration) * 100;
      setProgress(percent);
      setCurrentTime(video.currentTime);

      // Report progress to parent component
      if (onProgress) {
        onProgress(percent);
      }
    };

    const updateDuration = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', updateDuration);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [onProgress]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    const percent = parseFloat(e.target.value);
    const seekTime = (percent / 100) * video.duration;
    video.currentTime = seekTime;
    setProgress(percent);
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  if (!videoUrl) {
    return (
      <div className="video-player-container">
        <div className="no-video">
          <p>No video available for this course yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-player-container">
      <video
        ref={videoRef}
        className="video-element"
        src={videoUrl}
        onClick={togglePlay}
      />

      <div className="video-controls">
        <button onClick={togglePlay} className="control-btn">
          {isPlaying ? '⏸' : '▶'}
        </button>

        <div className="progress-container">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="progress-slider"
          />
        </div>

        <div className="time-display">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        <button onClick={toggleMute} className="control-btn">
          {isMuted ? '🔇' : '🔊'}
        </button>

        <div className="volume-container">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
        </div>

        <button onClick={toggleFullscreen} className="control-btn">
          ⛶
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;
