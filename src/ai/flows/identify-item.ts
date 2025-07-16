'use server';

/**
 * @fileOverview An AI agent for identifying items from images.
 *
 * - identifyItem - A function that identifies an item from a photo.
 * - IdentifyItemInput - The input type for the identifyItem function.
 * - IdentifyItemOutput - The return type for the identifyItem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyItemInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of an item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyItemInput = z.infer<typeof IdentifyItemInputSchema>;

const IdentifyItemOutputSchema = z.object({
    name: z.string().describe("A suitable, creative, and lore-friendly name for the item shown in the photo. The name should be in Thai."),
    description: z.string().describe("A short, one-sentence, interesting description of the item. The description should be in Thai."),
});
export type IdentifyItemOutput = z.infer<typeof IdentifyItemOutputSchema>;

export async function identifyItem(input: IdentifyItemInput): Promise<IdentifyItemOutput> {
  return identifyItemFlow(input);
}

const prompt = ai.definePrompt({
    name: 'identifyItemPrompt',
    input: {schema: IdentifyItemInputSchema},
    output: {schema: IdentifyItemOutputSchema},
    prompt: `You are an AI assistant for a retro-futuristic trading game. Your task is to analyze the provided image of an item and give it a creative, thematic name and a brief description in Thai.

The theme is cyberpunk, retro-futuristic, and involves trading salvaged tech, artifacts, and components.

Analyze the image and generate a suitable name and a short, one-sentence description.

Image: {{media url=photoDataUri}}

Output the name and description in Thai.`,
});

const identifyItemFlow = ai.defineFlow(
    {
        name: 'identifyItemFlow',
        inputSchema: IdentifyItemInputSchema,
        outputSchema: IdentifyItemOutputSchema,
    },
    async input => {
        const {output} = await prompt(input);
        return output!;
    }
);
