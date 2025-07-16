'use server';
/**
 * @fileOverview An AI agent for generating trader trust ratings.
 *
 * - generateTraderTrustRating - A function that generates a trust rating for a trader.
 * - GenerateTraderTrustRatingInput - The input type for the generateTraderTrustRating function.
 * - GenerateTraderTrustRatingOutput - The return type for the generateTraderTrustRating function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTraderTrustRatingInputSchema = z.object({
  transactionHistory: z
    .string()
    .describe('The transaction history of the trader.'),
  networkActivity: z.string().describe('The network activity of the trader.'),
  communityReports: z.string().describe('Community reports about the trader.'),
});
export type GenerateTraderTrustRatingInput = z.infer<
  typeof GenerateTraderTrustRatingInputSchema
>;

const GenerateTraderTrustRatingOutputSchema = z.object({
  trustRating: z
    .number()
    .describe(
      'A numerical trust rating for the trader, ranging from 0 to 100.'
    ),
  explanation: z
    .string()
    .describe('An explanation of the trust rating based on the input data.'),
});
export type GenerateTraderTrustRatingOutput = z.infer<
  typeof GenerateTraderTrustRatingOutputSchema
>;

export async function generateTraderTrustRating(
  input: GenerateTraderTrustRatingInput
): Promise<GenerateTraderTrustRatingOutput> {
  return generateTraderTrustRatingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTraderTrustRatingPrompt',
  input: {schema: GenerateTraderTrustRatingInputSchema},
  output: {schema: GenerateTraderTrustRatingOutputSchema},
  prompt: `You are an AI assistant that assesses the trustworthiness of traders in a decentralized peer-to-peer network.

You are given the following information about a trader:

Transaction History: {{{transactionHistory}}}
Network Activity: {{{networkActivity}}}
Community Reports: {{{communityReports}}}

Based on this information, generate a trust rating (0-100) and explain your reasoning.

Output:
Rating: {{trustRating}}
Explanation: {{explanation}}`,
});

const generateTraderTrustRatingFlow = ai.defineFlow(
  {
    name: 'generateTraderTrustRatingFlow',
    inputSchema: GenerateTraderTrustRatingInputSchema,
    outputSchema: GenerateTraderTrustRatingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
