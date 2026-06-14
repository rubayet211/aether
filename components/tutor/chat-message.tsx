"use client";

import { motion } from "framer-motion";
import { Bot, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChatMessageItem = {
  id: string;
  role: string;
  content: string;
};

export function ChatMessage({ message }: { message: ChatMessageItem }) {
  const isStudent = message.role === "student";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", isStudent ? "justify-end" : "justify-start")}
    >
      {!isStudent ? (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-950 text-white">
          <Bot className="h-4 w-4" aria-hidden="true" />
        </div>
      ) : null}
      <div
        className={cn(
          "max-w-[82%] rounded-lg px-4 py-3 text-sm leading-6",
          isStudent ? "bg-teal-600 text-white" : "border border-slate-200 bg-white text-slate-800",
        )}
      >
        {message.content}
      </div>
      {isStudent ? (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
          <UserRound className="h-4 w-4" aria-hidden="true" />
        </div>
      ) : null}
    </motion.div>
  );
}
