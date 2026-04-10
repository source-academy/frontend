// Adapted from https://github.com/yeori/precaching-striping/blob/main/src/plugins/PrecacheStriping.ts

import { RouteHandler, RouteMatchCallback, WorkboxPlugin } from 'workbox-core';
import {
  PrecacheController,
  type PrecacheEntry,
  PrecacheRoute,
  type PrecacheRouteOptions
} from 'workbox-precaching';
import { registerRoute, Route } from 'workbox-routing';

declare let self: ServiceWorkerGlobalScope;
/**
 * declared in workbox-precache.PrecacheController.ts
 * @type {import { PrecacheControllerOptions } from "workbox-precache/precacheController";}
 */
declare interface PrecacheControllerOptions {
  cacheName?: string;
  plugins?: WorkboxPlugin[];
  fallbackToNetwork?: boolean;
}

export type PrecacheItem = PrecacheEntry | string;
export type PrecacheOptionConfigurer = () => PrecacheRouteOptions | undefined;

export interface PrecacheStripingOptions {
  optionResolver: PrecacheOptionConfigurer;
  controllerOptionResolver: () => PrecacheControllerOptions | undefined;
  splitEntries?: (entries: PrecacheItem[]) => Generator<PrecacheItem[]>;
}
/**
 * It returns generator which splits the entries.
 * ```
 * ex) 3 buckets for entries [a, b, c, d, e, f g, h]
 *     then generates
 *         [a, b, c], [d, e, f], [g, h]
 * ```
 * @param bucketSize number of buckets. Each bucket contains at least (total / bucketSize) entries
 * @returns generator which yields splitted entries
 */
export const splitByBucketSize = (bucketSize: number) =>
  function* (entries: PrecacheItem[]): Generator<PrecacheItem[]> {
    const size = entries.length;
    let pieces = size % bucketSize;
    const chunkSize = Math.floor(entries.length / bucketSize);
    let offset = 0;

    while (offset < size) {
      const limit = offset + chunkSize + (pieces-- > 0 ? 1 : 0);
      const end = Math.min(limit, size);
      yield entries.slice(offset, end);
      offset = end;
    }
  };

const DEFAULT_OPTION: PrecacheStripingOptions = {
  optionResolver: () => undefined,
  controllerOptionResolver: () => undefined, // PrecacheControllerOptions
  splitEntries: undefined
};

export class PrecacheStriping {
  private _sharedCacheKeys: Map<string, string>;
  private option: PrecacheStripingOptions | undefined;
  private _controllerOption: PrecacheControllerOptions | undefined;
  private _leader: PrecacheController;
  constructor(option?: PrecacheStripingOptions) {
    this.option = option && { ...option };
    const controllerOptionResolver = option?.controllerOptionResolver || (() => undefined);
    this._controllerOption = controllerOptionResolver();

    const leader = new PrecacheController(this._controllerOption);
    this._sharedCacheKeys = leader.getURLsToCacheKeys();
    this._bindRouting(leader);
    self.addEventListener('activate', e => {
      leader.activate(e);
    });
    this._leader = leader;
  }
  private _bindRouting(leaderController: PrecacheController) {
    const optionResolver = this.option?.optionResolver || DEFAULT_OPTION.optionResolver;
    registerRoute(new PrecacheRoute(leaderController, optionResolver()));
  }
  public get createHandlerBoundToURL() {
    return this._leader.createHandlerBoundToURL.bind(this._leader);
  }
  public registerRoute(capture: RouteMatchCallback, handler: RouteHandler) {
    registerRoute(new Route(capture, handler));
  }
  precache(entries: PrecacheItem[]) {
    const installer = new PrecacheController(this._controllerOption);
    /**
     * PrecacheController.precache(...) listens to 'activate' event,
     * which wipes out items loaded by other controllers
     */
    installer.addToCacheList(entries);
    const keys = installer.getURLsToCacheKeys();
    // putting all cache keys to leader controller
    // for cache cleaning on 'activate' event
    keys.forEach((value, key) => {
      this._sharedCacheKeys.set(key, value);
    });
    self.addEventListener('install', (e: ExtendableEvent) => installer.install(e));
  }
  /**
   * starts concurrent precache task.
   * @param entries
   * @param numOfStriping (default: 4) the number of concurrent precache task
   */
  precacheStriping(entries: (string | PrecacheEntry)[], numOfStriping = 4) {
    const splitter = this.option?.splitEntries || splitByBucketSize(numOfStriping);

    for (const chunks of splitter(entries)) {
      this.precache(chunks);
    }
  }
}
