import React from 'react';

// Minimal dummy component to debug crash
export const InteractiveArticle = ({ event, onClose }: any) => {
    console.log("InteractiveArticle mounted", event);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-500 text-white p-10">
            <div className="bg-black p-8 rounded-xl">
                <h1 className="text-4xl font-bold mb-4">DEBUG MODE</h1>
                <p>If you can see this, the component is rendering.</p>
                <p>Event: {event?.title}</p>
                <button onClick={onClose} className="mt-4 px-4 py-2 bg-white text-black rounded">Close</button>
            </div>
        </div>
    );
};
