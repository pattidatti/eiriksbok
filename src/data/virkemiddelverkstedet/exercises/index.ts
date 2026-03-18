import type { Exercise, Level } from '../types';
import { metaforExercises } from './metafor';
import { sammenligningExercises } from './sammenligning';
import { symbolExercises } from './symbol';
import { personifiseringExercises } from './personifisering';
import { besjelingExercises } from './besjeling';
import { frampekExercises } from './frampek';
import { tilbakeblikkExercises } from './tilbakeblikk';
import { inMediasResExercises } from './in-medias-res';
import { ironiExercises } from './ironi';
import { kontrastExercises } from './kontrast';
import { gjentakelseExercises } from './gjentakelse';
import { alliterasjonExercises } from './alliterasjon';
import { temaExercises } from './tema';
import { budskapExercises } from './budskap';

const allExercises: Exercise[] = [
    ...metaforExercises,
    ...sammenligningExercises,
    ...symbolExercises,
    ...personifiseringExercises,
    ...besjelingExercises,
    ...frampekExercises,
    ...tilbakeblikkExercises,
    ...inMediasResExercises,
    ...ironiExercises,
    ...kontrastExercises,
    ...gjentakelseExercises,
    ...alliterasjonExercises,
    ...temaExercises,
    ...budskapExercises,
];

export const getExercisesForDevice = (deviceId: string, level: Level): Exercise[] => {
    return allExercises.filter((e) => e.deviceId === deviceId && e.level === level);
};

export const getExerciseCountForDevice = (deviceId: string): number => {
    return allExercises.filter((e) => e.deviceId === deviceId).length;
};

export const getLevelExerciseCount = (deviceId: string, level: Level): number => {
    return allExercises.filter((e) => e.deviceId === deviceId && e.level === level).length;
};

export const hasExercises = (deviceId: string): boolean => {
    return allExercises.some((e) => e.deviceId === deviceId);
};
