import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Modular World Map Components
import type { SimulationPlayer } from './simulationTypes';
import { getDayPart } from './utils/timeUtils';

import { useWorldMapLogic } from './hooks/useWorldMapLogic';
import { POINTS_OF_INTEREST } from './data/WorldMapData';

import { TavernDiceGame } from './TavernDiceGame';
import { FloatingActionTooltip } from './components/FloatingActionTooltip';
import { SimulationAtmosphereLayer } from './components/SimulationAtmosphereLayer';
import { SimulationProcessHUD } from './components/SimulationProcessHUD';
import { SimulationMapWindow } from './components/ui/SimulationMapWindow';
import { ChickenCoopWindow } from './components/ChickenCoopWindow';
import { BuildingUpgradeWindow } from './components/BuildingUpgradeWindow.tsx';
import { TavernDialog } from './components/TavernDialog.tsx';
import { WorldMapPOI } from './components/WorldMap/WorldMapPOI';
import { WorldMapEvents } from './components/WorldMap/WorldMapEvents.tsx';
import { WorldMapKingdomPins } from './components/WorldMap/WorldMapKingdomPins';

interface WorldMapProps {
    player: SimulationPlayer;
    world: any;
    worldEvents?: any;
    players?: Record<string, SimulationPlayer>;
    onAction: (action: any) => void;
    onOpenMarket: () => void;
    room: any;
}

