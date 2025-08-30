"use client";

import { useState, useRef } from "react";
import { Bot, Loader, Mic, Square, Volume2, FileUp, FileCheck } from "lucide-react";
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

// AI Flow Imports
import { transcribeSpeechToText } from "@/ai/flows/transcribe-speech-to-text";
import { generateAgentResponse } from "@/ai/flows/generate-agent-response";
import { incorporateCustomerServiceKnowledge } from "@/ai/flows/incorporate-customer-service-knowledge";
import { convertTextToSpeech } from "@/ai/flows/convert-text-to-speech";
import { assistElderlyPatient } from "@/ai/flows/assist-elderly-patient";

type Status = "idle" | "recording" | "processing" | "speaking";
type AgentType = "generic" | "customerService" | "elderCare";

const KNOWLEDGE_BASES = {
  customerService: `
- Our store is open from 9 AM to 8 PM on weekdays.
- We are open from 10 AM to 6 PM on weekends.
- To return an item, you need the original receipt and the item must be in its original packaging. Returns are accepted within 30 days of purchase.
- For technical support, please call 1-800-555-TECH.
- We are located at 123 Main Street, Anytown, USA.
`.trim(),
};

const AGENT_CONFIG = {
    generic: {
        label: "Generic Assistant",
        knowledgeBase: null,
    },
    customerService: {
        label: "Customer Service Bot",
        knowledgeBase: KNOWLEDGE_BASES.customerService,
    },
    elderCare: {
        label: "Elder Care Assistant",
        knowledgeBase: null, // PDF will be used instead
    }
}

export function VoiceAgentUI() {
  const [status, setStatus] = useState<Status>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [agentType, setAgentType] = useState<AgentType>("generic");
  const [knowledgeBase, setKnowledgeBase] = useState(AGENT_CONFIG.customerService.knowledgeBase);
  const [medicalReport, setMedicalReport] = useState<string | null>(null);
  const [medicalReportName, setMedicalReportName] = useState<string | null>(null);

  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAgentChange = (value: AgentType) => {
    setAgentType(value);
    const newConfig = AGENT_CONFIG[value];
    if (newConfig.knowledgeBase) {
        setKnowledgeBase(newConfig.knowledgeBase);
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMedicalReport(e.target?.result as string);
        setMedicalReportName(file.name);
         toast({
            title: "File Uploaded",
            description: `${file.name} has been successfully uploaded.`,
        });
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

  const handleInteraction = async () => {
    if (isRecording) {
      // Stop recording and process
      setStatus("processing");
      try {
        const audioDataUri = await stopRecording();

        // STT
        const { transcription } = await transcribeSpeechToText({ audioDataUri });
        setMessages((prev) => [...prev, { role: "user", text: transcription }]);

        // LLM
        let agentResponseText: string;
        if (agentType === "customerService") {
          const { response } = await incorporateCustomerServiceKnowledge({
            knowledgeBase: knowledgeBase!,
            customerQuery: transcription,
          });
          agentResponseText = response;
        } else if (agentType === 'elderCare') {
            if (!medicalReport) {
                toast({
                    variant: "destructive",
                    title: "Missing Medical Report",
                    description: "Please upload a medical report PDF for the Elder Care Assistant.",
                });
                setStatus("idle");
                return;
            }
            const { response } = await assistElderlyPatient({
                medicalReportPdf: medicalReport,
                patientQuery: transcription
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
    } else {
      // Start recording
      await startRecording();
      setStatus("recording");
    }
  };

  const isProcessing = status === "processing" || status === "speaking";

  const getButtonContent = () => {
    switch (status) {
      case "recording":
        return <><Square className="h-6 w-6 mr-2 fill-current text-destructive animate-pulse" /> Stop Recording</>;
      case "processing":
        return <><Loader className="h-6 w-6 mr-2 animate-spin" /> Processing...</>;
      case "speaking":
        return <><Volume2 className="h-6 w-6 mr-2 animate-pulse" /> Speaking...</>;
      case "idle":
      default:
        return <><Mic className="h-6 w-6 mr-2" /> Start Recording</>;
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
              disabled={isProcessing}
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
            </RadioGroup>
          </div>

          {agentType === 'customerService' && (
            <KnowledgeBase
              value={knowledgeBase!}
              onChange={setKnowledgeBase}
              disabled={isProcessing}
              label="Customer Service Knowledge Base"
              placeholder="Enter common support questions and answers here..."
            />
          )}

          {agentType === 'elderCare' && (
            <div className="space-y-2">
                <Label htmlFor="pdf-upload">Upload Medical Report (PDF)</Label>
                <Input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden" 
                    disabled={isProcessing}
                />
                <Button 
                    onClick={() => fileInputRef.current?.click()} 
                    variant="outline" 
                    className="w-full"
                    disabled={isProcessing}
                >
                    <FileUp className="mr-2 h-4 w-4" />
                    {medicalReportName ? "Change PDF" : "Select PDF"}
                </Button>
                {medicalReportName && (
                    <div className="flex items-center text-sm text-muted-foreground pt-2">
                        <FileCheck className="h-4 w-4 mr-2 text-green-500"/>
                        <span className="truncate">{medicalReportName}</span>
                    </div>
                )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex justify-between items-center">
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
          <div className="flex-shrink-0 pt-4 border-t">
            <Button
              onClick={handleInteraction}
              disabled={isProcessing}
              className="w-full text-lg py-6"
              size="lg"
            >
              {getButtonContent()}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
