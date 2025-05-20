import React from 'react';
import { TouchableOpacityProps } from 'react-native';
interface ButtonProps extends TouchableOpacityProps {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'small' | 'medium' | 'large';
    label: string;
    loading?: boolean;
}
declare const Button: React.FC<ButtonProps>;
export default Button;
