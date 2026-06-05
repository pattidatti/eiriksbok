import { motion } from 'framer-motion';

export interface PinTooltipData {
    label: string;
    items: { title: string; date: string }[]; // synlige hendelser i klyngen (maks 3)
    extra: number; // antall flere ut over de viste
    x: number; // piksel-posisjon i kart-containeren
    y: number;
    flip: boolean; // legg kortet til venstre for peker når nær høyre kant
}

interface Props {
    data: PinTooltipData | null;
}

// Liten glass-tooltip for hendelses-pins (klynger). Speiler AtlasCountryTooltip,
// men lister hendelsene på stedet i stedet for land-statistikk.
export function AtlasPinTooltip({ data }: Props) {
    if (!data) return null;

    return (
        <motion.div
            key={data.label + data.x}
            initial={{ opacity: 0, scale: 0.92, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28, mass: 0.5 }}
            className="pointer-events-none absolute z-40 w-52"
            style={{
                left: data.x,
                top: data.y,
                transform: `translate(${data.flip ? '-100%' : '0'}, -50%) translateX(${
                    data.flip ? '-14px' : '14px'
                })`,
            }}
        >
            <div className="rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl border border-slate-200/80 overflow-hidden">
                <div className="px-3.5 pt-2.5 pb-2">
                    <h3 className="font-bold text-slate-800 leading-tight text-[14px]">{data.label}</h3>
                    <ul className="mt-1.5 space-y-1">
                        {data.items.map((it, i) => (
                            <li key={i} className="flex gap-1.5 text-[12px] leading-snug">
                                <span className="font-semibold text-slate-500 tabular-nums shrink-0">
                                    {it.date}
                                </span>
                                <span className="text-slate-700 line-clamp-1">{it.title}</span>
                            </li>
                        ))}
                    </ul>
                    {data.extra > 0 && (
                        <p className="text-[11px] text-slate-400 mt-1">+{data.extra} til</p>
                    )}
                </div>
                <div className="px-3.5 py-1.5 bg-amber-600/95 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-white/95">
                        Klikk for å utforske
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
