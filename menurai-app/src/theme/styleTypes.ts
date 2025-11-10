/**
 * Type-safe style constants for React Native
 * These ensure proper typing for style properties that require specific string literals
 */

export const FlexDirection = {
  row: 'row' as 'row',
  column: 'column' as 'column',
  'row-reverse': 'row-reverse' as 'row-reverse',
  'column-reverse': 'column-reverse' as 'column-reverse',
} as const;

export const Position = {
  absolute: 'absolute' as 'absolute',
  relative: 'relative' as 'relative',
} as const;

export const AlignItems = {
  center: 'center' as 'center',
  'flex-start': 'flex-start' as 'flex-start',
  'flex-end': 'flex-end' as 'flex-end',
  stretch: 'stretch' as 'stretch',
  baseline: 'baseline' as 'baseline',
} as const;

export const JustifyContent = {
  center: 'center' as 'center',
  'flex-start': 'flex-start' as 'flex-start',
  'flex-end': 'flex-end' as 'flex-end',
  'space-between': 'space-between' as 'space-between',
  'space-around': 'space-around' as 'space-around',
  'space-evenly': 'space-evenly' as 'space-evenly',
} as const;

export const TextAlign = {
  auto: 'auto' as 'auto',
  left: 'left' as 'left',
  right: 'right' as 'right',
  center: 'center' as 'center',
  justify: 'justify' as 'justify',
} as const;

export const FlexWrap = {
  wrap: 'wrap' as 'wrap',
  nowrap: 'nowrap' as 'nowrap',
  'wrap-reverse': 'wrap-reverse' as 'wrap-reverse',
} as const;

export const FontWeight = {
  '100': '100' as '100',
  '200': '200' as '200',
  '300': '300' as '300',
  '400': '400' as '400',
  '500': '500' as '500',
  '600': '600' as '600',
  '700': '700' as '700',
  '800': '800' as '800',
  '900': '900' as '900',
  normal: 'normal' as 'normal',
  bold: 'bold' as 'bold',
} as const;

export const TextDecorationLine = {
  none: 'none' as 'none',
  underline: 'underline' as 'underline',
  'line-through': 'line-through' as 'line-through',
  'underline line-through': 'underline line-through' as 'underline line-through',
} as const;

export const FontStyle = {
  normal: 'normal' as 'normal',
  italic: 'italic' as 'italic',
} as const;