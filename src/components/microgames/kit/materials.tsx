import { useMemo } from 'react';
import { Outlines } from '@react-three/drei';
import { toonGradientMap } from './toonGradient';

// Signaturlook-komponenter: et tegneserieaktig toon-materiale og en kant. Begge
// valgfrie - bruk dem for den polerte, sammenhengende Eiriksbok-looken. GPU-billig
// og trygt på svake Chromebooks.

// Drop-in toon-materiale: <mesh><boxGeometry/><ToonMaterial color="#a8412f" /></mesh>
// Gir flat, koselig lavpoly-look som binder alle spill sammen visuelt.
export function ToonMaterial({
    color,
    ...rest
}: { color: string } & React.ComponentProps<'meshToonMaterial'>) {
    const gradientMap = useMemo(() => toonGradientMap(), []);
    return <meshToonMaterial color={color} gradientMap={gradientMap} {...rest} />;
}

// Tegneserie-kant rundt et mesh. Legg som siste barn i et <mesh>:
//   <mesh>...<KitOutline /></mesh>
// Bra for å fremheve valgte/klikkbare objekter (juicy og leselig).
export function KitOutline({
    thickness = 0.025,
    color = '#1f2937',
}: {
    thickness?: number;
    color?: string;
}) {
    return <Outlines thickness={thickness} color={color} />;
}
