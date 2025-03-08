// lib/firebase-store.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase-config';
import { WorkflowItem, ItemFilters } from './types';

export async function fetchItems(
  options: { userId: string; filters?: ItemFilters } = { userId: '' }
): Promise<WorkflowItem[]> {
  try {
    const { userId, filters = {} } = options;

    if (!userId) {
      throw new Error('User ID is required');
    }

    let itemsQuery = collection(db, 'users', userId, 'items');

    // Apply filters
    if (filters.type) {
      itemsQuery = query(itemsQuery, where('type', '==', filters.type));
    }

    if (filters.gtdStage) {
      itemsQuery = query(itemsQuery, where('gtdStage', '==', filters.gtdStage));
    }

    // Add default sorting
    itemsQuery = query(itemsQuery, orderBy('updatedAt', 'desc'));

    const snapshot = await getDocs(itemsQuery);

    const items: WorkflowItem[] = [];
    snapshot.forEach((doc) => {
      items.push({
        id: Number(doc.id),
        ...doc.data()
      } as WorkflowItem);
    });

    return items;
  } catch (error) {
    console.error('Fetch items error:', error);
    throw error;
  }
}

export async function saveItem(
  item: Partial<WorkflowItem> & { id?: number },
  userId: string
): Promise<WorkflowItem> {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Ensure ID exists
    const itemId = item.id || Date.now();

    // Get existing item if ID is provided
    let existingItem: Partial<WorkflowItem> = {};

    if (item.id) {
      const itemDoc = await getDoc(doc(db, 'users', userId, 'items', itemId.toString()));

      if (itemDoc.exists()) {
        existingItem = itemDoc.data() as WorkflowItem;
      }
    }

    // Prepare the item to save
    const now = new Date().toISOString();
    const itemToSave: WorkflowItem = {
      id: itemId,
      type: item.type || existingItem.type || 'todo',
      text: item.text || existingItem.text || '',
      url: item.url || existingItem.url || '',
      title: item.title || existingItem.title || '',
      screenshot: item.screenshot || existingItem.screenshot || '',
      tags: item.tags || existingItem.tags || [],
      systemTags: item.systemTags || existingItem.systemTags || [],
      gtdStage: item.gtdStage || existingItem.gtdStage || 'inbox',
      createdAt: existingItem.createdAt || now,
      updatedAt: now,
      reviewedAt: item.reviewedAt || existingItem.reviewedAt || null,
      // Optional fields
      waitingFor: item.waitingFor || existingItem.waitingFor,
      waitingUntil: item.waitingUntil || existingItem.waitingUntil,
      metadata: item.metadata || existingItem.metadata || {}
    };

    // Save to Firestore
    await setDoc(doc(db, 'users', userId, 'items', itemId.toString()), itemToSave);

    return itemToSave;
  } catch (error) {
    console.error('Save item error:', error);
    throw error;
  }
}

export async function deleteItem(itemId: number, userId: string): Promise<boolean> {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    await deleteDoc(doc(db, 'users', userId, 'items', itemId.toString()));
    return true;
  } catch (error) {
    console.error('Delete item error:', error);
    throw error;
  }
}

export async function fetchAllTags(userId: string): Promise<string[]> {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const items = await fetchItems({ userId });

    const tagSet = new Set<string>();

    items.forEach((item) => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag) => {
          if (tag) tagSet.add(tag);
        });
      }
    });

    return Array.from(tagSet);
  } catch (error) {
    console.error('Fetch all tags error:', error);
    throw error;
  }
}
