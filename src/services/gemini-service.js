import 'colors'; 
import { EventEmitter } from 'events';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getPromptConfig } from '../config/prompts.js';

const LANGUAGE = process.env.BOT_LANGUAGE || 'en';
const prompts = getPromptConfig(LANGUAGE);

class GeminiService extends EventEmitter {
  constructor() {
    super();
    this.genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.gemini = this.genai.getGenerativeModel({ model: 'gemini-1.5-flash'});
    console.log('Gemini instance initialized');

    this.chat = this.gemini.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: LANGUAGE === 'pt' ? "Oi!" : "Hi!" }],
        },
        {
          role: "model",
          parts: [{ text: prompts.initialGreeting }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 100,
      },
    });
  }

  async completion(message) {
    const context = prompts.systemPrompt + "\n";
    const prompt = context + message.text;
    const response = await this.chat.sendMessageStream(prompt);

    let text = '';
    for await (const chunk of response.stream) {
      const chunkText = chunk.text();
      console.log('Partial Gemini answer:', chunkText);
      text += chunkText;
    }

    if (text.length !== 0) {
      const rand = Math.floor(Math.random() * 1000) + 1;
      console.log('Final Gemini answer id:', rand);
      console.log('Final Gemini answer:', text);
      this.emit('geminireply', {
        partialResponse: text,
        partialOrder: 0,
        id: 'geminianswer' + rand
      });
    }
  }
}

export { GeminiService };
