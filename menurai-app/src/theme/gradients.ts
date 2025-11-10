/**
 * Gradient definitions for modern UI elements
 */

export const Gradients = {
  // Primary gradients
  primary: ['#0066FF', '#00B4D8'],
  secondary: ['#38A169', '#68D391'],
  
  // Semantic gradients
  success: ['#38A169', '#68D391'],
  warning: ['#F97316', '#FBBF24'],
  error: ['#DC2626', '#F87171'],
  info: ['#0EA5E9', '#38BDF8'],
  
  // Special effect gradients
  aurora: ['#667eea', '#764ba2', '#f093fb'],
  sunset: ['#fa709a', '#fee140'],
  ocean: ['#2E3192', '#1BFFFF'],
  forest: ['#134E5E', '#71B280'],
  fire: ['#F12711', '#F5AF19'],
  purple: ['#667eea', '#764ba2'],
  
  // Neutral gradients
  lightGray: ['#F8F9FA', '#E9ECEF'],
  darkGray: ['#495057', '#343A40'],
  
  // Background gradients
  backgroundLight: ['#FFFFFF', '#F8F9FA'],
  backgroundDark: ['#1A1A1A', '#0D0D0D'],
  
  // Overlay gradients (for glass effects)
  glassLight: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.4)'],
  glassDark: ['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.4)'],
  
  // Card gradients
  cardHover: ['rgba(0, 123, 255, 0.05)', 'rgba(0, 180, 216, 0.05)'],
  
  // Status gradients
  compliant: ['#28A745', '#34D058'],
  modifiable: ['#FD7E14', '#FBBF24'],
  nonCompliant: ['#DC3545', '#F87171'],
} as const;

export type GradientName = keyof typeof Gradients;

/**
 * Get gradient colors by name
 */
export const getGradient = (name: GradientName): [string, string] | string[] => {
  return Gradients[name];
};
