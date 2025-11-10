import React, { useState } from 'react';
import { View, ViewStyle, LayoutChangeEvent } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';

interface DottedBorderProps {
  children: React.ReactNode;
  style?: ViewStyle;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  dashLength?: number;
  dashGap?: number;
}

export const DottedBorder: React.FC<DottedBorderProps> = ({
  children,
  style,
  borderRadius = 8,
  borderColor,
  borderWidth = 2,
  dashLength = 6,
  dashGap = 4,
}) => {
  const { colors } = useTheme();
  const color = borderColor || colors.border;
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  };

  return (
    <View style={[{ position: 'relative' as 'relative' }, style]} onLayout={onLayout}>
      {dimensions.width > 0 && dimensions.height > 0 && (
        <View style={{ position: 'absolute' as 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <Svg width={dimensions.width} height={dimensions.height} style={{ position: 'absolute' as 'absolute' }}>
            <Rect
              x={borderWidth / 2}
              y={borderWidth / 2}
              width={dimensions.width - borderWidth}
              height={dimensions.height - borderWidth}
              fill="none"
              stroke={color}
              strokeWidth={borderWidth}
              strokeDasharray={`${dashLength} ${dashGap}`}
              rx={borderRadius}
              ry={borderRadius}
            />
          </Svg>
        </View>
      )}
      {children}
    </View>
  );
};