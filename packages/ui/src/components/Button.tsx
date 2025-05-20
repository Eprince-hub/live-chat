import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../theme';
import Text from './Text';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  label: string;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  label,
  loading = false,
  disabled,
  style,
  ...props
}) => {
  const theme = useTheme<Theme>();

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.gray300;
    switch (variant) {
      case 'primary':
        return theme.colors.buttonPrimary;
      case 'secondary':
        return theme.colors.buttonSecondary;
      case 'outline':
        return 'transparent';
      default:
        return theme.colors.buttonPrimary;
    }
  };

  const getBorderColor = () => {
    if (disabled) return theme.colors.gray300;
    switch (variant) {
      case 'outline':
        return theme.colors.buttonPrimary;
      default:
        return 'transparent';
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.gray600;
    switch (variant) {
      case 'outline':
        return theme.colors.buttonPrimary;
      default:
        return theme.colors.white;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return theme.spacing.s;
      case 'large':
        return theme.spacing.l;
      default:
        return theme.spacing.m;
    }
  };

  const styles = StyleSheet.create({
    button: {
      backgroundColor: getBackgroundColor(),
      borderRadius: theme.borderRadii.m,
      padding: getPadding(),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: variant === 'outline' ? 1 : 0,
      borderColor: getBorderColor(),
      opacity: disabled ? 0.5 : 1,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text
          variant="body"
          style={{ color: getTextColor(), fontWeight: '600' }}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button; 