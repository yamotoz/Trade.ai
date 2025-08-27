import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  className?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  style,
  textStyle,
}) => {
  const { colors } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      borderWidth: variant === 'outline' ? 1 : 0,
    };

    // Tamanhos
    switch (size) {
      case 'sm':
        baseStyle.paddingHorizontal = 16;
        baseStyle.paddingVertical = 8;
        break;
      case 'md':
        baseStyle.paddingHorizontal = 20;
        baseStyle.paddingVertical = 12;
        break;
      case 'lg':
        baseStyle.paddingHorizontal = 24;
        baseStyle.paddingVertical = 16;
        break;
    }

    // Variantes
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = colors.primary[500];
        baseStyle.borderColor = colors.primary[500];
        break;
      case 'secondary':
        baseStyle.backgroundColor = colors.surface.secondary;
        baseStyle.borderColor = colors.surface.secondary;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderColor = colors.primary[500];
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        break;
    }

    // Estados
    if (disabled || loading) {
      baseStyle.opacity = 0.6;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    // Tamanhos de texto
    switch (size) {
      case 'sm':
        baseTextStyle.fontSize = 14;
        break;
      case 'md':
        baseTextStyle.fontSize = 16;
        break;
      case 'lg':
        baseTextStyle.fontSize = 18;
        break;
    }

    // Cores de texto por variante
    switch (variant) {
      case 'primary':
        baseTextStyle.color = 'white';
        break;
      case 'secondary':
        baseTextStyle.color = colors.text.primary;
        break;
      case 'outline':
        baseTextStyle.color = colors.primary[500];
        break;
      case 'ghost':
        baseTextStyle.color = colors.primary[500];
        break;
    }

    return baseTextStyle;
  };

  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return 'white';
      case 'outline':
      case 'ghost':
        return colors.primary[500];
      default:
        return colors.text.primary;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'md':
        return 18;
      case 'lg':
        return 20;
    }
  };

  const renderIcon = () => {
    if (!icon || loading) return null;

    return (
      <Ionicons
        name={icon}
        size={getIconSize()}
        color={getIconColor()}
        style={{
          marginLeft: iconPosition === 'right' ? 8 : 0,
          marginRight: iconPosition === 'left' ? 8 : 0,
        }}
      />
    );
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? 'white' : colors.primary[500]}
        />
      ) : (
        <>
          {iconPosition === 'left' && renderIcon()}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {iconPosition === 'right' && renderIcon()}
        </>
      )}
    </TouchableOpacity>
  );
};
