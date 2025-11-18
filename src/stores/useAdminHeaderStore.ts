"use client"

import { create } from "zustand"

export type AdminHeaderAction = {
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link"
    disabled?: boolean
}

type AdminHeaderState = {
    primaryAction: AdminHeaderAction | null
    setPrimaryAction: (action: AdminHeaderAction | null) => void
}

export const useAdminHeaderStore = create<AdminHeaderState>((set) => ({
    primaryAction: null,
    setPrimaryAction: (action) => set({ primaryAction: action }),
}))
