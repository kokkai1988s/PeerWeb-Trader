'use server';

/**
 * @fileOverview AI flow to generate creative descriptions for items in the inventory.
 *
 * - generateItemDescription - Generates a description for a given item.
 * - GenerateItemDescriptionInput - Input type for the generateItemDescription function.
 * - GenerateItemDescriptionOutput - Output type for the generateItemDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateItemDescriptionInputSchema = z.object({
  itemName: z.string().describe('The name of the item to describe.'),
});
export type GenerateItemDescriptionInput = z.infer<typeof GenerateItemDescriptionInputSchema>;

const GenerateItemDescriptionOutputSchema = z.object({
  description: z.string().describe('A creative description of the item.'),
});
export type GenerateItemDescriptionOutput = z.infer<typeof GenerateItemDescriptionOutputSchema>;

export async function generateItemDescription(input: GenerateItemDescriptionInput): Promise<GenerateItemDescriptionOutput> {
  return generateItemDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateItemDescriptionPrompt',
  input: {schema: GenerateItemDescriptionInputSchema},
  output: {schema: GenerateItemDescriptionOutputSchema},
  prompt: `You are a creative storyteller specializing in item descriptions for a retro-futuristic trading game. Generate a captivating description for the following item:

Item Name: {{{itemName}}}

Description: `,
});

const generateItemDescriptionFlow = ai.defineFlow(
  {
    name: 'generateItemDescriptionFlow',
    inputSchema: GenerateItemDescriptionInputSchema,
    outputSchema: GenerateItemDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
