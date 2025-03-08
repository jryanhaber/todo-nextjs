// lib/data-store.ts
import { WorkflowItem, ItemFilters, GtdCounts } from './types';
import { emitEvent } from './event-emitter';

// Sample in-memory storage for development
let items: WorkflowItem[] = [];

/**
 * Fetch items from storage
 */
export async function fetchItems(filters: ItemFilters = {}): Promise<WorkflowItem[]> {
  try {
    // For development, use local storage
    // In production, this would fetch from your sync API
    const storedItems = localStorage.getItem('capturedItems');
    if (storedItems) {
      items = JSON.parse(storedItems);
    }

    let filteredItems = [...items];

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
 * Save an item
 */
export async function saveItem(
  item: Partial<WorkflowItem> & { id?: number }
): Promise<WorkflowItem> {
  try {
    // Find if item already exists
    const existingIndex = items.findIndex((i) => i.id === item.id);

    let savedItem: WorkflowItem;

    if (existingIndex >= 0) {
      // Update existing item
      savedItem = {
        ...items[existingIndex],
        ...item,
        updatedAt: new Date().toISOString()
      };
      items[existingIndex] = savedItem;
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
      items.push(savedItem);
    }

    // Save to local storage
    localStorage.setItem('capturedItems', JSON.stringify(items));

    // Emit change events
    emitEvent('items-changed', items);
    emitEvent('item-saved', savedItem);

    return savedItem;
  } catch (error) {
    console.error('Error saving item:', error);
    throw error;
  }
}
// lib/data-store.ts (continued)
/**
 * Delete an item
 */
export async function deleteItem(id: number): Promise<boolean> {
  try {
    items = items.filter((item) => item.id !== id);
    localStorage.setItem('capturedItems', JSON.stringify(items));

    // Emit change events
    emitEvent('items-changed', items);
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
    const allItems = await fetchItems();
    const tagSet = new Set<string>();

    allItems.forEach((item) => {
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
    const allItems = await fetchItems();

    const counts: GtdCounts = {
      inbox: 0,
      'next-actions': 0,
      'waiting-for': 0,
      someday: 0,
      reference: 0,
      completed: 0
    };

    allItems.forEach((item) => {
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
