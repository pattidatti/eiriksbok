import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChoiceButton } from './ChoiceButton';
import { SectionTitle } from './SectionTitle';
import {
    SparklesIcon,
    UserIcon,
    UserGroupIcon,
    GlobeAmericasIcon,
    BanknotesIcon,
    ShieldExclamationIcon,
    ScaleIcon,
    BookOpenIcon,
    AcademicCapIcon,
    BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

interface ExplorerControlsProps {
    whoRules: 'ingen' | 'en' | 'få' | 'alle' | null;
    setWhoRules: (val: 'ingen' | 'en' | 'få' | 'alle' | null) => void;
    anarchyType: 'kapital' | 'felles' | null;
    setAnarchyType: (val: 'kapital' | 'felles' | null) => void;
    oneRulerSource: 'arv' | 'makt' | null;
    setOneRulerSource: (val: 'arv' | 'makt' | null) => void;
    monarchyType: 'absolutt' | 'konstitusjonelt' | null;
    setMonarchyType: (val: 'absolutt' | 'konstitusjonelt' | null) => void;
    dictatorType: 'person' | 'militær' | 'parti' | null;
    setDictatorType: (val: 'person' | 'militær' | 'parti' | null) => void;
    dictatorScope: 'politikk' | 'alt' | null;
    setDictatorScope: (val: 'politikk' | 'alt' | null) => void;
    fewRulerType: 'rike' | 'penger' | 'adel' | 'tyv' | 'eksperter' | 'religion' | null;
    setFewRulerType: (val: 'rike' | 'penger' | 'adel' | 'tyv' | 'eksperter' | 'religion' | null) => void;
    demoMethod: 'direkte' | 'representanter' | null;
    setDemoMethod: (val: 'direkte' | 'representanter' | null) => void;
    headOfState: 'konge' | 'president' | null;
    setHeadOfState: (val: 'konge' | 'president' | null) => void;
    powerRelation: 'parlamentarisk' | 'separat' | null;
    setPowerRelation: (val: 'parlamentarisk' | 'separat' | null) => void;
    resetBranch: () => void;
}

export const ExplorerControls: React.FC<ExplorerControlsProps> = ({
    whoRules, setWhoRules,
    anarchyType, setAnarchyType,
    oneRulerSource, setOneRulerSource,
    monarchyType, setMonarchyType,
    dictatorType, setDictatorType,
    dictatorScope, setDictatorScope,
    fewRulerType, setFewRulerType,
    demoMethod, setDemoMethod,
    headOfState, setHeadOfState,
    powerRelation, setPowerRelation,
    resetBranch
}) => {
    return (
        <div className="lg:col-span-5 space-y-6">
            {/* Steg 1: Hvem bestemmer? */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
                <SectionTitle>1. Hvem bestemmer i samfunnet?</SectionTitle>
                <div className="grid grid-cols-1 gap-3">
                    <ChoiceButton
                        label="Ingen"
                        subtext="Alle passer på seg selv"
                        selected={whoRules === 'ingen'}
                        onClick={() => { setWhoRules('ingen'); resetBranch(); }}
                        icon={SparklesIcon}
                    />
                    <ChoiceButton
                        label="Én person"
                        subtext="All makt hos en leder"
                        selected={whoRules === 'en'}
                        onClick={() => { setWhoRules('en'); resetBranch(); }}
                        icon={UserIcon}
                    />
                    <ChoiceButton
                        label="En liten gruppe"
                        subtext="En elite styrer"
                        selected={whoRules === 'få'}
                        onClick={() => { setWhoRules('få'); resetBranch(); }}
                        icon={UserGroupIcon}
                    />
                    <ChoiceButton
                        label="Hele folket"
                        subtext="Demokrati"
                        selected={whoRules === 'alle'}
                        onClick={() => { setWhoRules('alle'); resetBranch(); }}
                        icon={GlobeAmericasIcon}
                    />
                </div>
            </div>

            {/* Steg 2: Forgreninger */}
            <AnimatePresence mode="wait">
                {whoRules === 'ingen' && (
                    <motion.div
                        key="anarchy"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm"
                    >
                        <SectionTitle>2. Hvordan fungerer økonomien?</SectionTitle>
                        <div className="space-y-3">
                            <ChoiceButton
                                label="Privat eiendom (Marked)"
                                subtext="Anarko-kapitalisme"
                                selected={anarchyType === 'kapital'}
                                onClick={() => setAnarchyType('kapital')}
                                icon={BanknotesIcon}
                            />
                            <ChoiceButton
                                label="Felles eiendom (Ingen penger)"
                                subtext="Anarko-kommunisme"
                                selected={anarchyType === 'felles'}
                                onClick={() => setAnarchyType('felles')}
                                icon={UserGroupIcon}
                            />
                        </div>
                    </motion.div>
                )}

                {whoRules === 'en' && (
                    <motion.div
                        key="one"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <SectionTitle>2. Hvor kommer makten fra?</SectionTitle>
                            <div className="space-y-3">
                                <ChoiceButton
                                    label="Arv (Blodsbånd)"
                                    subtext="Kongefamilie"
                                    selected={oneRulerSource === 'arv'}
                                    onClick={() => { setOneRulerSource('arv'); setDictatorType(null); setDictatorScope(null); }}
                                    icon={UserIcon}
                                />
                                <ChoiceButton
                                    label="Makt (Kupp/Militær)"
                                    subtext="Diktatur"
                                    selected={oneRulerSource === 'makt'}
                                    onClick={() => { setOneRulerSource('makt'); setMonarchyType(null); }}
                                    icon={ShieldExclamationIcon}
                                />
                            </div>
                        </div>

                        {oneRulerSource === 'arv' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm"
                            >
                                <SectionTitle>3. Hvor mye makt har monarken?</SectionTitle>
                                <div className="space-y-3">
                                    <ChoiceButton
                                        label="All makt (Enevelde)"
                                        subtext="Absolutt monarki"
                                        selected={monarchyType === 'absolutt'}
                                        onClick={() => setMonarchyType('absolutt')}
                                        icon={UserIcon}
                                    />
                                    <ChoiceButton
                                        label="Begrenset av loven"
                                        subtext="Konstitusjonelt monarki"
                                        selected={monarchyType === 'konstitusjonelt'}
                                        onClick={() => setMonarchyType('konstitusjonelt')}
                                        icon={ScaleIcon}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {oneRulerSource === 'makt' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-red-500"
                            >
                                <SectionTitle>3. Hvem styrer diktaturet?</SectionTitle>
                                <div className="space-y-3">
                                    <ChoiceButton
                                        label="Enkeltperson"
                                        subtext="Klassisk diktatur"
                                        selected={dictatorType === 'person'}
                                        onClick={() => setDictatorType('person')}
                                        icon={UserIcon}
                                    />
                                    <ChoiceButton
                                        label="Militæret"
                                        subtext="Militærjunta"
                                        selected={dictatorType === 'militær'}
                                        onClick={() => setDictatorType('militær')}
                                        icon={ShieldExclamationIcon}
                                    />
                                    <ChoiceButton
                                        label="Ett politisk parti"
                                        subtext="Ettpartistat"
                                        selected={dictatorType === 'parti'}
                                        onClick={() => setDictatorType('parti')}
                                        icon={UserGroupIcon}
                                    />
                                </div>

                                {dictatorType === 'person' && (
                                    <div className="mt-6">
                                        <SectionTitle>4. Hvor mye kontrollerer staten?</SectionTitle>
                                        <div className="space-y-3">
                                            <ChoiceButton
                                                label="Kun politikken (Autoritær)"
                                                subtext="Folk lever ellers fritt"
                                                selected={dictatorScope === 'politikk'}
                                                onClick={() => setDictatorScope('politikk')}
                                                icon={ShieldExclamationIcon}
                                            />
                                            <ChoiceButton
                                                label="Alt! (Totalitær)"
                                                subtext="Tankekontroll og overvåkning"
                                                selected={dictatorScope === 'alt'}
                                                onClick={() => setDictatorScope('alt')}
                                                icon={ShieldExclamationIcon}
                                            />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {whoRules === 'få' && (
                    <motion.div
                        key="few"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm"
                    >
                        <SectionTitle>2. Hvilken gruppe styrer?</SectionTitle>
                        <div className="space-y-3">
                            <ChoiceButton
                                label="De rikeste"
                                subtext="Plutokrati"
                                selected={fewRulerType === 'penger'}
                                onClick={() => setFewRulerType('penger')}
                                icon={BanknotesIcon}
                            />
                            <ChoiceButton
                                label="Adelen / Overklassen"
                                subtext="Aristokrati"
                                selected={fewRulerType === 'adel'}
                                onClick={() => setFewRulerType('adel')}
                                icon={UserIcon}
                            />
                            <ChoiceButton
                                label="Religiøse ledere"
                                subtext="Teokrati"
                                selected={fewRulerType === 'religion'}
                                onClick={() => setFewRulerType('religion')}
                                icon={BookOpenIcon}
                            />
                            <ChoiceButton
                                label="Eksperter / De dyktigste"
                                subtext="Meritokrati / Teknokrati"
                                selected={fewRulerType === 'eksperter'}
                                onClick={() => setFewRulerType('eksperter')}
                                icon={AcademicCapIcon}
                            />
                            <ChoiceButton
                                label="De som stjeler"
                                subtext="Kleptokrati"
                                selected={fewRulerType === 'tyv'}
                                onClick={() => setFewRulerType('tyv')}
                                icon={BanknotesIcon}
                            />
                        </div>
                    </motion.div>
                )}

                {whoRules === 'alle' && (
                    <motion.div
                        key="all"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <SectionTitle>2. Hvordan tas beslutninger?</SectionTitle>
                            <div className="space-y-3">
                                <ChoiceButton
                                    label="Velger representanter"
                                    subtext="Vi stemmer på politikere"
                                    selected={demoMethod === 'representanter'}
                                    onClick={() => { setDemoMethod('representanter'); setHeadOfState(null); setPowerRelation(null); }}
                                    icon={UserGroupIcon}
                                />
                                <ChoiceButton
                                    label="Direkte avstemning"
                                    subtext="Vi stemmer på hver sak"
                                    selected={demoMethod === 'direkte'}
                                    onClick={() => { setDemoMethod('direkte'); setHeadOfState(null); }}
                                    icon={ScaleIcon}
                                />
                            </div>
                        </div>

                        {demoMethod === 'representanter' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm"
                            >
                                <SectionTitle>3. Hvem er statsoverhode?</SectionTitle>
                                <div className="space-y-3">
                                    <ChoiceButton
                                        label="Konge / Dronning"
                                        subtext="Monarki"
                                        selected={headOfState === 'konge'}
                                        onClick={() => { setHeadOfState('konge'); setPowerRelation(null); }}
                                        icon={UserIcon}
                                    />
                                    <ChoiceButton
                                        label="President (Ingen konge)"
                                        subtext="Republikk"
                                        selected={headOfState === 'president'}
                                        onClick={() => setHeadOfState('president')}
                                        icon={BuildingOfficeIcon}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {headOfState === 'president' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-indigo-500"
                            >
                                <SectionTitle>4. Forholdet til parlamentet?</SectionTitle>
                                <div className="space-y-3">
                                    <ChoiceButton
                                        label="Regjeringen utgår fra parlamentet"
                                        subtext="Parlamentarisk republikk (f.eks. Island)"
                                        selected={powerRelation === 'parlamentarisk'}
                                        onClick={() => setPowerRelation('parlamentarisk')}
                                        icon={GlobeAmericasIcon}
                                    />
                                    <ChoiceButton
                                        label="Separat valg av president"
                                        subtext="President-republikk (f.eks. USA)"
                                        selected={powerRelation === 'separat'}
                                        onClick={() => setPowerRelation('separat')}
                                        icon={ShieldExclamationIcon}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
