import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  useColorScheme,
  TextInput as RNTextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import ChatMessage, { Message } from '../../components/ChatMessage';
import { Send } from 'lucide-react-native';

// Sample data
const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hi there! I\'m your AI parenting assistant. How can I help you today with Alex?',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
  },
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const inputRef = useRef<RNTextInput>(null);
  const flatListRef = useRef<FlatList>(null);
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const handleSend = () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      // Example responses - in a real app, this would come from an API
      let responseText = '';
      
      if (inputText.toLowerCase().includes('allerg')) {
        responseText = 'Based on the allergy information you provided for Alex, I recommend avoiding dairy, eggs, and nuts. Always consult with a pediatrician or allergist for professional advice.';
      } else if (inputText.toLowerCase().includes('food') || inputText.toLowerCase().includes('eat')) {
        responseText = 'At 8 months, Alex can try soft finger foods like well-cooked vegetables, soft fruits, and toast. Be cautious with any known allergens and always supervise eating time.';
      } else if (inputText.toLowerCase().includes('sleep')) {
        responseText = 'Most 8-month-olds need about 14 hours of sleep per day, including 2-3 naps. Alex\'s last recorded nap was about 4 hours ago. Consider a consistent bedtime routine to help with sleep.';
      } else {
        responseText = 'I understand you\'re asking about Alex. For the most personalized advice, please provide more specific details about your question, and I\'ll do my best to help.';
      }
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>AI Assistant</Text>
      </View>
      
      <View style={styles.disclaimerContainer}>
        <Text style={[styles.disclaimerText, { color: colors.warning }]}>
          This AI provides general guidance based on your child's information, but cannot replace professional medical advice.
        </Text>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => <ChatMessage message={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      
      {isTyping && (
        <View style={[styles.typingContainer, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.typingText, { color: colors.gray[500] }]}>
            AI is typing...
          </Text>
        </View>
      )}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <View style={[
          styles.inputContainer, 
          { 
            backgroundColor: colors.cardBackground,
            borderTopColor: colors.border,
          }
        ]}>
          <RNTextInput
            ref={inputRef}
            style={[
              styles.input, 
              { 
                backgroundColor: colorScheme === 'dark' ? colors.gray[800] : colors.gray[100],
                color: colors.text,
              }
            ]}
            placeholder="Type your question..."
            placeholderTextColor={colors.gray[400]}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: inputText.trim() ? colors.primary : colors.gray[300] }
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  disclaimerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  disclaimerText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  messageList: {
    padding: 16,
  },
  typingContainer: {
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  typingText: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingRight: 40,
    maxHeight: 120,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -40,
  },
});