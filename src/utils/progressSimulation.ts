/**
 * Progress Simulation Utility
 * 
 * Simulates gradual progress from 0% to 90% to give user feedback
 * during async operations where real progress is unknown.
 * 
 * When real operation completes, jumps to 90% then quickly to 100%.
 */

export interface ProgressSimulatorOptions {
  startProgress?: number;    // Starting progress (default: 0)
  targetProgress?: number;   // Target progress to reach (default: 90)
  duration?: number;         // Total duration in ms (default: 25000)
  updateInterval?: number;   // Update interval in ms (default: 500)
  onUpdate?: (progress: number) => void;  // Callback on each update
}

export class ProgressSimulator {
  private currentProgress: number;
  private targetProgress: number;
  private duration: number;
  private updateInterval: number;
  private onUpdate?: (progress: number) => void;
  private intervalId?: NodeJS.Timeout;
  private startTime: number;
  private isRunning: boolean = false;

  constructor(options: ProgressSimulatorOptions = {}) {
    this.currentProgress = options.startProgress ?? 0;
    this.targetProgress = options.targetProgress ?? 90;
    this.duration = options.duration ?? 25000; // 25 seconds
    this.updateInterval = options.updateInterval ?? 500; // 0.5 seconds
    this.onUpdate = options.onUpdate;
    this.startTime = Date.now();
  }

  /**
   * Start progress simulation
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.startTime = Date.now();
    this.currentProgress = 0;

    // Initial update
    this.onUpdate?.(0);

    this.intervalId = setInterval(() => {
      this.tick();
    }, this.updateInterval);
  }

  /**
   * Single tick of progress update
   */
  private tick(): void {
    const elapsed = Date.now() - this.startTime;
    const progressRatio = elapsed / this.duration;

    if (progressRatio >= 1) {
      // Reached target
      this.currentProgress = this.targetProgress;
      this.onUpdate?.(this.currentProgress);
      this.stop();
      return;
    }

    // Smooth easing function (ease-out cubic)
    // Starts fast, slows down as it approaches target
    const easeOut = 1 - Math.pow(1 - progressRatio, 3);
    this.currentProgress = Math.floor(easeOut * this.targetProgress);

    this.onUpdate?.(this.currentProgress);
  }

  /**
   * Jump to final progress (when real operation completes)
   */
  async complete(): Promise<void> {
    this.stop();

    // Jump to 90% if not there yet
    if (this.currentProgress < 90) {
      this.currentProgress = 90;
      this.onUpdate?.(90);
      await this.delay(200);
    }

    // Quick animation from 90% to 100%
    const steps = [92, 95, 97, 100];
    for (const step of steps) {
      this.currentProgress = step;
      this.onUpdate?.(step);
      await this.delay(150);
    }
  }

  /**
   * Stop simulation
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isRunning = false;
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.stop();
    this.currentProgress = 0;
    this.startTime = Date.now();
    this.onUpdate?.(0);
  }

  /**
   * Get current progress
   */
  getCurrentProgress(): number {
    return this.currentProgress;
  }

  /**
   * Helper delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Simple hook-like function for creating simulator
 */
export function createProgressSimulator(
  onUpdate: (progress: number) => void,
  options: Omit<ProgressSimulatorOptions, 'onUpdate'> = {}
): ProgressSimulator {
  return new ProgressSimulator({
    ...options,
    onUpdate,
  });
}
