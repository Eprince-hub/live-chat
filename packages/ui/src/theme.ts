import { createTheme } from '@shopify/restyle';

const palette = {
  purplePrimary: '#493d8a',
  purpleSecondary: '#6b5bae',
  gray100: '#f5f5f5',
  gray200: '#e5e5e5',
  gray300: '#d4d4d4',
  gray400: '#a3a3a3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#262626',
  gray900: '#171717',
  white: '#ffffff',
  black: '#000000',
  red: '#ff4d4d',
};

const theme = createTheme({
  colors: {
    mainBackground: palette.white,
    mainForeground: palette.black,
    cardPrimaryBackground: palette.white,
    buttonPrimary: palette.purplePrimary,
    buttonSecondary: palette.purpleSecondary,
    textPrimary: palette.black,
    cardBackground: palette.gray100,
    textSecondary: palette.gray600,
    primary: palette.purplePrimary,
    error: palette.red,
    gray100: palette.gray100,
    gray200: palette.gray200,
    gray300: palette.gray300,
    gray400: palette.gray400,
    gray500: palette.gray500,
    gray600: palette.gray600,
    gray700: palette.gray700,
    gray800: palette.gray800,
    gray900: palette.gray900,
    white: palette.white,
    black: palette.black,
    red: palette.red,
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
      fontSize: 24,
      fontWeight: '700',
      color: 'mainForeground',
    },
    subheader: {
      fontSize: 18,
      fontWeight: '600',
      color: 'mainForeground',
    },
    body: {
      fontSize: 16,
      color: 'mainForeground',
    },
    caption: {
      fontSize: 14,
      color: 'gray600',
    },
  },
});

export type Theme = typeof theme;
export default theme;
