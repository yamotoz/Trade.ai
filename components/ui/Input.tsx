import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';

interface InputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  label?: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  leftIcon,
  rightIcon,
  onRightIconPress,
  disabled = false,
  style,
  inputStyle,
  label,
  required = false,
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getContainerStyle = (): ViewStyle => {
    return {
      backgroundColor: colors.surface.primary,
      borderWidth: 1,
      borderColor: error 
        ? colors.accent.red 
        : isFocused 
          ? colors.primary[500] 
          : colors.surface.secondary,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: multiline ? 'flex-start' : 'center',
      minHeight: multiline ? numberOfLines * 24 + 24 : 48,
      opacity: disabled ? 0.6 : 1,
    };
  };

  const getInputStyle = (): TextStyle => {
    return {
      flex: 1,
      color: colors.text.primary,
      fontSize: 16,
      lineHeight: 20,
      textAlignVertical: multiline ? 'top' : 'center',
      ...inputStyle,
    };
  };

  const getLabelStyle = (): TextStyle => {
    return {
      color: colors.text.secondary,
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 8,
    };
  };

  const getErrorStyle = (): TextStyle => {
    return {
      color: colors.accent.red,
      fontSize: 12,
      marginTop: 4,
      marginLeft: 16,
    };
  };

  const handleFocus = () => {
    if (!disabled) {
      setIsFocused(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const renderLeftIcon = () => {
    if (!leftIcon) return null;

    return (
      <Ionicons
        name={leftIcon}
        size={20}
        color={colors.text.tertiary}
        style={{ marginRight: 12 }}
      />
    );
  };

  const renderRightIcon = () => {
    if (!rightIcon && !secureTextEntry) return null;

    if (secureTextEntry) {
      return (
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={{ marginLeft: 12 }}
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color={colors.text.tertiary}
          />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={onRightIconPress}
        style={{ marginLeft: 12 }}
        disabled={!onRightIconPress}
      >
        <Ionicons
          name={rightIcon}
          size={20}
          color={onRightIconPress ? colors.primary[500] : colors.text.tertiary}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={style}>
      {label && (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={getLabelStyle()}>{label}</Text>
          {required && (
            <Text style={[getLabelStyle(), { color: colors.accent.red, marginLeft: 4 }]}>
              *
            </Text>
          )}
        </View>
      )}
      
      <View style={getContainerStyle()}>
        {renderLeftIcon()}
        
        <TextInput
          style={getInputStyle()}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor={colors.primary[500]}
        />
        
        {renderRightIcon()}
      </View>
      
      {error && (
        <Text style={getErrorStyle()}>{error}</Text>
      )}
    </View>
  );
};
