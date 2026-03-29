import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, useTheme } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  style,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const { colors: t } = useTheme();

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: t.darkText }]}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: t.surface, borderColor: t.border },
          focused && { borderColor: t.primary, backgroundColor: t.surface },
          error && { borderColor: t.error },
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={focused ? t.primary : t.lightText}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.input, { color: t.darkText }, style]}
          placeholderTextColor={t.placeholderText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress}>
            <Ionicons
              name={rightIcon}
              size={20}
              color={t.lightText}
              style={styles.icon}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.error, { color: t.error }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.base,
  },
  label: {
    ...typography.subhead,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.base,
    minHeight: 52,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    paddingVertical: spacing.md,
  },
  error: {
    ...typography.caption1,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
