import 'dotenv/config';
import 'colors';

import express from 'express';
import ExpressWs from 'express-ws';
import { GeminiService } from './services/gemini-service.js';
import { StreamService } from './services/stream-service.js';
import { TranscriptionService } from './services/transcription-service.js';
import { TextToSpeechService } from './services/google-tts-service.js';
import { recordingService } from './services/recording-service.js';
import { getPromptConfig } from './config/prompts.js';
import twilio from 'twilio';

const VoiceResponse = twilio.twiml.VoiceResponse;

// Initializes the Express server
const app = express();
ExpressWs(app);

const PORT = process.env.PORT || 3000;
const LANGUAGE = process.env.BOT_LANGUAGE || 'en';
const prompts = getPromptConfig(LANGUAGE);

// Endpoint for handling incoming Twilio calls
app.post('/incoming', (req, res) => {
  try {
    const response = new VoiceResponse();
    const connect = response.connect();
    connect.stream({ url: `wss://${process.env.SERVER}/connection` });
  
    res.type('text/xml');
    res.end(response.toString());
  } catch (err) {
    console.log(err);
  }
});

// Websocket endpoint for managing the audio stream and conversation
app.ws('/connection', (ws) => {
  try {
    ws.on('error', console.error);
    // Filled in from start message
    let streamSid;
    let callSid;

    const gemini = new GeminiService();
    const streamService = new StreamService(ws);
    const transcriptionService = new TranscriptionService();
    const ttsService = new TextToSpeechService({});
  
    let marks = [];
  
    // Incoming messages from MediaStream
    ws.on('message', async function message(data) {
      const msg = JSON.parse(data);
      if (msg.event === 'start') {
        streamSid = msg.start.streamSid;
        callSid = msg.start.callSid;
        
        streamService.setStreamSid(streamSid);

        if (process.env.RECORDING_ENABLED === 'true') {
          await recordingService(ttsService, callSid, prompts.recordingNotice);
        }
        
        // First message
        transcriptionService.startSTT();
        ttsService.generate({
          partialResponse: prompts.initialGreeting, 
          partialOrder: 0, 
          id: 'firstmessage'
        });

      } else if (msg.event === 'media') {
        // Ignore media messages if the transcription stream is destroyed
        if (transcriptionService.recognizeStream.destroyed) return;

        transcriptionService.send(msg.media.payload);
      } else if (msg.event === 'mark') {
        const label = msg.mark.name;
        console.log(`Twilio -> Audio completed mark (${msg.sequenceNumber}): ${label}`.red);
        // Remove mark from list
        marks = marks.filter(m => m !== msg.mark.name);
      } else if (msg.event === 'stop') {
        // Destroy transcription stream
        transcriptionService.recognizeStream.destroy();
        console.log(`Twilio -> Media stream ${streamSid} ended.`.underline.red);
      }
    });
  
    // Event handler for recognized utterances
    transcriptionService.on('utterance', async (text) => {
      // Filter out empty utterances
      if(marks.length > 0 && text?.length > 5) {
        console.log('Twilio -> Interruption, Clearing stream'.red);
        // Send clear message to websocket to reset the stream
        ws.send(
          JSON.stringify({
            streamSid,
            event: 'clear',
          })
        );
      }
    });
  
    // Event handler for transcription completion
    transcriptionService.on('transcription', async (message) => {
      if (!message.text) { return; }
      console.log(`Interaction: STT -> Gemini: ${message.text}`.yellow);
      gemini.completion(message);
    });
    
    // Event handler for Gemini response
    gemini.on('geminireply', async (message) => {
      console.log(`Interaction: Gemini -> TTS: ${message.partialResponse}`.green );
      ttsService.generate(message);
    });
  
    // Event handler for synthesized speech
    ttsService.on('speech', (audio, message) => {
      console.log(`TTS -> TWILIO: ${message.partialResponse}`.blue);
  
      streamService.buffer(audio, message);
    });
  
    // Event handler for audio sent to Twilio
    streamService.on('audiosent', (markLabel) => {
      marks.push(markLabel);
    });
  } catch (err) {
    console.log(err);
  }
});

// Loads data and starts the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} with language ${LANGUAGE}`);
});
