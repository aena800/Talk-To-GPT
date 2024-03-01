import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

const TranscriptionPopup = ({ open, transcription, text_content, onClose }) => {
    const content = transcription + text_content;

    return (
        <Dialog open={open} onClose={onClose} aria-labelledby="transcription-dialog-title">
            <DialogTitle>Audio Transcription</DialogTitle>
            <DialogContent>
                <DialogContentText>{content}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default TranscriptionPopup;
