import React from 'react';
import {
  StyleSheet,
  TextInput as RNTextInput,
  View,
  Text,
  TextInputProps,
  ViewStyle,
  useColorScheme,
} from 'react-native';
import Colors from '../constants/Colors';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  multiline?: boolean;
}

export default function TextInput({
  label,
  error,
  containerStyle,
  multiline = false,
  ...props
}: CustomTextInputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <RNTextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          { 
            color: colors.text,
            backgroundColor: colors.cardBackground,
            borderColor: error ? colors.error : colors.border,
          },
        ]}
        placeholderTextColor={colors.gray[400]}
        multiline={multiline}
        {...props}
      />
      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
});