export type LayerType = 'shipping' | 'cables' | 'pipelines' | 'production' | 'chokepoints' | 'riskzones';

export interface LayerConfig {
    id: LayerType;
    label: string;
    color: string;
    description: string;
}

export interface Pipeline {
    id: string;
    name: string;
    type: 'oil' | 'gas' | 'lng';
    countries: string;
    coordinates: [number, number][];
    capacity?: string;
    yearCompleted?: number;
    description?: string;
}

export interface ProductionSite {
    id: string;
    name: string;
    country: string;
    type: 'oil' | 'gas' | 'both';
    mbpd: number;
    coordinates: [number, number]; // [lng, lat]
    description?: string;
}

export interface SubmarineCable {
    id: string;
    name: string;
    color?: string;
    owners?: string[];
    capacityTbps?: number;
    yearCompleted?: number;
    coordinates: [number, number][];
}

export interface ShippingLane {
    id: string;
    name: string;
    type: 'major' | 'secondary';
    coordinates: [number, number][];
    description?: string;
}

export interface Chokepoint {
    id: string;
    name: string;
    coordinates: [number, number];
    throughput: string;
    shipsPerDay?: number;
    type: 'oil' | 'shipping' | 'both';
    description: string;
    snlUrl?: string;
}

export interface RiskZone {
    id: string;
    name: string;
    color: string;
    coordinates: [number, number][];
    description: string;
    snlUrl?: string;
}

export interface SelectedFeature {
    type: LayerType;
    data: Pipeline | ProductionSite | SubmarineCable | ShippingLane | Chokepoint | RiskZone;
}
