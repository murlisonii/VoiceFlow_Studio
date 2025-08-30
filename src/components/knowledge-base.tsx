"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface KnowledgeBaseProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function KnowledgeBase({ value, onChange, disabled }: KnowledgeBaseProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="knowledge-base">Customer Service Knowledge Base</Label>
      <Textarea
        id="knowledge-base"
        placeholder="Enter common support questions and answers here..."
        className="h-64 resize-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}
