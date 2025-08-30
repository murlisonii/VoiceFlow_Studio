// Use server directive.
'use server';

/**
 * @fileOverview This file defines the generateResponseFromLlmAgent flow, which takes transcribed text as input,
 * passes it to a pluggable LLM agent, and returns the agent's response.
 *
 * - generateResponseFromLlmAgent - The main function that initiates the LLM agent and returns the response.
 * - GenerateResponseFromLlmAgentInput - The input type for the generateResponseFromLlmAgent function.
 * - GenerateResponseFromLlmAgentOutput - The return type for the generateResponseFromLlmAgent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateResponseFromLlmAgentInputSchema = z.object({
  transcribedText: z.string().describe('The transcribed text from the user\'s speech.'),
});
export type GenerateResponseFromLlmAgentInput = z.infer<typeof GenerateResponseFromLlmAgentInputSchema>;

const GenerateResponseFromLlmAgentOutputSchema = z.object({
  agentResponse: z.string().describe('The LLM agent\'s response to the transcribed text.'),
});
export type GenerateResponseFromLlmAgentOutput = z.infer<typeof GenerateResponseFromLlmAgentOutputSchema>;

export async function generateResponseFromLlmAgent(
  input: GenerateResponseFromLlmAgentInput
): Promise<GenerateResponseFromLlmAgentOutput> {
  return generateResponseFromLlmAgentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResponseFromLlmAgentPrompt',
  input: {schema: GenerateResponseFromLlmAgentInputSchema},
  output: {schema: GenerateResponseFromLlmAgentOutputSchema},
  prompt: `You are a helpful AI assistant. Respond to the user query.\n\nUser Query: {{{transcribedText}}}`,
});

const generateResponseFromLlmAgentFlow = ai.defineFlow(
  {
    name: 'generateResponseFromLlmAgentFlow',
    inputSchema: GenerateResponseFromLlmAgentInputSchema,
    outputSchema: GenerateResponseFromLlmAgentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
