import React from 'react';
import { StyleSheet, View, Text, useColorScheme } from 'react-native';
import Colors from '../constants/Colors';

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const isUser = message.role === 'user';

  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.assistantContainer,
    ]}>
      <View style={[
        styles.messageContainer,
        isUser 
          ? [styles.userMessage, { backgroundColor: colors.primary }] 
          : [styles.assistantMessage, { 
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
            }],
      ]}>
        <Text style={[
          styles.messageText,
          { color: isUser ? '#fff' : colors.text }
        ]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
  },
  messageContainer: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 40,
  },
  userMessage: {
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
});