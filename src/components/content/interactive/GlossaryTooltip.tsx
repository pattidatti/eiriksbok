import React from 'react';
import { Tooltip } from '../../Tooltip';

interface GlossaryTooltipProps {
    term: string;
    definition: string;
    content?: string;
}

export const GlossaryTooltip: React.FC<GlossaryTooltipProps> = ({ term, definition, content }) => {
    return (
        <Tooltip text={`${term}: ${definition}`}>
            {content || term}
        </Tooltip>
    );
};
