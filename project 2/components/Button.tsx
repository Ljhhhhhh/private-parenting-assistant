import React from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps
} from 'react-native';
import { useColorScheme } from 'react-native';
import Colors from '../constants/Colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
  ...props
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Determine button style based on variant
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? colors.gray[400] : colors.primary,
          borderColor: 'transparent',
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? colors.gray[400] : colors.secondary,
          borderColor: 'transparent',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: disabled ? colors.gray[400] : colors.primary,
          borderWidth: 1,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
      default:
        return {
          backgroundColor: disabled ? colors.gray[400] : colors.primary,
          borderColor: 'transparent',
        };
    }
  };

  // Determine text color based on variant
  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return colors.gray[100];
      case 'outline':
      case 'text':
        return disabled ? colors.gray[400] : colors.primary;
      default:
        return colors.gray[100];
    }
  };

  // Determine button size
  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
        };
      case 'medium':
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
        };
    }
  };

  // Determine text size
  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getButtonStyle(),
        getButtonSize(),
        fullWidth && styles.fullWidth,
        style,
      ]}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text
          style={[
            styles.text,
            { color: getTextColor(), fontSize: getTextSize() },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});