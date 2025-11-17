import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
}

/**
 * Hook to monitor network connectivity status
 * Works on web and native platforms
 * For web: Uses navigator.onLine API
 * For native: Would use NetInfo (to be implemented when needed)
 */
export const useNetworkStatus = (): NetworkStatus => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true, // Default to true to avoid false negatives on initial load
    isInternetReachable: true,
    type: null,
  });

  useEffect(() => {
    // For web platform, use navigator.onLine
    if (Platform.OS === 'web') {
      const updateWebStatus = () => {
        setNetworkStatus({
          isConnected: typeof navigator !== 'undefined' ? navigator.onLine : true,
          isInternetReachable: typeof navigator !== 'undefined' ? navigator.onLine : true,
          type: 'web',
        });
      };

      // Set initial status
      updateWebStatus();

      // Listen for online/offline events
      if (typeof window !== 'undefined') {
        window.addEventListener('online', updateWebStatus);
        window.addEventListener('offline', updateWebStatus);
      }

      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('online', updateWebStatus);
          window.removeEventListener('offline', updateWebStatus);
        }
      };
    }

    // For native platforms, default to connected
    // TODO: Implement NetInfo when native development is needed
    setNetworkStatus({
      isConnected: true,
      isInternetReachable: true,
      type: Platform.OS,
    });

    return () => {};
  }, []);

  return networkStatus;
};
