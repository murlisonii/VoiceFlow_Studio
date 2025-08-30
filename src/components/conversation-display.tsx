"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { useEffect, useRef } from "react";

export interface Message {
  role: 'user' | 'agent';
  text: string;
}

interface ConversationDisplayProps {
  messages: Message[];
}

export function ConversationDisplay({ messages }: ConversationDisplayProps) {
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.parentElement?.scrollTo({ top: scrollAreaRef.current.parentElement.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

  return (
    <ScrollArea className="h-[400px] w-full p-4" >
      <div className="space-y-6" ref={scrollAreaRef}>
        {messages.length === 0 && (
          <div className="flex h-full min-h-[350px] items-center justify-center text-center text-muted-foreground">
            <p>Click the microphone button below to start a new conversation with the voice agent.</p>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-3",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "agent" && (
              <Avatar className="h-9 w-9 border">
                <AvatarFallback>
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                "max-w-xs rounded-lg p-3 text-sm md:max-w-md shadow-sm",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card"
              )}
            >
              <p>{message.text}</p>
            </div>
            {message.role === "user" && (
              <Avatar className="h-9 w-9 border">
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
