import { createTheme } from '@shopify/restyle';

const palette = {
  primary: '#FF4785',
  secondary: '#6C63FF',
  success: '#00C853',
  error: '#FF3B30',
  warning: '#FF9500',
  black: '#000000',
  white: '#FFFFFF',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
};

const theme = createTheme({
  colors: {
    ...palette,
    mainBackground: palette.white,
    cardBackground: palette.white,
    textPrimary: palette.gray900,
    textSecondary: palette.gray600,
    buttonPrimary: palette.primary,
    buttonSecondary: palette.secondary,
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
  },
  borderRadii: {
    xs: 4,
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
    xxl: 32,
  },
  textVariants: {
    header: {
      fontWeight: 'bold',
      fontSize: 34,
      lineHeight: 42.5,
      color: 'textPrimary',
    },
    subheader: {
      fontWeight: '600',
      fontSize: 28,
      lineHeight: 36,
      color: 'textPrimary',
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      color: 'textPrimary',
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      color: 'textSecondary',
    },
  },
  breakpoints: {
    phone: 0,
    tablet: 768,
  },
});

export type Theme = typeof theme;
export default theme; 