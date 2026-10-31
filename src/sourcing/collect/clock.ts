// Time for the collection runner, behind an interface so tests can move it forward.

export interface Timer {
  promise: Promise<void>;
  cancel(): void;
}

export interface Clock {
  /** Milliseconds since the Unix epoch. */
  now(): number;
  timer(ms: number): Timer;
  sleep(ms: number): Promise<void>;
}

export const systemClock: Clock = {
  now: () => Date.now(),
  timer(ms) {
    let handle: ReturnType<typeof setTimeout> | undefined;
    const promise = new Promise<void>((resolve) => {
      handle = setTimeout(resolve, Math.max(0, ms));
    });
    return { promise, cancel: () => clearTimeout(handle) };
  },
  sleep(ms) {
    return systemClock.timer(ms).promise;
  },
};
