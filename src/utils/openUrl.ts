import { storage } from './storage';

export const openExternalUrl = async (url: string): Promise<void> => {
  if (!url) {
    console.warn('No URL provided to open');
    return;
  }

  // Ensure URL has proper protocol
  let validUrl = url.trim();
  if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
    validUrl = 'https://' + validUrl;
  }

  try {
    if (storage.isTauriEnvironment()) {
      // Use Tauri's opener plugin to open URLs in system default browser
      // This works on Windows, macOS, and Linux
      const { openUrl } = await import('@tauri-apps/plugin-opener');
      console.log('Opening URL in system default browser:', validUrl);
      await openUrl(validUrl);
    } else {
      // Use browser's window.open for web environment
      console.log('Opening URL in new browser tab:', validUrl);
      window.open(validUrl, '_blank', 'noopener,noreferrer');
    }
  } catch (error) {
    console.error('Failed to open URL:', error);
    // Fallback to window.open if Tauri opener fails
    try {
      console.log('Falling back to window.open for URL:', validUrl);
      window.open(validUrl, '_blank', 'noopener,noreferrer');
    } catch (fallbackError) {
      console.error('Fallback URL opening also failed:', fallbackError);
      // If all else fails, show user-friendly error
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(`Could not open URL: ${validUrl}\nPlease copy and paste this URL into your browser manually.`);
      }
    }
  }
};