  async pullChangesFromCloud(): Promise<any[] | null> {
    try {
      const authToken = await this.getAuthToken();
      if (!authToken) {
        console.warn('Cannot pull: Not authenticated');
        return null;
      }
      
      const response = await fetch(`${this.config.syncEndpoint}/api/sync`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Pull failed: ${response.status} ${response.statusText}`);
      }
      
      const { items } = await response.json();
      
      // Update local storage (without triggering another sync)
      this.syncInProgress = true;
      await chrome.storage.sync.set({ capturedItems: items });
      this.syncInProgress = false;
      
      return items;
    } catch (error) {
      console.error('Pull error:', error);
      return null;
    }
  }
  
  async connectWithSyncCode(syncCode: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.syncEndpoint}/api/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ syncCode })
      });
      
      if (!response.ok) {
        throw new Error(`Connection failed: ${response.status} ${response.statusText}`);
      }
      
      const { token } = await response.json();
      
      // Store the auth token
      await chrome.storage.local.set({ authToken: token });
      this.config.authToken = token;
      
      // Immediately pull changes
      await this.pullChangesFromCloud();
      
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      return false;
    }
  }
}

// Create and export the sync bridge
export const syncBridge = new SyncBridge({
  syncEndpoint: 'https://your-nextjs-app.com'
});
