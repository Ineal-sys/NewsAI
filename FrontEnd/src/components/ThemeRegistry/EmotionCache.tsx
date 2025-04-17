'use client';
import * as React from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import createCache, { Options as EmotionCacheOptions } from '@emotion/cache'; // Import Options type
import { CacheProvider as EmotionCacheProvider } from '@emotion/react'; // Import and alias

// Define props type
interface NextAppDirEmotionCacheProviderProps {
  options: Omit<EmotionCacheOptions, 'insertionPoint'>; // Use the imported type, omit insertionPoint as it's handled internally
  children: React.ReactNode;
}

// This implementation is from emotion-js
// https://github.com/emotion-js/emotion/issues/2928#issuecomment-1319747902
export default function NextAppDirEmotionCacheProvider(props: NextAppDirEmotionCacheProviderProps) {
  const { options, children } = props;

  const [{ cache, flush }] = React.useState(() => {
    // Explicitly type the cache object
    const cache = createCache(options);
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = (): string[] => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }
    let styles = '';
    for (const name of names) {
      styles += cache.inserted[name];
    }
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />
    );
  });

  // Use the imported (and aliased) provider directly
  return <EmotionCacheProvider value={cache}>{children}</EmotionCacheProvider>;
}
