<p key={pIndex} className="mb-4 text-slate-700 leading-relaxed">
    {renderWithMarkdown(paragraph)}
</p>
                                ))}
                            </div >
                        );
                    case 'header':
return (
    <h2 key={index} className="text-2xl font-bold text-slate-800 mb-4 mt-8">
        {block.content}
    </h2>
);
                    case 'section':
return (
    <div key={index} className="my-8">
        {block.title && (
            <h2 className="text-2xl font-bold text-slate-800 mb-4">{block.title}</h2>
        )}
        {block.content && <ArticleContent content={block.content} />}
    </div>
);
                    case 'list':
return (
    <ul key={index} className="list-disc list-inside space-y-2 mb-8 text-slate-700">
        {block.items?.map((item: string, i: number) => (
            <li key={i} className="leading-relaxed">
                {renderWithMarkdown(item)}
            </li>
        ))}
    </ul>
);
                    case 'image':
return (
    <figure key={index} className="my-8">
        <img
            src={block.src}
            alt={block.alt}
            className="w-full rounded-xl shadow-lg"
        />
        {block.caption && (
            <figcaption className="mt-2 text-center text-sm text-gray-400 italic">
                {block.caption}
            </figcaption>
        )}
    </figure>
);
                    case 'component':
// Registry of available components
// In a real app, this might be dynamic or lazy loaded
switch (block.name) {
    // case 'DemographyModel':
    //     return <DemographyPage key={index} />;
    case 'GovernmentExplorer':
        return <GovernmentExplorer key={index} />;
    case 'HistoryLongLines':
        return <HistoryLongLines key={index} />;
    case 'Quiz':
        return <Quiz key={index} questions={(block.props?.questions as any) || []} />;
    case 'EICSimulation':
        return <EICSimulation key={index} />;
    case 'FactBox':
        return (
            <FactBox
                key={index}
                title={block.props?.title as string}
                content={block.props?.content as string}
            />
        );
    case 'TimelineComponent':
        return (
            <TimelineComponent
                key={index}
                events={(block.props?.events as any) || []}
                title={block.props?.title as string}
            />
        );
    case 'PlotGraph':
        return (
            <PlotGraph
                key={index}
                points={(block.props?.points as any) || []}
                title={block.props?.title as string}
                description={block.props?.description as string}
                xAxisLabel={block.props?.xAxisLabel as string}
                yAxisLabel={block.props?.yAxisLabel as string}
            />
        );
    default:
        return (
            <div key={index} className="p-4 border border-red-500 rounded text-red-500">
                Unknown component: {block.name}
            </div>
        );
}
                    case 'link':
const isExternal = block.url.startsWith('http');
const className = "inline-flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-700 rounded-full font-medium hover:bg-indigo-100 transition-colors my-4";

if (isExternal) {
    return (
        <a key={index} href={block.url} className={className} target="_blank" rel="noopener noreferrer">
            {block.text}
        </a>
    );
}

return (
    <Link key={index} to={block.url} className={className}>
        {block.text}
    </Link>
);
                    default:
return null;
                }
            })}
        </div >
    );
};
