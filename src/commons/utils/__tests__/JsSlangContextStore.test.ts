import { describe, it, expect, beforeEach } from 'vitest';

import {
  JsSlangContextStore,
  putJsSlangContext,
  getJsSlangContext,
  deleteJsSlangContext,
  jsSlangContextStore
} from '../JsSlangContextStore';

// Mock a simple context object for testing
const createMockContext = (chapter: number, variant: string) => ({
  chapter,
  variant,
  errors: [],
  externalSymbols: [],
  moduleContexts: {},
  runtime: {
    environments: []
  }
});

describe('JsSlangContextStore', () => {
  beforeEach(() => {
    // Clear the store before each test
    jsSlangContextStore.clear();
  });

  it('should store and retrieve contexts correctly', () => {
    const context = createMockContext(1, 'default');
    
    const id = putJsSlangContext(context as any);
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
    
    const retrievedContext = getJsSlangContext(id);
    expect(retrievedContext).toBe(context);
    expect(retrievedContext?.chapter).toBe(1);
    expect(retrievedContext?.variant).toBe('default');
  });

  it('should return undefined for non-existent context IDs', () => {
    const context = getJsSlangContext('non-existent-id');
    expect(context).toBeUndefined();
  });

  it('should delete contexts correctly', () => {
    const context = createMockContext(2, 'default');
    const id = putJsSlangContext(context as any);
    
    expect(getJsSlangContext(id)).toBe(context);
    
    const deleted = deleteJsSlangContext(id);
    expect(deleted).toBe(true);
    
    expect(getJsSlangContext(id)).toBeUndefined();
  });

  it('should return false when deleting non-existent contexts', () => {
    const deleted = deleteJsSlangContext('non-existent-id');
    expect(deleted).toBe(false);
  });

  it('should track store size correctly', () => {
    expect(jsSlangContextStore.size()).toBe(0);
    
    const id1 = putJsSlangContext(createMockContext(1, 'default') as any);
    expect(jsSlangContextStore.size()).toBe(1);
    
    const id2 = putJsSlangContext(createMockContext(2, 'default') as any);
    expect(jsSlangContextStore.size()).toBe(2);
    
    deleteJsSlangContext(id1);
    expect(jsSlangContextStore.size()).toBe(1);
    
    deleteJsSlangContext(id2);
    expect(jsSlangContextStore.size()).toBe(0);
  });

  it('should clear all contexts', () => {
    putJsSlangContext(createMockContext(1, 'default') as any);
    putJsSlangContext(createMockContext(2, 'default') as any);
    
    expect(jsSlangContextStore.size()).toBe(2);
    
    jsSlangContextStore.clear();
    expect(jsSlangContextStore.size()).toBe(0);
  });

  it('should handle multiple instances correctly', () => {
    const store1 = new JsSlangContextStore();
    const store2 = new JsSlangContextStore();
    
    const context1 = createMockContext(1, 'default');
    const context2 = createMockContext(2, 'default');
    
    const id1 = store1.putJsSlangContext(context1 as any);
    const id2 = store2.putJsSlangContext(context2 as any);
    
    expect(store1.getJsSlangContext(id1)).toBe(context1);
    expect(store1.getJsSlangContext(id2)).toBeUndefined();
    
    expect(store2.getJsSlangContext(id2)).toBe(context2);
    expect(store2.getJsSlangContext(id1)).toBeUndefined();
  });

  it('should allow context mutation', () => {
    const context = createMockContext(1, 'default');
    const id = putJsSlangContext(context as any);
    
    const retrievedContext = getJsSlangContext(id);
    
    // This should not throw because contexts are mutable
    expect(() => {
      retrievedContext!.errors = [];
      retrievedContext!.errors.push({ type: 'runtime', severity: 'error' });
    }).not.toThrow();
    
    expect(retrievedContext!.errors.length).toBe(1);
  });

  it('should generate unique IDs for different contexts', () => {
    const context1 = createMockContext(1, 'default');
    const context2 = createMockContext(2, 'default');
    
    const id1 = putJsSlangContext(context1 as any);
    const id2 = putJsSlangContext(context2 as any);
    
    expect(id1).not.toBe(id2);
    expect(getJsSlangContext(id1)).toBe(context1);
    expect(getJsSlangContext(id2)).toBe(context2);
  });
});