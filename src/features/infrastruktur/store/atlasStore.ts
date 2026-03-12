import { create } from 'zustand';
import type { LayerType, SelectedFeature } from '../types';

interface AtlasStore {
    activeLayers: Set<LayerType>;
    selectedFeature: SelectedFeature | null;
    toggleLayer: (layer: LayerType) => void;
    setSelectedFeature: (feature: SelectedFeature | null) => void;
}

export const useAtlasStore = create<AtlasStore>((set) => ({
    activeLayers: new Set<LayerType>(['shipping', 'cables']),
    selectedFeature: null,
    toggleLayer: (layer) =>
        set((state) => {
            const next = new Set(state.activeLayers);
            if (next.has(layer)) next.delete(layer);
            else next.add(layer);
            return { activeLayers: next };
        }),
    setSelectedFeature: (feature) => set({ selectedFeature: feature }),
}));
