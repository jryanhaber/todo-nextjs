// lib/event-emitter.ts
import { EventCallback, EventMap } from './types';

class TypedEventEmitter<T extends Record<string, any>> {
  private events: {
    [K in keyof T]?: Array<EventCallback<T[K]>>;
  } = {};

  on<K extends keyof T>(event: K, listener: EventCallback<T[K]>): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event]!.push(listener);

    // Return unsubscribe function
    return () => this.off(event, listener);
  }

  off<K extends keyof T>(event: K, listener: EventCallback<T[K]>): void {
    if (!this.events[event]) return;

    this.events[event] = this.events[event]!.filter((l) => l !== listener) as any;
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    if (!this.events[event]) return;

    this.events[event]!.forEach((listener) => {
      try {
        listener(data);
      } catch (e) {
        console.error(`Error in event listener for ${String(event)}:`, e);
      }
    });
  }
}

// Create a singleton instance
const eventEmitter = new TypedEventEmitter<EventMap>();

// Simplified function to subscribe to data changes
export function subscribeToDataChanges<K extends keyof EventMap>(
  event: K,
  callback: EventCallback<EventMap[K]>
): () => void {
  return eventEmitter.on(event, callback);
}

// Function to emit events
export function emitEvent<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
  eventEmitter.emit(event, data);
}

export default eventEmitter;
