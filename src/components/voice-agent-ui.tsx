"use client";

import { useState, useRef } from "react";
import { Bot, Loader, Mic, Square, Volume2, FileUp, FileCheck, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { KnowledgeBase } from "./knowledge-base";
import { ConversationDisplay, type Message } from "./conversation-display";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

// AI Flow Imports
import { transcribeSpeechToText } from "@/ai/flows/transcribe-speech-to-text";
import { generateAgentResponse } from "@/ai/flows/generate-agent-response";
import { incorporateCustomerServiceKnowledge } from "@/ai/flows/incorporate-customer-service-knowledge";
import { convertTextToSpeech } from "@/ai/flows/convert-text-to-speech";
import { assistElderlyPatient } from "@/ai/flows/assist-elderly-patient";
import { impersonatePersona } from "@/ai/flows/impersonate-persona";

type Status = "idle" | "recording" | "processing" | "speaking";
type AgentType = "generic" | "customerService" | "elderCare" | "customPersona";

const KNOWLEDGE_BASES = {
  customerService: `
- Our store is open from 9 AM to 8 PM on weekdays.
- We are open from 10 AM to 6 PM on weekends.
- To return an item, you need the original receipt and the item must be in its original packaging. Returns are accepted within 30 days of purchase.
- For technical support, please call 1-800-555-TECH.
- We are located at 123 Main Street, Anytown, USA.
`.trim(),
  elderCare: `
- Blood Pressure Reading (Today): 130/85 mmHg. This is slightly elevated.
- Blood Sugar Level (Fasting, Yesterday): 95 mg/dL. This is in the normal range.
- Upcoming Appointments: Dr. Smith (Cardiologist) on July 15th at 10:00 AM.
- Recent Test Results: Cholesterol levels are normal.
- Medication Reminder: Take Metformin 500mg after breakfast. Take Lisinopril 10mg in the morning.
`.trim(),
  customPersona: `You are a witty, sarcastic pirate from the 17th century with a love for treasure. You call people 'matey' and are always talking about finding treasure and sailing the seven seas.`
};

const AGENT_CONFIG = {
    generic: {
        label: "Generic Assistant",
    },
    customerService: {
        label: "Customer Service Bot",
    },
    elderCare: {
        label: "Elder Care Assistant",
    },
    customPersona: {
        label: "Custom Persona"
    }
}

export function VoiceAgentUI() {
  const [status, setStatus] = useState<Status>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [agentType, setAgentType] = useState<AgentType>("generic");
  
  const [knowledgeBase, setKnowledgeBase] = useState(KNOWLEDGE_BASES.customerService);
  const [knowledgeBasePdf, setKnowledgeBasePdf] = useState<string | null>(null);
  const [knowledgeBasePdfName, setKnowledgeBasePdfName] = useState<string | null>(null);

  const [medicalReportText, setMedicalReportText] = useState(KNOWLEDGE_BASES.elderCare);
  const [medicalReportPdf, setMedicalReportPdf] = useState<string | null>(null);
  const [medicalReportPdfName, setMedicalReportPdfName] = useState<string | null>(null);

  const [personaText, setPersonaText] = useState(KNOWLEDGE_BASES.customPersona);
  const [personaPdf, setPersonaPdf] = useState<string | null>(null);
  const [personaPdfName, setPersonaPdfName] = useState<string | null>(null);

  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const medicalFileInputRef = useRef<HTMLInputElement | null>(null);
  const kbFileInputRef = useRef<HTMLInputElement | null>(null);
  const personaFileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const handleAgentChange = (value: AgentType) => {
    setAgentType(value);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'medical' | 'kb' | 'persona') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (fileType === 'medical') {
          setMedicalReportPdf(result);
          setMedicalReportPdfName(file.name);
          toast({ title: "Medical Report Uploaded", description: `${file.name} has been successfully uploaded.` });
        } else if (fileType === 'kb') {
          setKnowledgeBasePdf(result);
          setKnowledgeBasePdfName(file.name);
           toast({ title: "Knowledge Base Uploaded", description: `${file.name} has been successfully uploaded.` });
        } else if (fileType === 'persona') {
            setPersonaPdf(result);
            setPersonaPdfName(file.name);
            toast({ title: "Persona PDF Uploaded", description: `${file.name} has been successfully uploaded.`});
        }
      };
      reader.onerror = () => {
        toast({
            variant: "destructive",
            title: "File Read Error",
            description: "Could not read the selected file.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const processRecording = async () => {
    if (!isRecording) return;
    setStatus("processing");
    try {
      const audioDataUri = await stopRecording();

      // STT
      const { transcription } = await transcribeSpeechToText({ audioDataUri });
      setMessages((prev) => [...prev, { role: "user", text: transcription }]);

      // LLM
      let agentResponseText: string;
      if (agentType === "customerService") {
        const kbToUse = knowledgeBasePdf || knowledgeBase;
        const { response } = await incorporateCustomerServiceKnowledge({
          knowledgeBase: kbToUse,
          customerQuery: transcription,
        });
        agentResponseText = response;
      } else if (agentType === 'elderCare') {
          const reportToUse = medicalReportPdf || medicalReportText;
          if (!reportToUse) {
              toast({
                  variant: "destructive",
                  title: "Missing Medical Information",
                  description: "Please provide a medical report for the Elder Care Assistant.",
              });
              setStatus("idle");
              return;
          }
          const { response } = await assistElderlyPatient({
              medicalReport: reportToUse,
              patientQuery: transcription
          });
          agentResponseText = response;
      } else if (agentType === 'customPersona') {
        const personaToUse = personaPdf || personaText;
        if (!personaToUse) {
            toast({
                variant: "destructive",
                title: "Missing Persona Information",
                description: "Please provide a persona description.",
            });
            setStatus("idle");
            return;
        }
        const { response } = await impersonatePersona({
            personaDescription: personaToUse,
            userQuery: transcription
        });
        agentResponseText = response;
      } else {
        const { agentResponse } = await generateAgentResponse({
          transcribedText: transcription,
        });
        agentResponseText = agentResponse;
      }
      setMessages((prev) => [...prev, { role: "agent", text: agentResponseText }]);

      // TTS
      const { audioDataUri: speechUri } = await convertTextToSpeech({ text: agentResponseText });
      
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = speechUri;
        setStatus("speaking");
        audioPlayerRef.current.play();
      }

    } catch (error) {
      console.error("Interaction failed:", error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Could not process the request. Please try again.",
      });
      setStatus("idle");
    }
  }

  const handleStartInteraction = async () => {
    if (isRecording) {
      await processRecording();
    } else {
      // Start recording
      setMessages([]);
      await startRecording();
      setStatus("recording");
    }
  };

  const handleStop = async () => {
    if (isRecording) {
      await processRecording();
    } else if (status === 'speaking' && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      setStatus('idle');
    } else if (status === 'processing' || status === 'recording') {
       if (isRecording) await stopRecording();
       setStatus('idle');
    }
  }

  const isProcessing = status === "processing";

  const getButtonContent = () => {
    switch (status) {
      case "recording":
        return <><Square className="h-6 w-6 mr-2 fill-current text-destructive animate-pulse" /> Stop & Process</>;
      case "processing":
        return <><Loader className="h-6 w-6 mr-2 animate-spin" /> Processing...</>;
      case "speaking":
         return <><Volume2 className="h-6 w-6 mr-2 animate-pulse" /> Speaking...</>;
      case "idle":
      default:
        return <><Mic className="h-6 w-6 mr-2" /> Start New Conversation</>;
    }
  };
  
  const currentAgentConfig = AGENT_CONFIG[agentType];

  return (
    <div className="grid md:grid-cols-3 gap-6 pt-4">
      <audio ref={audioPlayerRef} onEnded={() => setStatus("idle")} className="hidden" />
      <Card className="md:col-span-1 h-fit">
        <CardHeader>
          <CardTitle>Agent Configuration</CardTitle>
          <CardDescription>Select and configure your voice agent.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Agent Type</Label>
            <RadioGroup
              value={agentType}
              onValueChange={(value) => handleAgentChange(value as AgentType)}
              disabled={isProcessing || isRecording || status === 'speaking'}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="generic" id="generic" />
                <Label htmlFor="generic">Generic Assistant</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="customerService" id="customer" />
                <Label htmlFor="customer">Customer Service Bot</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="elderCare" id="elderCare" />
                <Label htmlFor="elderCare">Elder Care Assistant</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="customPersona" id="customPersona" />
                <Label htmlFor="customPersona">Custom Persona</Label>
              </div>
            </RadioGroup>
          </div>

          {agentType === 'customerService' && (<>
            <KnowledgeBase
              value={knowledgeBase!}
              onChange={setKnowledgeBase}
              disabled={isProcessing || isRecording || status === 'speaking'}
              label="Customer Service Knowledge Base (Text)"
              placeholder="Enter common support questions and answers here..."
            />
            <div className="relative">
                <Separator />
                <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-sm text-muted-foreground">OR</span>
            </div>
             <div className="space-y-2">
                <Label htmlFor="kb-pdf-upload">Upload Knowledge Base (PDF)</Label>
                <Input
                    id="kb-pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, 'kb')}
                    ref={kbFileInputRef}
                    className="hidden" 
                    disabled={isProcessing || isRecording || status === 'speaking'}
                />
                <Button 
                    onClick={() => kbFileInputRef.current?.click()} 
                    variant="outline" 
                    className="w-full"
                    disabled={isProcessing || isRecording || status === 'speaking'}
                >
                    <FileUp className="mr-2 h-4 w-4" />
                    {knowledgeBasePdfName ? "Change PDF" : "Select PDF"}
                </Button>
                {knowledgeBasePdfName && (
                    <div className="flex items-center text-sm text-muted-foreground pt-2">
                        <FileCheck className="h-4 w-4 mr-2 text-green-500"/>
                        <span className="truncate">{knowledgeBasePdfName}</span>
                    </div>
                )}
                 <p className="text-xs text-muted-foreground">If a PDF is uploaded, it will be used as the knowledge base, overriding the text input.</p>
            </div>
          </>)}

          {agentType === 'elderCare' && (<>
            <KnowledgeBase
              value={medicalReportText!}
              onChange={setMedicalReportText}
              disabled={isProcessing || isRecording || status === 'speaking'}
              label="Medical Report (Text)"
              placeholder="Enter medical reports, test results, and health issues here..."
            />
            <div className="relative">
                <Separator />
                <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-sm text-muted-foreground">OR</span>
            </div>
            <div className="space-y-2">
                <Label htmlFor="pdf-upload">Upload Medical Report (PDF)</Label>
                <Input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, 'medical')}
                    ref={medicalFileInputRef}
                    className="hidden" 
                    disabled={isProcessing || isRecording || status === 'speaking'}
                />
                <Button 
                    onClick={() => medicalFileInputRef.current?.click()} 
                    variant="outline" 
                    className="w-full"
                    disabled={isProcessing || isRecording || status === 'speaking'}
                >
                    <FileUp className="mr-2 h-4 w-4" />
                    {medicalReportPdfName ? "Change PDF" : "Select PDF"}
                </Button>
                {medicalReportPdfName && (
                    <div className="flex items-center text-sm text-muted-foreground pt-2">
                        <FileCheck className="h-4 w-4 mr-2 text-green-500"/>
                        <span className="truncate">{medicalReportPdfName}</span>
                    </div>
                )}
                <p className="text-xs text-muted-foreground">If a PDF is uploaded, it will be used as the medical report, overriding the text input.</p>
            </div>
          </>)}

          {agentType === 'customPersona' && (<>
            <KnowledgeBase
              value={personaText!}
              onChange={setPersonaText}
              disabled={isProcessing || isRecording || status === 'speaking'}
              label="Persona Description (Text)"
              placeholder="Describe the persona for the agent to adopt..."
            />
            <div className="relative">
                <Separator />
                <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-sm text-muted-foreground">OR</span>
            </div>
            <div className="space-y-2">
                <Label htmlFor="persona-pdf-upload">Upload Persona Description (PDF)</Label>
                <Input
                    id="persona-pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, 'persona')}
                    ref={personaFileInputRef}
                    className="hidden" 
                    disabled={isProcessing || isRecording || status === 'speaking'}
                />
                <Button 
                    onClick={() => personaFileInputRef.current?.click()} 
                    variant="outline" 
                    className="w-full"
                    disabled={isProcessing || isRecording || status === 'speaking'}
                >
                    <FileUp className="mr-2 h-4 w-4" />
                    {personaPdfName ? "Change PDF" : "Select PDF"}
                </Button>
                {personaPdfName && (
                    <div className="flex items-center text-sm text-muted-foreground pt-2">
                        <FileCheck className="h-4 w-4 mr-2 text-green-500"/>
                        <span className="truncate">{personaPdfName}</span>
                    </div>
                )}
                <p className="text-xs text-muted-foreground">If a PDF is uploaded, it will be used for the persona, overriding the text input.</p>
            </div>
          </>)}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Voice Agent Interaction</CardTitle>
              <CardDescription>Click the button to talk to the agent.</CardDescription>
            </div>
             <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Bot className="w-5 h-5"/>
                <span>{currentAgentConfig.label}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col h-[525px]">
          <div className="flex-grow">
            <ConversationDisplay messages={messages} />
          </div>
          <div className="flex-shrink-0 pt-4 border-t space-y-2">
            <Button
              onClick={handleStartInteraction}
              disabled={isProcessing || status === 'speaking'}
              className="w-full text-lg py-6"
              size="lg"
            >
              {getButtonContent()}
            </Button>
            <Button
              onClick={handleStop}
              disabled={status === 'idle'}
              variant="destructive"
              className="w-full"
              size="lg"
            >
              <StopCircle className="mr-2 h-6 w-6"/>
              Stop
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
