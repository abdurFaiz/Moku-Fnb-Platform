import { useEffect } from 'react';

export const useScrollToTop = (dependencies: any[] = [], offset: number = 0) => {
    useEffect(() => {
        window.scrollTo({
            top: offset,
            left: 0,
            behavior: 'smooth'
        });
    }, dependencies);
};  