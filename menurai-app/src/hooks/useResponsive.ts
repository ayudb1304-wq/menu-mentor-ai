import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import {
  Breakpoints,
  ResponsiveValue,
  buildResponsiveInfo,
  getColumnCount,
  getContentMaxWidth,
  getHorizontalGutter,
  getResponsiveValue,
  getScreenPadding,
} from '../utils/responsive';

export const useResponsive = () => {
  const window = useWindowDimensions();

  const info = useMemo(
    () => buildResponsiveInfo({ width: window.width, height: window.height }),
    [window.width, window.height]
  );

  const contentMaxWidth = useMemo(() => getContentMaxWidth(info), [info]);
  const screenPadding = useMemo(() => getScreenPadding(info), [info]);
  const horizontalGutter = useMemo(() => getHorizontalGutter(info), [info]);
  const columns = useMemo(() => getColumnCount(info), [info]);

  const responsiveValue = <T,>(value: ResponsiveValue<T>) => getResponsiveValue<T>(value, info);

  return {
    ...info,
    breakpoints: Breakpoints,
    contentMaxWidth,
    screenPadding,
    horizontalGutter,
    columns,
    responsiveValue,
  };
};

export default useResponsive;

