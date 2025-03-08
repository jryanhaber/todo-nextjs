// lib/hooks.ts
import { useState, useEffect } from 'react';
import { WorkflowItem, ItemFilters, GtdCounts } from './types';
import { fetchItems, fetchGtdCounts, fetchAllTags } from './data-store';
import { subscribeToDataChanges } from './event-emitter';

export function useItems(filters: ItemFilters = {}) {
  const [items, setItems] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadItems = async () => {
      try {
        setLoading(true);
        const result = await fetchItems(filters);
        if (isMounted) {
          setItems(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Error fetching items'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Load items initially
    loadItems();

    // Subscribe to changes
    const unsubscribe = subscribeToDataChanges('items-changed', () => {
      loadItems();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [filters]);

  return { items, loading, error };
}

export function useGtdCounts() {
  const [counts, setCounts] = useState<GtdCounts>({
    inbox: 0,
    'next-actions': 0,
    'waiting-for': 0,
    someday: 0,
    reference: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadCounts = async () => {
      try {
        setLoading(true);
        const result = await fetchGtdCounts();
        if (isMounted) {
          setCounts(result);
        }
      } catch (error) {
        console.error('Error loading GTD counts:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Load counts initially
    loadCounts();

    // Subscribe to changes
    const unsubscribe = subscribeToDataChanges('items-changed', () => {
      loadCounts();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { counts, loading };
}

export function useTags() {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadTags = async () => {
      try {
        setLoading(true);
        const result = await fetchAllTags();
        if (isMounted) {
          setTags(result);
        }
      } catch (error) {
        console.error('Error loading tags:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Load tags initially
    loadTags();

    // Subscribe to changes
    const unsubscribe = subscribeToDataChanges('items-changed', () => {
      loadTags();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { tags, loading };
}
