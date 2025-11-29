import { useEffect } from 'react';

export const usePageTitle = (title: string, exact: boolean = false) => {
    useEffect(() => {
        const prevTitle = document.title;
        document.title = exact ? title : `${title} - Eiriks lærebok`;

        return () => {
            document.title = prevTitle;
        };
    }, [title, exact]);
};
