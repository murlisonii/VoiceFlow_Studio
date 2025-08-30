
"use client";

import { useState, useRef } from "react";
import { Loader, Volume2, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { convertTextToSpeech } from "@/ai/flows/convert-text-to-speech";

type Status = "idle" | "processing" | "speaking";

export function TextToSpeechUI() {
  const [status, setStatus] = useState<Status>("idle");
  const [text, setText] = useState("Hello! I am a friendly voice assistant. You can type any text here and I will read it aloud for you.");
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const handleSpeak = async () => {
    if (!text.trim()) {
        toast({
            variant: "destructive",
            title: "Text is empty",
            description: "Please enter some text to convert to speech.",
        });
        return;
    }
    
    setStatus("processing");
    try {
      // TTS
      const { audioDataUri: speechUri } = await convertTextToSpeech({ text });

      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = speechUri;
        setStatus("speaking");
        audioPlayerRef.current.play();
      }
    } catch (error) {
      console.error("TTS failed:", error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Could not convert text to speech. Please try again.",
      });
      setStatus("idle");
    }
  };

  const isProcessing = status === "processing" || status === "speaking";

  const getButtonContent = () => {
    switch (status) {
      case "processing":
        return <><Loader className="h-6 w-6 mr-2 animate-spin" /> Processing...</>;
      case "speaking":
        return <><Volume2 className="h-6 w-6 mr-2 animate-pulse" /> Speaking...</>;
      case "idle":
      default:
        return <><Mic className="h-6 w-6 mr-2" /> Speak</>;
    }
  };

  return (
    <div className="pt-4 max-w-2xl mx-auto">
        <audio ref={audioPlayerRef} onEnded={() => setStatus("idle")} className="hidden" />
        <Card>
            <CardHeader>
                <CardTitle>Text-to-Speech</CardTitle>
                <CardDescription>Enter any text below and click the button to hear it spoken.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="tts-input">Text to Speak</Label>
                    <Textarea
                        id="tts-input"
                        placeholder="Enter text here..."
                        className="h-40 resize-none"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={isProcessing}
                    />
                </div>
                 <Button
                    onClick={handleSpeak}
                    disabled={isProcessing}
                    className="w-full text-lg py-6"
                    size="lg"
                    >
                    {getButtonContent()}
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}

