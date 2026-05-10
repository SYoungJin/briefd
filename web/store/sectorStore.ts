"use client";

import { create } from "zustand";
import { Sector } from "@/lib/types";

interface SectorStore {
  sector: Sector;
  setSector: (sector: Sector) => void;
}

export const useSectorStore = create<SectorStore>((set) => ({
  sector: "trend",
  setSector: (sector) => set({ sector })
}));
