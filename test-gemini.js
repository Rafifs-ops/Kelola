import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const modelName = 'gemini-1.5-flash';

async function test() {
  console.log('Testing model:', modelName);
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Hi');
    const response = await result.response;
    console.log('Success! Response:', response.text());
  } catch (err) {
    console.error('Error during API call:', err.message);
    if (err.message.includes('404') || err.message.includes('not found')) {
      console.log('Model name likely invalid.');
    }
  }
}

test();
