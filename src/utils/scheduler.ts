/**
 * Scheduler utility for INP (Interaction to Next Paint) optimization.
 * Helps break up long tasks and yield to the main thread.
 */

interface Scheduler {
  yield: () => Promise<void>;
  postTask: (callback: () => void, options?: { priority: 'user-blocking' | 'user-visible' | 'background' }) => Promise<void>;
}

declare global {
  interface Window {
    scheduler?: Scheduler;
  }
}

export const scheduler = {
  /**
   * Yields to the main thread to allow input handling.
   */
  yield: async () => {
    return new Promise<void>(resolve => {
      if (window.scheduler?.yield) {
        window.scheduler.yield().then(resolve);
      } else {
        setTimeout(resolve, 0);
      }
    });
  },

  /**
   * Schedules a background task.
   */
  postTask: (callback: () => void, priority: 'user-blocking' | 'user-visible' | 'background' = 'background') => {
    if (window.scheduler?.postTask) {
      window.scheduler.postTask(callback, { priority });
    } else {
      setTimeout(callback, 0);
    }
  }
};
