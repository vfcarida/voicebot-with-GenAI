# Voicebot with GenAI 🤖📞

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Twilio](https://img.shields.io/badge/Twilio-Media%20Streams-red.svg)](https://twilio.com/)
[![Gemini](https://img.shields.io/badge/Gemini-1.5%20Flash-blue.svg)](https://ai.google.dev/)

An advanced, low-latency, bilingual voice assistant that connects phone calls directly to Google Gemini using Twilio Media Streams, Google Cloud Text-to-Speech (TTS), and Speech-to-Text (STT).

This project allows you to literally **call Gemini on the phone** and have a natural, interruptible conversation with generative AI.

## ✨ Features

- **Bilingual Support**: Easily configure the bot to speak **English** or **Portuguese** via an environment variable.
- **Low Latency Responses**: Utilizes WebSockets and audio streaming to achieve remarkably fast response times (~1 second).
- **Interruptible Agent**: The user can interrupt the Gemini assistant mid-sentence to ask a different question, making it feel like a real conversation.
- **Contextual Memory**: Keeps a history of the chat context during the call.
- **Call Recording**: Built-in support for Twilio call recording (optional).

## 🏗️ Architecture

1. **Twilio Media Streams**: Provides a WebSocket connection for bi-directional audio streaming during a phone call.
2. **Google Cloud STT**: Transcribes the caller's audio into text in real-time.
3. **Google Gemini (1.5 Flash)**: Receives the transcribed text, understands context, and generates intelligent responses via streaming API.
4. **Google Cloud TTS**: Synthesizes Gemini's text responses back into natural-sounding audio.

---

## 🚀 Setup Instructions

### 1. Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- A [Twilio Account](https://www.twilio.com/try-twilio) with a phone number
- A [Google Cloud Project](https://console.cloud.google.com/) with **Text-to-Speech** and **Speech-to-Text** APIs enabled
- A [Google Cloud Service Account Key](https://cloud.google.com/iam/docs/keys-create-delete) (`credentials.json`)
- A [Google Gemini API Key](https://aistudio.google.com/)
- [ngrok](https://ngrok.com/) for exposing your local server to Twilio

### 2. Environment Variables

Clone the repository and install dependencies:

```bash
npm install
```

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Your `.env` file should look like this:

```env
PORT=3000
BOT_LANGUAGE=en # Use 'en' for English or 'pt' for Portuguese
SERVER=your_ngrok_domain.ngrok-free.app
GEMINI_API_KEY=your_gemini_api_key

# Optional Call Recording
RECORDING_ENABLED=false
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
```

> **Note**: For Google Cloud credentials, ensure you have set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable pointing to your `credentials.json` file on your system.

### 3. Running the Server

Start your ngrok tunnel in a separate terminal:

```bash
ngrok http 3000
```

Start the application:

```bash
npm run dev
```

### 4. Twilio Configuration

1. Go to your Twilio Console and navigate to your active phone number.
2. Under the **"A call comes in"** webhook section, add your ngrok URL with the `/incoming` path:
   `https://your_ngrok_domain.ngrok-free.app/incoming`
3. Ensure the HTTP method is set to **POST**.
4. Save and call your Twilio number!

## 📂 Project Structure

```text
├── src/
│   ├── app.js               # Main Express & WebSocket server
│   ├── config/
│   │   └── prompts.js       # Bot prompts and greetings for EN/PT
│   └── services/
│       ├── gemini-service.js # Google Gemini logic & prompt handling
│       ├── google-tts-service.js # Google Cloud TTS streaming
│       ├── recording-service.js # Twilio call recording 
│       ├── stream-service.js    # Twilio audio stream buffer management
│       └── transcription-service.js # Google Cloud STT streaming
├── scripts/
│   ├── inbound-call.js      # Script to simulate an inbound call
│   └── outbound-call.js     # Script to trigger an outbound call via API
├── .env.example             # Environment variables template
├── package.json
└── README.md
```

## 📜 License

This project is licensed under the MIT License.
