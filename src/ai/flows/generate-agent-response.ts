'use server';

/**
 * @fileOverview This file defines the generateAgentResponse flow, which takes transcribed text as input,
 * passes it to a pluggable LLM agent, and returns the agent's response.
 *
 * - generateAgentResponse - The main function that initiates the LLM agent and returns the response.
 * - GenerateAgentResponseInput - The input type for the generateAgentResponse function.
 * - GenerateAgentResponseOutput - The return type for the generateAgentResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAgentResponseInputSchema = z.object({
  transcribedText: z.string().describe('The transcribed text from the user\'s speech.'),
});
export type GenerateAgentResponseInput = z.infer<typeof GenerateAgentResponseInputSchema>;

const GenerateAgentResponseOutputSchema = z.object({
  agentResponse: z.string().describe('The LLM agent\'s response to the transcribed text.'),
});
export type GenerateAgentResponseOutput = z.infer<typeof GenerateAgentResponseOutputSchema>;

export async function generateAgentResponse(input: GenerateAgentResponseInput): Promise<GenerateAgentResponseOutput> {
  return generateAgentResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAgentResponsePrompt',
  input: {schema: GenerateAgentResponseInputSchema},
  output: {schema: GenerateAgentResponseOutputSchema},
  prompt: `You are a helpful AI assistant.  Respond to the user query.

User Query: {{{transcribedText}}}`,
});

const generateAgentResponseFlow = ai.defineFlow(
  {
    name: 'generateAgentResponseFlow',
    inputSchema: GenerateAgentResponseInputSchema,
    outputSchema: GenerateAgentResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
