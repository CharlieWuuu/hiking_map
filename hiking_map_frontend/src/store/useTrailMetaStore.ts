import { create } from 'zustand';

interface TrailMetaState {
    owner_uuid: string | null;
    setOwnerUuid: (u: string | null) => void;
    type: string | null;
    setType: (t: string | null) => void;
    trail_uuid: string | null;
    setTrailUuid: (id: string | null) => void;
    version: number;
    setVersion: (v: number) => void;
    share: string | null;
    setShare: (s: string | null) => void;
}

export const useTrailMetaStore = create<TrailMetaState>((set) => ({
    owner_uuid: null,
    setOwnerUuid: (u) => set({ owner_uuid: u }),

    type: null,
    setType: (t) => set({ type: t }),

    trail_uuid: null,
    setTrailUuid: (id) => set({ trail_uuid: id }),

    version: 0,
    setVersion: (v) => set({ version: v }),

    share: null,
    setShare: (s) => set({ share: s }),
}));
