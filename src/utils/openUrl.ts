import { storage } from './storage';

// Function to copy URL to clipboard as fallback
const copyUrlToClipboard = async (url: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy URL to clipboard:', error);
    return false;
  }
};

export const openExternalUrl = async (url: string, showMessage?: (message: string) => void): Promise<void> => {
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

    // Try fallback to window.open if Tauri opener fails
    try {
      console.log('Falling back to window.open for URL:', validUrl);
      window.open(validUrl, '_blank', 'noopener,noreferrer');
    } catch (fallbackError) {
      console.error('Fallback URL opening also failed:', fallbackError);

      // If all else fails, copy URL to clipboard
      console.log('Attempting to copy URL to clipboard as final fallback:', validUrl);
      const copySuccess = await copyUrlToClipboard(validUrl);

      if (copySuccess) {
        if (showMessage) {
          showMessage('Could not open URL, but it has been copied to clipboard');
        } else if (typeof window !== 'undefined' && window.alert) {
          window.alert(`Could not open URL, but it has been copied to clipboard: ${validUrl}`);
        }
      } else {
        // Ultimate fallback - just show the URL
        if (typeof window !== 'undefined' && window.alert) {
          window.alert(`Could not open URL: ${validUrl}\nPlease copy and paste this URL into your browser manually.`);
        }
      }
    }
  }
};