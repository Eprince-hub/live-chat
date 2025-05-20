import {
  createRestyleComponent,
  createVariant,
  VariantProps,
} from '@shopify/restyle';
import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
} from 'react-native';
import { Theme } from '../theme';

const variant = createVariant<Theme>({
  themeKey: 'textVariants',
  defaults: {
    variant: 'body',
  },
});

type RestyleProps = VariantProps<Theme, 'textVariants'>;

interface TextProps extends RNTextProps, RestyleProps {
  children: React.ReactNode;
  style?: TextStyle;
}

const Text = createRestyleComponent<TextProps, Theme>([variant], RNText);

export default Text;
