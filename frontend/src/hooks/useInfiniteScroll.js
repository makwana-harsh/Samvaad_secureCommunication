import { useEffect, useRef } from "react";

/**
 * Custom hook to detect when a sentinel element comes into viewport.
 * @param {Function} onLoadMore - Function to invoke when sentinel is intersected.
 * @param {boolean} hasMore - Whether there are more pages to load.
 * @param {boolean} isLoading - Prevents duplicate network triggers.
 */
export function useInfiniteScroll(onLoadMore, hasMore, isLoading) {
    const observerRef = useRef(null);

    useEffect(() => {
        if (isLoading || !hasMore) return;

        const observer = new IntersectionObserver((entries) => 
            {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    onLoadMore();
                }
            },
            { threshold: 0.5 }
        );

        const currentTarget = observerRef.current;
        if (currentTarget) observer.observe(currentTarget);

        return () => {
            if (currentTarget) observer.unobserve(currentTarget);
        };
    }, [onLoadMore, hasMore, isLoading]);

    return observerRef;
}