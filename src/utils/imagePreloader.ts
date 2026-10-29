/**
 * High-performance image preloading utility designed for mobile networks
 * and edge CDN caches. Preloads thumbnails and property galleries
 * off the critical path using memory image caching and link preloading.
 */
export class ImagePreloader {
  private static preloadedUrls: Set<string> = new Set();

  /**
   * Preloads a single image URL into browser memory cache.
   */
  public static preload(url: string, priority: 'high' | 'low' = 'low'): Promise<void> {
    if (!url || typeof window === 'undefined' || this.preloadedUrls.has(url)) {
      return Promise.resolve();
    }
    this.preloadedUrls.add(url);

    return new Promise((resolve) => {
      // 1. High priority document link preload for above-the-fold assets
      if (priority === 'high' && typeof document !== 'undefined') {
        try {
          const existing = document.querySelector(`link[rel="preload"][href="${url}"]`);
          if (!existing) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = url;
            link.fetchPriority = 'high';
            document.head.appendChild(link);
          }
        } catch {
          // Ignore
        }
      }

      // 2. Offscreen Image instance to force decode into memory
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = url;
    });
  }

  /**
   * Preload a list of images.
   */
  public static preloadMultiple(urls: string[], priority: 'high' | 'low' = 'low'): void {
    urls.filter(Boolean).forEach((url) => this.preload(url, priority));
  }

  /**
   * Preload all auction listing thumbnails.
   * Prioritizes the top active cards first, then queues the remaining
   * thumbnails during idle periods to prevent mobile bandwidth contention.
   */
  public static preloadAuctionThumbnails(
    competitions: Array<{ property?: { images?: string[]; image?: string } }>
  ): void {
    if (!competitions || !competitions.length) return;

    const urls: string[] = [];
    competitions.forEach((comp) => {
      const img = comp.property?.images?.[0] || comp.property?.image;
      if (img && !urls.includes(img)) {
        urls.push(img);
      }
    });

    // Immediate high-priority preload for the first 3 listings (above the fold)
    urls.slice(0, 3).forEach((url) => this.preload(url, 'high'));

    // Defer remaining thumbnails to browser idle time or slight delay
    const preloadRest = () => {
      urls.slice(3).forEach((url) => this.preload(url, 'low'));
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(
        preloadRest
      );
    } else {
      setTimeout(preloadRest, 600);
    }
  }

  /**
   * Warm up full gallery photos for a specific property (e.g. on card hover or touch start)
   */
  public static warmGallery(images: string[]): void {
    if (!images || !images.length) return;
    this.preloadMultiple(images, 'low');
  }
}
