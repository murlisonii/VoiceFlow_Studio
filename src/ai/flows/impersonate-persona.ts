'use server';

/**
 * @fileOverview A flow that allows an LLM agent to impersonate a character or persona.
 *
 * - impersonatePersona - A function that generates a response in the character of a given persona.
 * - ImpersonatePersonaInput - The input type for the impersonatePersona function.
 * - ImpersonatePersonaOutput - The return type for the impersonatePersona function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImpersonatePersonaInputSchema = z.object({
  personaDescription: z
    .string()
    .describe(
      "A description of the persona to impersonate, as a string or a PDF data URI. If data URI, it must be in the format 'data:application/pdf;base64,<encoded_data>'."
    ),
  userQuery: z.string().describe("The user's query to be answered by the persona."),
});
export type ImpersonatePersonaInput = z.infer<
  typeof ImpersonatePersonaInputSchema
>;

const ImpersonatePersonaOutputSchema = z.object({
  response:
    z.string()
      .describe(
        'The response from the agent, in the character of the specified persona.'
      ),
});
export type ImpersonatePersonaOutput = z.infer<
  typeof ImpersonatePersonaOutputSchema
>;

export async function impersonatePersona(
  input: ImpersonatePersonaInput
): Promise<ImpersonatePersonaOutput> {
  return impersonatePersonaFlow(input);
}

const textPrompt = ai.definePrompt({
  name: 'impersonatePersonaTextPrompt',
  input: {schema: ImpersonatePersonaInputSchema},
  output: {schema: ImpersonatePersonaOutputSchema},
  prompt: `You are to adopt the following persona and respond to the user's query as if you are that person. Be creative, and embody their emotions, knowledge, and style of speaking.

Persona Description:
{{{personaDescription}}}

User Query:
{{{userQuery}}}`,
});

const pdfPrompt = ai.definePrompt({
  name: 'impersonatePersonaPdfPrompt',
  input: {schema: ImpersonatePersonaInputSchema},
  output: {schema: ImpersonatePersonaOutputSchema},
  prompt: `You are to adopt the following persona and respond to the user's query as if you are that person. Be creative, and embody their emotions, knowledge, and style of speaking.

Persona Description (from PDF):
{{media url=personaDescription}}

User Query:
{{{userQuery}}}`,
});

const impersonatePersonaFlow = ai.defineFlow(
  {
    name: 'impersonatePersonaFlow',
    inputSchema: ImpersonatePersonaInputSchema,
    outputSchema: ImpersonatePersonaOutputSchema,
  },
  async input => {
    const promptToUse = input.personaDescription.startsWith("data:application/pdf;base64,") ? pdfPrompt : textPrompt;
    const {output} = await promptToUse(input);
    return output!;
  }
);
