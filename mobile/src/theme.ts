export type ThemeMode = 'light' | 'dark';

export type AppThemeColors = {
  primary: string;
  primaryDark: string;
  deepBlue: string;
  black: string;
  gray: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  success: string;
  warning: string;
  danger: string;
  onPrimary: string;
  primarySoft: string;
  successSoft: string;
  dangerSoft: string;
  categoryIconBackground: string;
  modalOverlay: string;
  shadow: string;
};

export const lightColors: AppThemeColors = {
  primary: '#F55252',
  primaryDark: '#BF0426',
  deepBlue: '#2B2D42',
  black: '#000000',
  gray: '#9E9E9E',
  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F2F5',
  border: '#E1E4E8',
  text: '#111111',
  textMuted: '#686D76',
  success: '#168A4A',
  warning: '#B7791F',
  danger: '#BF0426',
  onPrimary: '#FFFFFF',
  primarySoft: '#FFEAEA',
  successSoft: '#F0FAF8',
  dangerSoft: '#FFF5F5',
  categoryIconBackground: '#F4F4F4',
  modalOverlay: 'rgba(0,0,0,0.32)',
  shadow: '#000000',
};

export const darkColors: AppThemeColors = {
  primary: '#FF6B6B',
  primaryDark: '#FF8B8B',
  deepBlue: '#DCE3FF',
  black: '#000000',
  gray: '#8E97A8',
  background: '#0D1117',
  surface: '#161B22',
  surfaceAlt: '#21262D',
  border: '#30363D',
  text: '#F0F3F6',
  textMuted: '#A7B0BE',
  success: '#4CCB7F',
  warning: '#F2C36B',
  danger: '#FF7A7A',
  onPrimary: '#FFFFFF',
  primarySoft: '#3A2024',
  successSoft: '#123326',
  dangerSoft: '#381B20',
  categoryIconBackground: '#242B34',
  modalOverlay: 'rgba(0,0,0,0.62)',
  shadow: '#000000',
};

export const colors = lightColors;

export const getThemeColors = (themeMode: ThemeMode): AppThemeColors =>
  themeMode === 'dark' ? darkColors : lightColors;

export const fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  bold: 'Poppins_700Bold',
};

export const radius = {
  sm: 6,
  md: 8,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};
