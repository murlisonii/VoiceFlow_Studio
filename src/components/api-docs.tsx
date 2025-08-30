"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CodeBlock = ({ children }: { children: React.ReactNode }) => (
  <pre className="mt-2 rounded-md bg-muted p-4 overflow-x-auto">
    <code className="font-code text-sm text-muted-foreground">{children}</code>
  </pre>
);

export function ApiDocs() {
  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API & SDK Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            VoiceFlow Studio is built on a modular set of Genkit flows. You can integrate these flows into your own applications.
            Here’s how you can use the core functions.
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>1. Speech-to-Text</CardTitle>
                <Badge variant="secondary">STT</Badge>
            </div>
        </CardHeader>
        <CardContent>
            <p>Convert audio into text. The audio must be provided as a Base64 encoded data URI.</p>
            <CodeBlock>
{`import { transcribeSpeechToText } from '@/ai/flows/transcribe-speech-to-text';

const audioDataUri = 'data:audio/webm;base64,...'; // Your audio data
const { transcription } = await transcribeSpeechToText({ audioDataUri });

console.log(transcription);`}
            </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>2. Pluggable LLM Agent</CardTitle>
                <Badge variant="secondary">LLM</Badge>
            </div>
        </CardHeader>
        <CardContent>
            <p>Pass the transcribed text to an LLM agent to get a response. You can create your own agent or use our pre-built ones.</p>
            <h4 className="font-semibold mt-4 mb-2">A. Generic Agent</h4>
            <CodeBlock>
{`import { generateAgentResponse } from '@/ai/flows/generate-agent-response';

const transcribedText = "Hello, how are you?";
const { agentResponse } = await generateAgentResponse({ transcribedText });

console.log(agentResponse);`}
            </CodeBlock>

            <h4 className="font-semibold mt-4 mb-2">B. Custom Knowledge Agent</h4>
            <p>This agent uses a provided knowledge base to answer queries. This is perfect for domain-specific applications like customer service.</p>
            <CodeBlock>
{`import { incorporateCustomerServiceKnowledge } from '@/ai/flows/incorporate-customer-service-knowledge';

const knowledgeBase = "Our return policy is 30 days. To start a return, visit our website.";
const customerQuery = "How can I return an item?";

const { response } = await incorporateCustomerServiceKnowledge({ 
    knowledgeBase, 
    customerQuery 
});

console.log(response);`}
            </CodeBlock>
            
            <h4 className="font-semibold mt-4 mb-2">C. Elder Care Assistant</h4>
            <p>This agent can read a medical report in PDF or text format and answer patient questions about it.</p>
            <CodeBlock>
{`import { assistElderlyPatient } from '@/ai/flows/assist-elderly-patient';

const medicalReport = 'data:application/pdf;base64,...'; // Your PDF data or a string
const patientQuery = "What does my latest blood pressure reading mean?";

const { response } = await assistElderlyPatient({
  medicalReport,
  patientQuery
});

console.log(response);`}
            </CodeBlock>

            <h4 className="font-semibold mt-4 mb-2">D. Custom Persona Agent</h4>
            <p>This agent adopts a persona based on a provided description and answers queries in character.</p>
            <CodeBlock>
{`import { impersonatePersona } from '@/ai/flows/impersonate-persona';

const personaDescription = "You are a witty, sarcastic pirate from the 17th century with a love for treasure.";
const userQuery = "What is the weather like today?";

const { response } = await impersonatePersona({
  personaDescription,
  userQuery
});

console.log(response);`}
            </CodeBlock>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>3. Text-to-Speech</CardTitle>
                <Badge variant="secondary">TTS</Badge>
            </div>
        </CardHeader>
        <CardContent>
            <p>Convert the agent's text response back into speech. The output is a playable audio data URI.</p>
            <CodeBlock>
{`import { convertTextToSpeech } from '@/ai/flows/convert-text-to-speech';

const textToSpeak = "Of course, I can help with that.";
const { audioDataUri } = await convertTextToSpeech({ text: textToSpeak });

// You can use this data URI in an <audio> tag
// const audio = new Audio(audioDataUri);
// audio.play();`}
            </CodeBlock>
        </CardContent>
      </Card>
    </div>
  );
}
