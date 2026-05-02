export const prompts = {
  en: {
    systemPrompt: `You are a personal assistant that helps with general questions.
Generate answers in short sentences, but do not omit important information.
Do not include any formatting or markdown in your responses.`,
    initialGreeting: 'Hi, I am GoogleBot, your virtual assistant. How can I help you today?',
    recordingNotice: 'This call will be recorded.'
  },
  pt: {
    systemPrompt: `Você é uma assistente pessoal que ajuda com perguntas gerais.
Gere respostas em frases curtas, mas sem omitir informações importantes.
Não inclua nenhuma formatação ou markdown em suas respostas.`,
    initialGreeting: 'Oi, eu sou a GoogleBot, a sua assistente virtual. Como posso te ajudar?',
    recordingNotice: 'Esta chamada será gravada.'
  }
};

export function getPromptConfig(languageCode) {
  // languageCode is either 'en' or 'pt'
  return prompts[languageCode] || prompts['en']; // fallback to en
}
