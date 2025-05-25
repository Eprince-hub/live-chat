import React from 'react';
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  View,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
}

const Input = React.forwardRef<TextInput, InputProps>(({
  label,
  error,
  containerStyle,
  labelStyle,
  errorStyle,
  style,
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
      <TextInput
        ref={ref}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.cardBackground,
            color: theme.colors.textPrimary,
            borderColor: error ? theme.colors.error : theme.colors.gray300,
          },
          style,
        ]}
        placeholderTextColor={theme.colors.textSecondary}
        {...props}
      />
      {error && (
        <Text
          style={[
            styles.error,
            { color: theme.colors.error },
            errorStyle,
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
}) as React.ComponentType<InputProps>;

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  error: {
    marginTop: 4,
    fontSize: 14,
  },
});

export default Input; 