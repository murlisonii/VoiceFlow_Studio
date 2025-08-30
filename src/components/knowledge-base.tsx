"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface KnowledgeBaseProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label: string;
  placeholder: string;
}

export function KnowledgeBase({ value, onChange, disabled, label, placeholder }: KnowledgeBaseProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="knowledge-base">{label}</Label>
      <Textarea
        id="knowledge-base"
        placeholder={placeholder}
        className="h-64 resize-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}
