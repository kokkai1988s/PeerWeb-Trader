
'use server';

/**
 * @fileOverview A personal AI assistant for the PeerWeb Trader application.
 *
 * - getAssistantResponse - A function that handles getting a response from the AI assistant.
 * - PersonalAssistantInput - The input type for the getAssistantResponse function.
 * - PersonalAssistantOutput - The return type for the getAssistantResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getChatHistory, type ChatMessage, getItems, type Item } from '@/services/data-service';

// Tool to get the list of items in the user's inventory
const getItemsTool = ai.defineTool(
    {
        name: 'getItems',
        description: "Get a list of all items currently in the user's inventory.",
        inputSchema: z.object({}),
        outputSchema: z.array(z.object({ id: z.string(), name: z.string() })),
    },
    async (input, context) => {
        if (!context?.auth?.userId) {
            throw new Error("User not authenticated");
        }
        const items = await getItems(context.auth.userId);
        return items.map(item => ({ id: item.id!, name: item.name }));
    }
);

// Tool to get details for a specific item
const getItemDetailsTool = ai.defineTool(
    {
        name: 'getItemDetails',
        description: "Get the full details of a specific item in the user's inventory using its name.",
        inputSchema: z.object({ itemName: z.string().describe("The exact name of the item to look for.") }),
        outputSchema: z.object({
            id: z.string(),
            name: z.string(),
            description: z.string().optional(),
            imageCount: z.number(),
        }).nullable(),
    },
    async ({ itemName }, context) => {
        if (!context?.auth?.userId) {
            throw new Error("User not authenticated");
        }
        const items = await getItems(context.auth.userId);
        const foundItem = items.find(item => item.name.toLowerCase() === itemName.toLowerCase());
        if (!foundItem) {
            return null;
        }
        return {
            id: foundItem.id!,
            name: foundItem.name,
            description: foundItem.description,
            imageCount: foundItem.images.length,
        };
    }
);

const PersonalAssistantInputSchema = z.object({
  message: z.string().describe('The user\'s message to the assistant.'),
  assistantName: z.string().describe('The name the user has given to the assistant.'),
  userEmail: z.string().describe('The email of the current user.'),
  userId: z.string().describe('The unique ID of the current user.'),
});
export type PersonalAssistantInput = z.infer<typeof PersonalAssistantInputSchema>;

const PersonalAssistantOutputSchema = z.object({
  response: z.string().describe('The AI assistant\'s response to the user.'),
});
export type PersonalAssistantOutput = z.infer<typeof PersonalAssistantOutputSchema>;

export async function getAssistantResponse(input: PersonalAssistantInput): Promise<PersonalAssistantOutput> {
  return personalAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalAssistantPrompt',
  input: {schema: z.object({
    assistantName: z.string(),
    userEmail: z.string(),
    history: z.array(z.object({
        role: z.enum(['user', 'model', 'tool']),
        content: z.array(z.object({
            text: z.string().optional(),
            toolRequest: z.any().optional(),
            toolResponse: z.any().optional(),
        })),
    })),
  })},
  output: {schema: PersonalAssistantOutputSchema},
  tools: [getItemsTool, getItemDetailsTool],
  prompt: `You are {{assistantName}}, a personal AI assistant integrated into the PeerWeb Trader application, a retro-futuristic P2P trading platform. Your user is {{userEmail}}.

Your personality is helpful, slightly quirky, and you speak in a style that fits a cyberpunk, retro-terminal world. Keep your responses concise and to the point.

You have access to tools that can retrieve information about the user's item inventory. If the user asks a question about their items, you should use these tools to find the answer. For example, if they ask "What do I have?", use the 'getItems' tool. If they ask for details about a specific item, use the 'getItemDetails' tool.

This is the conversation history:
{{#each history}}
  {{#if (eq role 'user')}}
    User: {{{content.[0].text}}}
  {{else if (eq role 'model')}}
    {{#if content.[0].toolRequest}}
      {{!-- This is a tool call, don't render it in the history --}}
    {{else}}
      {{../assistantName}}: {{{content.[0].text}}}
    {{/if}}
  {{/if}}
{{/each}}

Respond to the last user message based on the context of the conversation and any tool results.`,
});

const personalAssistantFlow = ai.defineFlow(
  {
    name: 'personalAssistantFlow',
    inputSchema: PersonalAssistantInputSchema,
    outputSchema: PersonalAssistantOutputSchema,
  },
  async (input) => {
    // 1. Get chat history for the user
    const history = await getChatHistory(input.userId);

    // 2. Call the prompt with the full context, allowing it to use tools
    const {output} = await ai.generate({
        model: 'googleai/gemini-2.0-flash',
        prompt: prompt.compile({
            assistantName: input.assistantName,
            userEmail: input.userEmail,
        }),
        history: [...history, { role: 'user', content: [{text: input.message}] }],
        auth: {
            userId: input.userId, // Pass userId for tool context
        },
        output: {
            schema: PersonalAssistantOutputSchema,
        }
    });

    return output!;
  }
);
