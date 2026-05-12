import type { ConclusionResult } from './ConclusionScreen';
import { METHOD_LABEL } from './types';
import type { DetectiveCase, DetectiveClue } from './types';

export function buildReport(
    caseData: DetectiveCase,
    collectedClues: DetectiveClue[],
    result: ConclusionResult | null,
    stars: number
): string {
    const lines: string[] = [];
    lines.push('# Etterforskningsrapport');
    lines.push('');
    lines.push(`**Sak:** ${caseData.title}`);
    if (caseData.period) lines.push(`**Periode:** ${caseData.period}`);
    if (caseData.location) lines.push(`**Sted:** ${caseData.location}`);
    lines.push(`**Avsluttet:** ${new Date().toLocaleDateString('no-NO')}`);
    lines.push(`**Stjerner:** ${stars}/3`);
    lines.push('');

    if (result) {
        const chosen = caseData.conclusion_engine.options.find(
            (o) => o.id === result.optionId
        );
        lines.push('## Konklusjon');
        lines.push(`> ${caseData.conclusion_engine.question}`);
        lines.push('');
        lines.push(`**Mitt svar:** ${chosen?.text ?? ''}`);
        lines.push(
            `**Vurdering:** ${result.isCorrect ? 'Stemmer med historikerkonsensus.' : 'Avviker fra historikerkonsensus.'}`
        );
        lines.push(
            `**Bevisbruk:** ${result.strongEvidenceCount} sterke, ${result.weakEvidenceCount} svake`
        );
        if (chosen?.feedback) {
            lines.push('');
            lines.push(`> ${chosen.feedback}`);
        }
        lines.push('');
    }

    if (collectedClues.length > 0) {
        lines.push('## Bevis funnet');
        for (const clue of collectedClues) {
            lines.push(`- **"${clue.text}"** - ${clue.insight}`);
        }
        lines.push('');
    }

    const methods = new Set<string>();
    for (const c of collectedClues) {
        if (c.method) methods.add(METHOD_LABEL[c.method]);
    }
    if (methods.size > 0) {
        lines.push('## Historiske metoder anvendt');
        for (const m of methods) lines.push(`- ${m}`);
        lines.push('');
    }

    if (caseData.kompetansemaal && caseData.kompetansemaal.length > 0) {
        lines.push('## Kompetansemål');
        for (const k of caseData.kompetansemaal) lines.push(`- ${k}`);
        lines.push('');
    }

    if (caseData.relatedArticles && caseData.relatedArticles.length > 0) {
        lines.push('## Les mer');
        for (const a of caseData.relatedArticles) {
            lines.push(`- [${a.title}](${a.path})`);
        }
        lines.push('');
    }

    lines.push('---');
    lines.push('_Generert i Eiriksbok - Historisk Detektiv._');
    return lines.join('\n');
}

export async function copyReport(report: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(report);
        return true;
    } catch {
        return false;
    }
}

export function downloadReport(report: string, caseTitle: string) {
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeTitle = caseTitle.replace(/[^a-zæøå0-9\- ]/gi, '').replace(/\s+/g, '-');
    a.download = `etterforskningsrapport-${safeTitle.toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
