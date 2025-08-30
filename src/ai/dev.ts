import { config } from 'dotenv';
config();

import '@/ai/flows/convert-text-to-speech.ts';
import '@/ai/flows/generate-agent-response.ts';
import '@/ai/flows/incorporate-customer-service-knowledge.ts';
import '@/ai/flows/transcribe-speech-to-text.ts';
import '@/ai/flows/answer-customer-service-inquiries.ts';
import '@/ai/flows/generate-response-from-llm-agent.ts';
import '@/ai/flows/assist-elderly-patient.ts';
