// Background room cleanup service
class RoomCleanupService {
  constructor() {
    this.cleanupInterval = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;

    // Run cleanup every 30 minutes
    this.cleanupInterval = setInterval(
      async () => {
        await this.performCleanup();
      },
      30 * 60 * 1000
    );

    // Run initial cleanup
    this.performCleanup();
  }

  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.isRunning = false;
  }

  async performCleanup() {
    try {
      const response = await fetch('/api/rooms/cleanup', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.cleaned > 0) {
          console.log(`Cleaned up ${result.cleaned} expired rooms`);
        }
      }
    } catch (error) {
      console.error('Room cleanup failed:', error);
    }
  }
}

export const roomCleanupService = new RoomCleanupService();

// Auto-start cleanup service in browser
if (typeof window !== 'undefined') {
  roomCleanupService.start();
}
