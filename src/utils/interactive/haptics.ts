/**
 * Haptic Feedback Utility
 * Provides vibration feedback for mobile devices
 */

export type HapticPattern = 'tap' | 'success' | 'error' | 'warning';

class HapticService {
  private supported: boolean = false;

  constructor() {
    this.checkSupport();
  }

  /**
   * Check if device supports haptic feedback
   */
  private checkSupport(): boolean {
    this.supported = 'vibrate' in navigator;
    if (!this.supported) {
      console.info('[Haptics] Vibration API not supported on this device');
    }
    return this.supported;
  }

  /**
   * Trigger haptic feedback with pattern
   */
  vibrate(pattern: HapticPattern | number | number[]): void {
    if (!this.supported) return;

    try {
      let vibrationPattern: number | number[];

      if (typeof pattern === 'string') {
        // Predefined patterns
        switch (pattern) {
          case 'tap':
            vibrationPattern = 10; // Short tap (10ms)
            break;
          case 'success':
            vibrationPattern = [50, 30, 50]; // Two short vibrations
            break;
          case 'error':
            vibrationPattern = [100, 50, 100, 50, 100]; // Three medium vibrations
            break;
          case 'warning':
            vibrationPattern = [200]; // One long vibration
            break;
          default:
            vibrationPattern = 10;
        }
      } else {
        vibrationPattern = pattern;
      }

      navigator.vibrate(vibrationPattern);
    } catch (error) {
      console.error('[Haptics] Error triggering vibration:', error);
    }
  }

  /**
   * Stop all vibrations
   */
  stop(): void {
    if (this.supported) {
      navigator.vibrate(0);
    }
  }

  /**
   * Light tap (for button presses)
   */
  lightTap(): void {
    this.vibrate('tap');
  }

  /**
   * Success feedback (for correct answers)
   */
  success(): void {
    this.vibrate('success');
  }

  /**
   * Error feedback (for wrong answers)
   */
  error(): void {
    this.vibrate('error');
  }

  /**
   * Warning feedback
   */
  warning(): void {
    this.vibrate('warning');
  }

  /**
   * Check if haptics are supported
   */
  isSupported(): boolean {
    return this.supported;
  }
}

// Singleton instance
export const hapticService = new HapticService();

/**
 * Helper function for triggering haptic feedback
 * @param type - Type of haptic feedback
 */
export const triggerHaptic = (type: 'light' | 'success' | 'error' | 'warning' = 'light'): void => {
  switch (type) {
    case 'light':
      hapticService.lightTap();
      break;
    case 'success':
      hapticService.success();
      break;
    case 'error':
      hapticService.error();
      break;
    case 'warning':
      hapticService.warning();
      break;
  }
};

export default hapticService;

