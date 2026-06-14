"use client";

import { create } from "zustand";
import type { TutorMode } from "@/lib/ai/schemas";

type TutorState = {
  mode: TutorMode;
  selectedTopicId?: string;
  setMode: (mode: TutorMode) => void;
  setSelectedTopicId: (topicId?: string) => void;
};

export const useTutorStore = create<TutorState>((set) => ({
  mode: "guided_reasoning",
  selectedTopicId: undefined,
  setMode: (mode) => set({ mode }),
  setSelectedTopicId: (selectedTopicId) => set({ selectedTopicId }),
}));
