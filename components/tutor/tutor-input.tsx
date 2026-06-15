"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function TutorInput({
  value,
  disabled,
  onChange,
  onSubmit,
}: {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="flex gap-3 border-t border-slate-200 bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Textarea
        aria-label="Message Aether"
        className="min-h-12 flex-1"
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (!disabled && value.trim().length > 0) onSubmit();
          }
        }}
        placeholder="Explain your thinking, not just your answer..."
      />
      <Button type="submit" disabled={disabled || value.trim().length === 0} aria-label="Send message">
        <Send className="h-4 w-4" aria-hidden="true" />
      </Button>
    </form>
  );
}
