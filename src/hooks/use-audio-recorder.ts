"use client";

import { useState, useRef, useCallback } from 'react';

type AudioRecorderState = 'inactive' | 'recording' | 'paused';

export const useAudioRecorder = () => {
  const [recorderState, setRecorderState] = useState<AudioRecorderState>('inactive');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstart = () => {
        setRecorderState('recording');
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("Error starting recording:", err);
      // Handle permission denied or other errors
      throw new Error("Microphone access denied or recording failed to start.");
    }
  }, []);

  const stopRecording = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        return reject(new Error('MediaRecorder is not active.'));
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          resolve(base64Data);
        };
        reader.onerror = (error) => {
          reject(error);
        };

        // Clean up stream
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
        setRecorderState('inactive');
      };

      if (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.stop();
      }
    });
  }, []);

  const isRecording = recorderState === 'recording';

  return { isRecording, startRecording, stopRecording };
};
