// lib/local-store.ts
import { WorkflowItem, ItemFilters, GtdCounts } from './types';
import { emitEvent } from './event-emitter';

// In-memory cache
let itemsCache: WorkflowItem[] = [];

// Initialize cache from localStorage
const initializeCache = () => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('workflowItems');
      itemsCache = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }
};

// Save cache to localStorage
const persistCache = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('workflowItems', JSON.stringify(itemsCache));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
};

// Initialize on import
initializeCache();

/**
 * Fetch items from local storage
 */
export async function fetchItems(filters: ItemFilters = {}): Promise<WorkflowItem[]> {
  try {
    let filteredItems = [...itemsCache];

    // Apply filters
    if (filters.type) {
      filteredItems = filteredItems.filter((item) => item.type === filters.type);
    }

    if (filters.gtdStage) {
      filteredItems = filteredItems.filter((item) => item.gtdStage === filters.gtdStage);
    }

    if (filters.tag) {
      filteredItems = filteredItems.filter((item) => item.tags && item.tags.includes(filters.tag));
    }

    // Sort by date descending
    return filteredItems.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching items:', error);
    return [];
  }
}

/**
 * Save an item to local storage
 */
export async function saveItem(
  item: Partial<WorkflowItem> & { id?: number }
): Promise<WorkflowItem> {
  try {
    // Find if item already exists
    const existingIndex = itemsCache.findIndex((i) => i.id === item.id);

    let savedItem: WorkflowItem;

    if (existingIndex >= 0) {
      // Update existing item
      savedItem = {
        ...itemsCache[existingIndex],
        ...item,
        updatedAt: new Date().toISOString()
      };
      itemsCache[existingIndex] = savedItem;
    } else {
      // Add new item with required fields
      savedItem = {
        id: item.id || Date.now(),
        type: item.type || 'todo',
        text: item.text || '',
        url: item.url || '',
        title: item.title || '',
        screenshot: item.screenshot || '',
        tags: item.tags || [],
        systemTags: item.systemTags || [],
        gtdStage: item.gtdStage || 'inbox',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reviewedAt: null,
        ...item
      };
      itemsCache.push(savedItem);
    }

    // Save to localStorage
    persistCache();

    // Emit change events
    emitEvent('items-changed', itemsCache);
    emitEvent('item-saved', savedItem);

    return savedItem;
  } catch (error) {
    console.error('Error saving item:', error);
    throw error;
  }
}

/**
 * Delete an item from local storage
 */
export async function deleteItem(id: number): Promise<boolean> {
  try {
    itemsCache = itemsCache.filter((item) => item.id !== id);
    persistCache();

    // Emit change events
    emitEvent('items-changed', itemsCache);
    emitEvent('item-deleted', id);

    return true;
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
}

/**
 * Get all unique tags
 */
export async function fetchAllTags(): Promise<string[]> {
  try {
    const tagSet = new Set<string>();

    itemsCache.forEach((item) => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag) => {
          if (tag) tagSet.add(tag);
        });
      }
    });

    return Array.from(tagSet);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

/**
 * Get GTD counts
 */
export async function fetchGtdCounts(): Promise<GtdCounts> {
  try {
    const counts: GtdCounts = {
      inbox: 0,
      'next-actions': 0,
      'waiting-for': 0,
      someday: 0,
      reference: 0,
      completed: 0
    };

    itemsCache.forEach((item) => {
      const stage = item.gtdStage || 'inbox';
      if (stage in counts) {
        counts[stage as keyof GtdCounts]++;
      }
    });

    return counts;
  } catch (error) {
    console.error('Error fetching GTD counts:', error);
    return {
      inbox: 0,
      'next-actions': 0,
      'waiting-for': 0,
      someday: 0,
      reference: 0,
      completed: 0
    };
  }
}
