'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Database } from 'lucide-react';

interface CacheIndicatorProps {
  queryKey: string[];
}

export function CacheIndicator({ queryKey }: CacheIndicatorProps) {
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    const key = 'wishzy_cache_' + queryKey.join('_');
    const cached = localStorage.getItem(key);
    setIsCached(!!cached);
  }, [queryKey]);

  if (!isCached) return null;

  return (
    <Badge variant="secondary" className="gap-1 text-xs">
      <Database className="w-3 h-3" />
      Cached
    </Badge>
  );
}
