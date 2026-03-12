import { create } from 'zustand';
import type { LayerType, SelectedFeature } from '../types';

interface Transform {
    scale: number;
    x: number;
    y: number;
}

interface AtlasStore {
    activeLayers: Set<LayerType>;
    selectedFeature: SelectedFeature | null;
    compareFeature: SelectedFeature | null;
    selectedCountry: string | null;
    yearFilter: number;
    layerOpacities: Record<LayerType, number>;
    viewTarget: Transform | null;

    toggleLayer: (layer: LayerType) => void;
    setSelectedFeature: (feature: SelectedFeature | null) => void;
    setCompareFeature: (feature: SelectedFeature | null) => void;
    setSelectedCountry: (country: string | null) => void;
    setYearFilter: (year: number) => void;
    setLayerOpacity: (layer: LayerType, opacity: number) => void;
    setViewTarget: (t: Transform | null) => void;
}

const DEFAULT_OPACITIES: Record<LayerType, number> = {
    shipping: 1,
    cables: 1,
    pipelines: 1,
    production: 1,
    chokepoints: 1,
    riskzones: 1,
};

export const useAtlasStore = create<AtlasStore>((set) => ({
    activeLayers: new Set<LayerType>(['shipping', 'cables']),
    selectedFeature: null,
    compareFeature: null,
    selectedCountry: null,
    yearFilter: 2024,
    layerOpacities: { ...DEFAULT_OPACITIES },
    viewTarget: null,

    toggleLayer: (layer) =>
        set((state) => {
            const next = new Set(state.activeLayers);
            if (next.has(layer)) next.delete(layer);
            else next.add(layer);
            return { activeLayers: next };
        }),
    setSelectedFeature: (feature) => set({ selectedFeature: feature }),
    setCompareFeature: (feature) => set({ compareFeature: feature }),
    setSelectedCountry: (country) => set({ selectedCountry: country }),
    setYearFilter: (year) => set({ yearFilter: year }),
    setLayerOpacity: (layer, opacity) =>
        set((state) => ({
            layerOpacities: { ...state.layerOpacities, [layer]: opacity },
        })),
    setViewTarget: (t) => set({ viewTarget: t }),
}));
