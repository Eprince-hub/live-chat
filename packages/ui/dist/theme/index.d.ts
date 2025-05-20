declare const theme: {
    colors: {
        mainBackground: string;
        cardBackground: string;
        textPrimary: string;
        textSecondary: string;
        buttonPrimary: string;
        buttonSecondary: string;
        primary: string;
        secondary: string;
        success: string;
        error: string;
        warning: string;
        black: string;
        white: string;
        gray100: string;
        gray200: string;
        gray300: string;
        gray400: string;
        gray500: string;
        gray600: string;
        gray700: string;
        gray800: string;
        gray900: string;
    };
    spacing: {
        xs: number;
        s: number;
        m: number;
        l: number;
        xl: number;
        xxl: number;
    };
    borderRadii: {
        xs: number;
        s: number;
        m: number;
        l: number;
        xl: number;
        xxl: number;
    };
    textVariants: {
        header: {
            fontWeight: string;
            fontSize: number;
            lineHeight: number;
            color: string;
        };
        subheader: {
            fontWeight: string;
            fontSize: number;
            lineHeight: number;
            color: string;
        };
        body: {
            fontSize: number;
            lineHeight: number;
            color: string;
        };
        caption: {
            fontSize: number;
            lineHeight: number;
            color: string;
        };
    };
    breakpoints: {
        phone: number;
        tablet: number;
    };
};
export type Theme = typeof theme;
export default theme;
