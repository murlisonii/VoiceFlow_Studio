// Use server directive.
'use server';

/**
 * @fileOverview A flow that answers customer service inquiries using a provided knowledge base.
 *
 * - answerCustomerServiceInquiries - A function that answers customer service inquiries.
 * - AnswerCustomerServiceInquiriesInput - The input type for the answerCustomerServiceInquiries function.
 * - AnswerCustomerServiceInquiriesOutput - The return type for the answerCustomerServiceInquiries function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerCustomerServiceInquiriesInputSchema = z.object({
  knowledgeBase: z
    .string()
    .describe(
      'The customer service knowledge base, as a string.  This should include common support inquiries and their solutions.'
    ),
  customerQuery: z.string().describe('The customer query to be answered.'),
});
export type AnswerCustomerServiceInquiriesInput = z.infer<
  typeof AnswerCustomerServiceInquiriesInputSchema
>;

const AnswerCustomerServiceInquiriesOutputSchema = z.object({
  response:
    z.string()
      .describe(
        'The response to the customer query, incorporating knowledge from the knowledge base.'
      ),
});
export type AnswerCustomerServiceInquiriesOutput = z.infer<
  typeof AnswerCustomerServiceInquiriesOutputSchema
>;

export async function answerCustomerServiceInquiries(
  input: AnswerCustomerServiceInquiriesInput
): Promise<AnswerCustomerServiceInquiriesOutput> {
  return answerCustomerServiceInquiriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerCustomerServiceInquiriesPrompt',
  input: {schema: AnswerCustomerServiceInquiriesInputSchema},
  output: {schema: AnswerCustomerServiceInquiriesOutputSchema},
  prompt: `You are a customer service agent.  Use the following knowledge base to respond to the customer query.\n\nKnowledge Base:\n{{{knowledgeBase}}}\n\nCustomer Query:\n{{{customerQuery}}}`,
});

const answerCustomerServiceInquiriesFlow = ai.defineFlow(
  {
    name: 'answerCustomerServiceInquiriesFlow',
    inputSchema: AnswerCustomerServiceInquiriesInputSchema,
    outputSchema: AnswerCustomerServiceInquiriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
