import { Text as RNText, } from 'react-native';
import { createRestyleComponent, createVariant, } from '@shopify/restyle';
const variant = createVariant({
    themeKey: 'textVariants',
    defaults: {
        variant: 'body',
    },
});
const Text = createRestyleComponent([variant], RNText);
export default Text;
