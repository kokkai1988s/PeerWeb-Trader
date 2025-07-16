import {genkit, type Plugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const plugins: Plugin<any>[] = [];
if (process.env.GOOGLE_API_KEY) {
  plugins.push(googleAI());
}

export const ai = genkit({
  plugins,
  model: 'googleai/gemini-2.0-flash',
});