export const WorldMap: React.FC<WorldMapProps> = React.memo(({ player, room, world, worldEvents, players, onAction, onOpenMarket }) => {
    const {
        viewMode,
        setViewMode,
        viewingRegionId,
        setViewingRegionId,
        selectedPOI,
        setSelectedPOI,
        selectedEvent,
        setSelectedEvent,
        upgradingBuildingId,
        setUpgradingBuildingId,
        dialogNPC,
        setDialogNPC,
        dialogStep,
        setDialogStep,
        isDiceGameOpen,
        setIsDiceGameOpen,
        isChickenCoopOpen,
        setIsChickenCoopOpen,
        direction,
        handlePOIAction
    } = useWorldMapLogic(player, onAction, onOpenMarket);

    const weather = world?.weather || 'Clear';

    const getBackground = () => {
        const isNight = getDayPart(room.world?.gameTick || 0) === 'NIGHT';
        const isWinter = world?.season === 'Winter';

        switch (viewMode) {
            case 'kingdom':
                if (isWinter) return isNight ? '/map_kingdom_169_winter_night.png' : '/map_kingdom_169_winter.png';
                return isNight ? '/map_kingdom_169_night.png' : '/map_kingdom_169.png';
            case 'village':
                if (isWinter) return isNight ? '/map_village_hub_1610_winter_night.png' : '/map_village_hub_1610_winter.png';
                return isNight ? '/map_village_hub_1610_night.png' : '/map_village_hub_1610.png';
            case 'village_construction': return '/map_village_construction.png';
            case 'castle': return '/map_castle_interior.png';
            case 'fields':
                if (isWinter) return isNight ? '/map_farm_fields_winter_night.png' : '/map_farm_fields_winter.png';
                return isNight ? '/map_farm_fields_night.png' : '/map_farm_fields.png';
            case 'peasant_farm': {
                const level = world?.settlement?.buildings?.farm_house?.level || 1;
                return level > 1 ? `/map_peasant_farm_lvl${level}.png` : '/map_peasant_farm.png';
            }
            case 'farm_house': {
                const level = world?.settlement?.buildings?.farm_house?.level || 1;
                return level > 1 ? `/map_stugo_interior_lvl${level}.png` : '/map_stugo_interior.png';
            }
            case 'mine':
                if (isWinter) return isNight ? '/map_mountain_pass_winter_night.png' : '/map_mountain_pass_winter.png';
                return isNight ? '/map_mountain_pass_night.png' : '/map_mountain_pass.png';
            case 'forest':
                if (isWinter) return isNight ? '/map_forest_winter_night.png' : '/map_forest_winter.png';
                return isNight ? '/map_forest_night.png' : '/map_forest.png';
            case 'monastery':
                if (isWinter) return isNight ? '/map_monastery_winter_night.png' : '/map_monastery_winter.png';
                return isNight ? '/map_monastery_night.png' : '/map_monastery.png';
            case 'tavern': return '/map_tavern_interior.png';
            case 'great_forge': return '/map_forge_interior.png';
            case 'bakery': return '/map_bakery_interior.png';
            case 'windmill': return '/map_windmill_interior.png';
            case 'sawmill': return '/map_sawmill_interior.png';
            case 'smeltery': return '/map_smeltery_interior.png';
            case 'weavery': return '/map_weavery_interior.png';
            case 'stables': return '/map_stables_interior.png';
            case 'watchtower': return '/map_watchtower_interior.png';
            case 'well':
                if (isWinter) return isNight ? '/map_well_interior_winter_night.png' : '/map_well_interior_winter.png';
                return isNight ? '/map_well_interior_night.png' : '/map_well_interior.png';
            case 'apothecary': return '/map_apothecary_interior.png';
            case 'global':
                if (viewingRegionId === 'region_ost') {
                    if (isWinter) return isNight ? '/map_barony_ost_169_winter_night.png' : '/map_barony_ost_169_winter.png';
                    return isNight ? '/map_barony_ost_169_night.png' : '/map_barony_ost_169.png';
                }
                if (viewingRegionId === 'capital') {
                    if (isWinter) return isNight ? '/map_hovedstad_169_winter_night.png' : '/map_hovedstad_169_winter.png';
                    return isNight ? '/map_hovedstad_169_night.png' : '/map_hovedstad_169.png';
                }
                if (isWinter) return isNight ? '/map_barony_vest_v2_1610_winter_night.png' : '/map_barony_vest_v2_1610_winter.png';
                return isNight ? '/map_barony_vest_v2_1610_night.png' : '/map_barony_vest_v2_1610.png';
            default:
                return '/map_barony_vest_v2_1610.png';
        }
    };

    const isWidescreen = viewMode === 'kingdom' || (viewMode === 'global' && (viewingRegionId === 'region_ost' || viewingRegionId === 'capital'));
    const aspectRatioClass = isWidescreen ? 'aspect-video' : 'aspect-[16/10]';

    const containerVariants = {
        initial: (dir: 'in' | 'out') => ({ opacity: 0, scale: dir === 'in' ? 0.9 : 1.1, filter: 'blur(10px)' }),
        animate: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any, staggerChildren: 0.05 } },
        exit: (dir: 'in' | 'out') => ({ opacity: 0, scale: dir === 'in' ? 1.1 : 0.9, filter: 'blur(10px)', transition: { duration: 0.4, ease: [0.7, 0, 0.84, 0] as any } })
    };

    const mapKey = `${viewMode}-${viewingRegionId}`;
    const currentPOI = useMemo(() => POINTS_OF_INTEREST.find(p => p.id === viewMode), [viewMode]);
    const isInterior = !!currentPOI?.isInterior;

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
            <div className={`relative w-full max-w-full max-h-full mx-auto ${aspectRatioClass} rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] border-4 border-white/5 bg-slate-950 transition-all duration-1000`}>
                <AnimatePresence mode="popLayout" custom={direction}>
                    <motion.div key={mapKey} custom={direction} variants={containerVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0 w-full h-full">
                        <motion.img src={getBackground()} alt="Map View" className={`w-full h-full object-cover ${weather === 'Fog' ? 'blur-sm' : ''}`} />
                        <SimulationAtmosphereLayer weather={weather} season={world?.season || 'Spring'} isInterior={isInterior} />

                        <div className="absolute inset-0 pointer-events-none">
                            {viewMode === 'kingdom' && (
                                <WorldMapKingdomPins players={players || {}} setViewingRegionId={setViewingRegionId} setViewMode={setViewMode} />
                            )}
                            <WorldMapPOI viewMode={viewMode} viewingRegionId={viewingRegionId} player={player} onSelect={setSelectedPOI} onEnterHub={setViewMode} />
                            <WorldMapEvents viewMode={viewMode} viewingRegionId={viewingRegionId} worldEvents={worldEvents} onSelect={setSelectedEvent} />
                        </div>
                    </motion.div>
                </AnimatePresence>

                <SimulationProcessHUD player={player} />

                {/* Back Button */}
                {viewMode !== 'kingdom' && (
                    <button
                        onClick={() => {
                            if (viewMode === 'global') setViewMode('kingdom');
                            else {
                                const hub = POINTS_OF_INTEREST.find(p => p.id === viewMode);
                                if (hub?.parentId) setViewMode(hub.parentId);
                                else setViewMode('global');
                            }
                        }}
                        className="absolute top-6 left-6 z-50 px-6 py-3 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-white/20 transition-all active:scale-95 flex items-center gap-2 group"
                    >
                        <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span>
                        Tilbake
                    </button>
                )}

                {/* Selected Event Modal */}
                {selectedEvent && (
                    <div className="absolute inset-x-6 bottom-6 z-40 animate-in slide-in-from-bottom-8 duration-500">
                        <div className="bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] border border-white/10 p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${selectedEvent.type === 'RAID' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-500'}`}>
                                        {selectedEvent.type === 'RAID' ? '🚨 Akutt Trussel' : '📜 Spesielt Oppdrag'}
                                    </span>
                                    <h3 className="text-3xl font-black text-white mt-4 tracking-tighter">{selectedEvent.title}</h3>
                                </div>
                                <button onClick={() => setSelectedEvent(null)} className="w-10 h-10 bg-white/5 hover:bg-white/10 text-white rounded-full flex items-center justify-center transition-colors">×</button>
                            </div>
                            <p className="text-sm font-medium text-slate-400 mb-8 leading-relaxed italic opacity-80">"{selectedEvent.description}"</p>
                            <button
                                onClick={() => {
                                    onAction({ type: selectedEvent.type === 'RAID' ? 'DEFEND' : 'EXPLORE', eventId: selectedEvent.id });
                                    setSelectedEvent(null);
                                }}
                                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl transition-all active:scale-95 ${selectedEvent.type === 'RAID' ? 'bg-rose-600 text-white shadow-rose-600/20' : 'bg-amber-500 text-slate-950 shadow-amber-500/20'}`}
                            >
                                {selectedEvent.type === 'RAID' ? 'TIL VÅPEN! 🗡️' : 'UTFORSK OMRÅDET! 🧭'}
                            </button>
                        </div>
                    </div>
                )}

                <AnimatePresence>
                    {selectedPOI && (
                        <FloatingActionTooltip poi={selectedPOI} player={player} room={room} onAction={(act) => handlePOIAction(selectedPOI.id, act)} onClose={() => setSelectedPOI(null)} viewingRegionId={viewingRegionId} />
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {upgradingBuildingId && (
                    <SimulationMapWindow title="Bygg & Oppgrader" onClose={() => setUpgradingBuildingId(null)}>
                        <BuildingUpgradeWindow buildingId={upgradingBuildingId} player={player} room={room} onAction={onAction} />
                    </SimulationMapWindow>
                )}
                {isDiceGameOpen && (
                    <TavernDiceGame playerGold={player.resources?.gold || 0} onClose={() => setIsDiceGameOpen(false)} onPlay={(res: any) => onAction({ type: 'PLAY_DICE', ...res })} />
                )}
                {isChickenCoopOpen && (
                    <ChickenCoopWindow player={player} activeProcesses={player.activeProcesses || []} onAction={onAction} onClose={() => setIsChickenCoopOpen(false)} />
                )}
                {dialogNPC && (
                    <TavernDialog npc={dialogNPC} step={dialogStep} setStep={setDialogStep} onClose={() => setDialogNPC(null)} />
                )}
            </AnimatePresence>
        </div>
    );
});

WorldMap.displayName = 'WorldMap';
