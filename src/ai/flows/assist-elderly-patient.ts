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
  medicalReportPdf: z
    .string()
    .describe(
      "The patient's medical report as a PDF data URI. The format must be 'data:application/pdf;base64,<encoded_data>'."
    ),
  patientQuery: z.string().describe("The patient's query."),
});
export type AssistElderlyPatientInput = z.infer<
  typeof AssistElderlyPatientInputSchema
>;

const AssistElderlyPatientOutputSchema = z.object({
  response:
    z.string()
      .describe(
        "The response to the patient's query, based on the provided medical knowledge."
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
  prompt: `You are a helpful medical assistant for an elderly patient. Use the following medical report to respond to the patient's query in a clear, simple, and reassuring way. Do not provide medical advice.

Medical Report:
{{media url=medicalReportPdf}}

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
