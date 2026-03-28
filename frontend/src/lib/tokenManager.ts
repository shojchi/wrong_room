// Token cache to avoid hitting the backend repeatedly for the same session
let cachedToken: string | null = null;

// Lock to prevent multiple simultaneous requests
let activePromise: Promise<string> | null = null;

/**
 * Fetches an ephemeral or direct API token from the secure backend endpoint.
 * Useful for initializing the Gemini Live SDK natively.
 */
export async function fetchLiveApiToken(): Promise<string> {
  // Return cached token if already fetched
  if (cachedToken) {
    return cachedToken;
  }

  // If a request is already active, wait for it
  if (activePromise) {
    return activePromise;
  }

  // Otherwise, kick off a new request
  activePromise = (async () => {
    try {
      const fetchUrl = import.meta.env.DEV ? 'http://localhost:3001/api/token' : '/api/token';
      const response = await fetch(fetchUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch token: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.token) {
        throw new Error('No token returned from backend API');
      }

      cachedToken = data.token;
      console.log('✅ Successfully fetched API token for Gemini Live');
      return cachedToken || '';
    } catch (error) {
      console.error('Error fetching token:', error);
      throw error;
    } finally {
      // Clear the active promise so a retry can happen if it failed
      activePromise = null; 
    }
  })();

  return activePromise || Promise.resolve('');
}
