'use server';

/**
 * @fileOverview A flow to assist elderly patients with their medical reports and health issues.
 *
 * - assistElderlyPatient - A function that assists elderly patients.
 * - AssistElderlyPatientInput - The input type for the assistElderlyPatient function.
 * - AssistElderlyPatientOutput - The return type for the assistElderlyPatient function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssistElderlyPatientInputSchema = z.object({
  medicalKnowledge: z
    .string()
    .describe(
      'The knowledge base of medical reports, test results, and health issues.'
    ),
  patientQuery: z.string().describe('The patient\'s query.'),
});
export type AssistElderlyPatientInput = z.infer<
  typeof AssistElderlyPatientInputSchema
>;

const AssistElderlyPatientOutputSchema = z.object({
  response:
    z.string()
      .describe(
        'The response to the patient\'s query, based on the provided medical knowledge.'
      ),
});
export type AssistElderlyPatientOutput = z.infer<
  typeof AssistElderlyPatientOutputSchema
>;

export async function assistElderlyPatient(
  input: AssistElderlyPatientInput
): Promise<AssistElderlyPatientOutput> {
  return assistElderlyPatientFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assistElderlyPatientPrompt',
  input: {schema: AssistElderlyPatientInputSchema},
  output: {schema: AssistElderlyPatientOutputSchema},
  prompt: `You are a helpful medical assistant for an elderly patient. Use the following medical information to respond to the patient's query in a clear, simple, and reassuring way. Do not provide medical advice.

Medical Information:
{{{medicalKnowledge}}}

Patient Query:
{{{patientQuery}}}`,
});

const assistElderlyPatientFlow = ai.defineFlow(
  {
    name: 'assistElderlyPatientFlow',
    inputSchema: AssistElderlyPatientInputSchema,
    outputSchema: AssistElderlyPatientOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
