import { v4 as uuidv4 } from 'uuid';
import type { Context } from 'js-slang/dist/types';

/**
 * Global singleton store for js-slang Context objects.
 * 
 * This store manages mutable js-slang contexts outside of Redux,
 * solving the issue where storing mutable objects in Redux violates
 * immutability requirements and causes problems with Immer's auto-freezing.
 * 
 * Instead of storing Context objects directly in Redux, we store
 * UUIDs that reference contexts in this global store.
 */
class JsSlangContextStore {
  private contextStore = new Map<string, Context>();

  /**
   * Stores a js-slang context and returns a UUID to reference it.
   * @param context - The js-slang Context object to store
   * @returns UUID string that can be stored in Redux state
   */
  putJsSlangContext(context: Context): string {
    const id = uuidv4();
    this.contextStore.set(id, context);
    return id;
  }

  /**
   * Retrieves a js-slang context by its UUID.
   * @param id - The UUID of the context to retrieve
   * @returns The Context object, or undefined if not found
   */
  getJsSlangContext(id: string): Context | undefined {
    return this.contextStore.get(id);
  }

  /**
   * Removes a js-slang context from the store.
   * @param id - The UUID of the context to remove
   * @returns true if the context was found and removed, false otherwise
   */
  deleteJsSlangContext(id: string): boolean {
    return this.contextStore.delete(id);
  }

  /**
   * Gets the number of contexts currently stored.
   * Useful for debugging and monitoring.
   */
  size(): number {
    return this.contextStore.size;
  }

  /**
   * Clears all stored contexts.
   * Use with caution - this will invalidate all context references.
   */
  clear(): void {
    this.contextStore.clear();
  }
}

// Export a singleton instance
export const jsSlangContextStore = new JsSlangContextStore();

// Export the class for testing purposes
export { JsSlangContextStore };

// Export utility functions for convenience
export const putJsSlangContext = (context: Context): string => 
  jsSlangContextStore.putJsSlangContext(context);

export const getJsSlangContext = (id: string): Context | undefined => 
  jsSlangContextStore.getJsSlangContext(id);

export const deleteJsSlangContext = (id: string): boolean => 
  jsSlangContextStore.deleteJsSlangContext(id);