// Handles recording of audio by the dctor
import { useState, useEffect } from 'react';

export const useRecorder = () => {
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioData, setAudioData] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            const recorder = new MediaRecorder(stream);
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    setAudioData((currentData) => [...currentData, event.data]);
                }
            };
            setMediaRecorder(recorder);
        });
    }, []);

    const startRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'inactive') {
            mediaRecorder.start(1000);
            setIsRecording(true);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };
    const sendAudioToServer = async () => {
        const audioBlob = new Blob(audioData, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio', audioBlob);
        try {
            const response = await fetch('http://localhost:5000/transcribe', {
                method: 'POST',
                body: formData
            });
            const data = await response.json(); // data = {text: "Your transcription here"}
            setTranscription(data.text); // Correctly extract and set the transcription text
            return data.text; // Update the transcription state with the server response
        } catch (error) {
            console.error('Error sending audio to server:', error);
            setTranscription('Error transcribing audio.'); // Update the transcription state in case of error
            throw error; // Rethrow the error to handle it in the calling function
        }
    };

    return { isRecording, startRecording, stopRecording, sendAudioToServer, transcription, setTranscription };
};
