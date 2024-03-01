import React from 'react';
import { useState, useEffect } from 'react';
import { useRecorder } from './components/Audio';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff'; // If you want to change the icon
import TranscriptionPopup from './components/TranscriptionPopup';
import {Box, Fab, Typography } from '@mui/material';
function App() {

    const { isRecording, startRecording, stopRecording, sendAudioToServer } = useRecorder();
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [parsedcontent, setParsedcontent] = useState('');
            const handleAudioRecording = async () => {
            if (!isRecording) {
                startRecording();
                setIsPopupOpen(false);
            } else {
                // Second click: Stop recording, send audio for transcription
                stopRecording();
                try {
                    const transcriptionText = await sendAudioToServer();
                    console.log(transcriptionText);
                    setTranscription(transcriptionText);
                    
                    //Send transcriptionText for parsing to the server
                    const response = await fetch('http://localhost:5000/parse-prescription', {
                        method: 'POST',
                        //mode: 'no-cors',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ transcriptionText })
                    });
                    if (!response.ok) {
                        throw new Error('Failed to parse prescription text');
                    }
                    const {"parsedContent": text_content} = await response.json(); // Adjusted to match the Flask response structure
                    console.log(text_content);
                    setParsedcontent(text_content); // This should now correctly update state
                    setIsPopupOpen(true); // Show popup with transcription text
                } catch (error) {
                    console.error('Error during transcription or parsing:', error);
                    setTranscription('Error transcribing or parsing audio.');
                }
            }
        };

    return (
        <div className="App">
        <Box
            sx={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                display: 'flex',
                alignItems: 'center'
            }}>
            <Typography variant="caption" className="blinking-text" sx={{ fontSize: '20px', marginRight: 2 }}>
                Talk To GPT! 
            </Typography>
            <Fab
                    color="primary"
                    aria-label="record"
                    onClick={handleAudioRecording}
                    sx={{ marginRight: 3 }}>
                    {isRecording ? <MicIcon /> : <MicOffIcon />}
            </Fab>
        </Box>
    <div>
        <TranscriptionPopup open={isPopupOpen} transcription={transcription} onClose={() => setIsPopupOpen(false)} />
    </div>
    {/*==== end of what is Added by Ana====== */}

          
        </div>
    );
}
export default App;
