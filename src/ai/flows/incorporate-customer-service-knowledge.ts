// Use server directive.
'use server';

/**
 * @fileOverview A customer service knowledge incorporation flow.
 *
 * - incorporateCustomerServiceKnowledge - A function that incorporates customer service knowledge into the LLM.
 * - IncorporateCustomerServiceKnowledgeInput - The input type for the incorporateCustomerServiceKnowledge function.
 * - IncorporateCustomerServiceKnowledgeOutput - The return type for the incorporateCustomerServiceKnowledge function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IncorporateCustomerServiceKnowledgeInputSchema = z.object({
  knowledgeBase: z
    .string()
    .describe(
      'The customer service knowledge base, as a string or a data URI for a PDF. If data URI, it must be in the format \'data:application/pdf;base64,<encoded_data>\'.'
    ),
  customerQuery: z.string().describe('The customer query to be answered.'),
});
export type IncorporateCustomerServiceKnowledgeInput = z.infer<
  typeof IncorporateCustomerServiceKnowledgeInputSchema
>;

const IncorporateCustomerServiceKnowledgeOutputSchema = z.object({
  response: z
    .string()
    .describe(
      'The response to the customer query, incorporating knowledge from the knowledge base.'
    ),
});
export type IncorporateCustomerServiceKnowledgeOutput = z.infer<
  typeof IncorporateCustomerServiceKnowledgeOutputSchema
>;

export async function incorporateCustomerServiceKnowledge(
  input: IncorporateCustomerServiceKnowledgeInput
): Promise<IncorporateCustomerServiceKnowledgeOutput> {
  return incorporateCustomerServiceKnowledgeFlow(input);
}

const textPrompt = ai.definePrompt({
  name: 'incorporateCustomerServiceKnowledgeTextPrompt',
  input: {schema: IncorporateCustomerServiceKnowledgeInputSchema},
  output: {schema: IncorporateCustomerServiceKnowledgeOutputSchema},
  prompt: `You are a customer service agent.  Use the following knowledge base to respond to the customer query.

Knowledge Base:
{{{knowledgeBase}}}

Customer Query:
{{{customerQuery}}}`,
});

const pdfPrompt = ai.definePrompt({
    name: 'incorporateCustomerServiceKnowledgePdfPrompt',
    input: {schema: IncorporateCustomerServiceKnowledgeInputSchema},
    output: {schema: IncorporateCustomerServiceKnowledgeOutputSchema},
    prompt: `You are a customer service agent.  Use the following knowledge base to respond to the customer query.

Knowledge Base:
{{media url=knowledgeBase}}

Customer Query:
{{{customerQuery}}}`,
});


const incorporateCustomerServiceKnowledgeFlow = ai.defineFlow(
  {
    name: 'incorporateCustomerServiceKnowledgeFlow',
    inputSchema: IncorporateCustomerServiceKnowledgeInputSchema,
    outputSchema: IncorporateCustomerServiceKnowledgeOutputSchema,
  },
  async input => {
    const promptToUse = input.knowledgeBase.startsWith("data:application/pdf;base64,") ? pdfPrompt : textPrompt;
    const {output} = await promptToUse(input);
    return output!;
  }
);