import React from 'react';
import {
  Switch as RNSwitch,
  SwitchProps as RNSwitchProps,
  StyleSheet,
  View,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../theme';

export interface SwitchProps extends RNSwitchProps {
  label?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
}

const Switch = React.forwardRef<RNSwitch, SwitchProps>(({
  label,
  containerStyle,
  labelStyle,
  ...props
}, ref) => {
  const theme = useTheme<Theme>();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: theme.colors.textPrimary },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}
      <RNSwitch
        ref={ref}
        trackColor={{
          false: theme.colors.gray300,
          true: theme.colors.primary,
        }}
        thumbColor={theme.colors.white}
        ios_backgroundColor={theme.colors.gray300}
        {...props}
      />
    </View>
  );
}) as React.ComponentType<SwitchProps>;

Switch.displayName = 'Switch';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    marginRight: 8,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Switch; 