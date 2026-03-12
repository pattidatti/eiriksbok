import { useState, useEffect } from 'react';

const FACTS = [
    '90 % av all verdenshandel fraktes med skip.',
    'Hormuzstredet er den mest kritiske oljeflaskehalsen — 21 mill. fat passerer daglig.',
    '99 % av all internetttrafikk mellom kontinenter går via undersjøiske kabler.',
    'Malaccastredet er verdens mest trafikkerte farvann med over 90 000 skip per år.',
    'Nord Stream-sabotasjen i 2022 var det største angrepet på europeisk infrastruktur siden 2. verdenskrig.',
    'Suezkanalen åpnet i 1869 og skar reisetiden mellom Europa og Asia med 7 000 km.',
    'Det er mer enn 1,4 million km undersjøiske kabler på havbunnen.',
    'Athabasca-oljesandene i Canada inneholder mer olje enn Saudi-Arabia.',
    'Ghawar-feltet i Saudi-Arabia har vært i produksjon siden 1951 og er fortsatt verdens største.',
    'Houthi-angrep fra 2023 tvang mange rederier til å ta omveien rundt Afrika — 10 dager ekstra.',
];

export function DidYouKnow() {
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setIdx((i) => (i + 1) % FACTS.length), 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col items-center justify-center h-full text-center">
            <div className="text-2xl mb-3">💡</div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Visste du at…
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">{FACTS[idx]}</p>
            <div className="flex gap-1 mt-3">
                {FACTS.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIdx(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? 'bg-sky-400' : 'bg-slate-600'}`}
                    />
                ))}
            </div>
        </div>
    );
}
