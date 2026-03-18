import type { Exercise, ApplyLevel } from '../../types';
import { metaforApplyExercises } from './metafor';
import { sammenligningApplyExercises } from './sammenligning';
import { symbolApplyExercises } from './symbol';
import { personifiseringApplyExercises } from './personifisering';
import { besjelingApplyExercises } from './besjeling';
import { frampekApplyExercises } from './frampek';
import { tilbakeblikkApplyExercises } from './tilbakeblikk';
import { inMediasResApplyExercises } from './in-medias-res';
import { ironiApplyExercises } from './ironi';
import { kontrastApplyExercises } from './kontrast';
import { gjentakelseApplyExercises } from './gjentakelse';
import { alliterasjonApplyExercises } from './alliterasjon';
import { temaApplyExercises } from './tema';
import { budskapApplyExercises } from './budskap';

const allApplyExercises: Exercise[] = [
    ...metaforApplyExercises,
    ...sammenligningApplyExercises,
    ...symbolApplyExercises,
    ...personifiseringApplyExercises,
    ...besjelingApplyExercises,
    ...frampekApplyExercises,
    ...tilbakeblikkApplyExercises,
    ...inMediasResApplyExercises,
    ...ironiApplyExercises,
    ...kontrastApplyExercises,
    ...gjentakelseApplyExercises,
    ...alliterasjonApplyExercises,
    ...temaApplyExercises,
    ...budskapApplyExercises,
];

export const getApplyExercisesForDevice = (deviceId: string, level: ApplyLevel): Exercise[] => {
    return allApplyExercises.filter((e) => e.deviceId === deviceId && e.level === level);
};

export const getApplyExerciseCountForDevice = (deviceId: string): number => {
    return allApplyExercises.filter((e) => e.deviceId === deviceId).length;
};

export const getApplyLevelExerciseCount = (deviceId: string, level: ApplyLevel): number => {
    return allApplyExercises.filter((e) => e.deviceId === deviceId && e.level === level).length;
};

export const hasApplyExercises = (deviceId: string): boolean => {
    return allApplyExercises.some((e) => e.deviceId === deviceId);
};
