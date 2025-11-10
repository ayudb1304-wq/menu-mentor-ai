/**
 * Image component with loading state and error handling
 */

import React, { useState } from 'react';
import {
  Image,
  View,
  ActivityIndicator,
  StyleSheet,
  ImageProps,
  Text,
} from 'react-native';
import { Colors } from '../theme/colors';
import { WebIcon } from './WebIcon';

interface ImageWithFallbackProps extends ImageProps {
  fallbackIcon?: string;
  fallbackText?: string;
  showLoadingIndicator?: boolean;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  source,
  style,
  fallbackIcon = 'image',
  fallbackText = 'Image not available',
  showLoadingIndicator = true,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <View style={[styles.fallbackContainer, style]}>
        <WebIcon name={fallbackIcon} size={48} color={Colors.light.secondaryText} />
        {fallbackText && (
          <Text style={styles.fallbackText}>{fallbackText}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Image
        source={source}
        style={[styles.image, style]}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        {...props}
      />
      {loading && showLoadingIndicator && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.brand.blue} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
  },
  fallbackText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.light.secondaryText,
    textAlign: 'center',
  },
});
