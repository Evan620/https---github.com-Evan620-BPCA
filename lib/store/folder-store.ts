import { create } from 'zustand'

interface FolderStore {
    activeFolder: string | null
    setActiveFolder: (folderId: string | null) => void
}

export const useFolderStore = create<FolderStore>((set) => ({
    activeFolder: null,
    setActiveFolder: (folderId) => set({ activeFolder: folderId }),
}))
