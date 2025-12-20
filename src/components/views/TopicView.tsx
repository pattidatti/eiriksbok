import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import { TopicCard } from '../TopicCard';
import { getTopicLink } from '../../utils/navigationUtils';

interface TopicViewProps {
    subjectData: any;
    subjectId: string;
}

export const TopicView: React.FC<TopicViewProps> = ({ subjectData, subjectId }) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-12">
            {/* Tools Section */}
            {subjectData.tools && subjectData.tools.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjectData.tools.map((tool: any) => (
                        <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => navigate(tool.link)}
                            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-all group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                    {/* You might want to dynamically render icons here based on tool.icon */}
                                    <LayoutGrid size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                                        {tool.title}
                                    </h3>
                                    <p className="text-sm text-slate-600">
                                        {tool.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Topics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {subjectData.topics.map((topic: any, index: number) => {
                    // Calculate total lessons
                    let lessonCount = 0;
                    if (topic.subTopics) {
                        topic.subTopics.forEach((st: any) => lessonCount += st.lessons?.length || 0);
                    } else if (topic.lessons) {
                        lessonCount = topic.lessons.length;
                    }

                    return (
                        <motion.div
                            key={topic.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="h-full"
                        >

                            <TopicCard
                                title={topic.title}
                                description={topic.description}
                                image={topic.image}
                                path={subjectId ? getTopicLink(subjectId, topic) : '#'}
                                lessonCount={lessonCount}
                            />
                        </motion.div>
                    );
                })}
            </div>
            {subjectData.topics.length === 0 && (
                <p className="text-text-muted text-center py-12">Ingen emner lagt til enda.</p>
            )}
        </div>
    );
};
