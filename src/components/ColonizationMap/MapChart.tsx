import React, { useEffect, useState, useMemo } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import * as topojson from 'topojson-client';
import { territoryHistory, countryColors, colonizationEvents } from './colonizationData';
import { Tooltip } from 'react-tooltip';

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface MapChartProps {
    year: number;
}

const MapChart: React.FC<MapChartProps> = ({ year }) => {
    const [geographies, setGeographies] = useState<any[]>([]);

    useEffect(() => {
        fetch(GEO_URL)
            .then(response => response.json())
            .then(worldData => {
                const countries = topojson.feature(worldData, worldData.objects.countries);
                setGeographies((countries as any).features);
            })
            .catch(error => console.error("Error loading map data:", error));
    }, []);

    const projection = useMemo(() => geoMercator().scale(140).translate([400, 250]), []);
    const pathGenerator = useMemo(() => geoPath().projection(projection), [projection]);

    const getCountryColor = (geo: any) => {
        const countryCode = geo.properties.ISO_A3; // Note: world-atlas 110m might use different properties, usually ISO_A3 or name
        // Verify property name if possible, usually it is properties.name or properties.id (ISO 3 digit)
        // For this specific CDN, it often has ISO_A3. Let's assume it does or fallback.
        // Actually, world-atlas 110m usually has 'name' and 'id' (numeric). 
        // We might need a mapping or use a different source if ISO_A3 is missing.
        // Let's try to use 'name' for now if ISO_A3 is missing, or map numeric ID.
        // For robustness, let's assume we might need to adjust this.

        // Quick fix: check if ISO_A3 exists, otherwise use name mapping or default.
        // Ideally we would inspect the data.

        const history = territoryHistory[countryCode] || territoryHistory[geo.properties.name];

        if (!history) return countryColors["default"];

        const period = history.find(h => year >= h.start && year <= h.end);
        if (period) {
            return countryColors[period.owner] || countryColors["default"];
        }

        return countryColors["default"];
    };

    const currentEvents = colonizationEvents.filter(e => e.year === year);

    return (
        <div className="w-full h-full bg-blue-50 rounded-lg overflow-hidden relative flex justify-center items-center">
            <svg width={800} height={500} viewBox="0 0 800 500">
                <g>
                    {geographies.map((geo, i) => {
                        const d = pathGenerator(geo);
                        return (
                            <path
                                key={i}
                                d={d || ""}
                                fill={getCountryColor(geo)}
                                stroke="#D6D6DA"
                                strokeWidth={0.5}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content={geo.properties.name}
                                style={{ transition: 'fill 0.5s ease' }}
                            />
                        );
                    })}
                </g>
                <g>
                    {currentEvents.map((event, index) => {
                        const [x, y] = projection([event.location[1], event.location[0]]) || [0, 0];
                        return (
                            <g key={index} transform={`translate(${x}, ${y})`}>
                                <circle r={5} fill="#F00" stroke="#fff" strokeWidth={2} />
                                <text
                                    textAnchor="middle"
                                    y={-10}
                                    style={{ fontFamily: "system-ui", fill: "#5D5A6D", fontSize: "10px", fontWeight: 'bold' }}
                                >
                                    {event.event}
                                </text>
                            </g>
                        );
                    })}
                </g>
            </svg>
            <Tooltip id="my-tooltip" />
        </div>
    );
};

export default MapChart;
