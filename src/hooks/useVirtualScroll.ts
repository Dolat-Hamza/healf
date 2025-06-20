import { useState, useMemo, useCallback } from 'react';

interface UseVirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface UseVirtualScrollResult<T> {
  virtualItems: Array<{
    index: number;
    item: T;
    offsetTop: number;
  }>;
  totalHeight: number;
  scrollElementProps: {
    onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
    style: React.CSSProperties;
  };
  containerProps: {
    style: React.CSSProperties;
  };
}

export function useVirtualScroll<T>(
  items: T[],
  options: UseVirtualScrollOptions
): UseVirtualScrollResult<T> {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = items.length * itemHeight;

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const virtualItems = useMemo(() => {
    const result: Array<{
      index: number;
      item: T;
      offsetTop: number;
    }> = [];
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      result.push({
        index: i,
        item: items[i],
        offsetTop: i * itemHeight
      });
    }
    return result;
  }, [items, visibleRange, itemHeight]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  const scrollElementProps = useMemo(() => ({
    onScroll: handleScroll,
    style: {
      height: containerHeight,
      overflow: 'auto' as const
    }
  }), [handleScroll, containerHeight]);

  const containerProps = useMemo(() => ({
    style: {
      height: totalHeight,
      position: 'relative' as const
    }
  }), [totalHeight]);

  return {
    virtualItems,
    totalHeight,
    scrollElementProps,
    containerProps
  };
}

export function useInfiniteScroll<T>(
  items: T[],
  loadMore: () => Promise<void>,
  options: {
    threshold?: number;
    hasMore: boolean;
    isLoading: boolean;
  }
) {
  const { threshold = 100, hasMore, isLoading } = options;

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
      
      if (
        hasMore &&
        !isLoading &&
        scrollHeight - scrollTop - clientHeight < threshold
      ) {
        loadMore();
      }
    },
    [hasMore, isLoading, threshold, loadMore]
  );

  return { handleScroll };
}
