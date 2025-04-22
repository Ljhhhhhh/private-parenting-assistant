import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  useColorScheme,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { CircleHelp as HelpCircle, Settings, Shield, LogOut, Bell, Heart, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
}

function MenuItem({ icon, title, subtitle, onPress }: MenuItemProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  return (
    <TouchableOpacity 
      style={[
        styles.menuItem, 
        { borderBottomColor: colors.border }
      ]}
      onPress={onPress}
    >
      <View style={styles.menuItemIcon}>
        {icon}
      </View>
      <View style={styles.menuItemContent}>
        <Text style={[styles.menuItemTitle, { color: colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.menuItemSubtitle, { color: colors.gray[500] }]}>
            {subtitle}
          </Text>
        )}
      </View>
      <ChevronRight size={20} color={colors.gray[400]} />
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>More</Text>
      </View>
      
      <ScrollView>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.gray[500] }]}>
            ACCOUNT
          </Text>
          
          <View style={[styles.menuCard, { backgroundColor: colors.cardBackground }]}>
            <MenuItem
              icon={<Settings size={24} color={colors.primary} />}
              title="Account Settings"
              subtitle="Manage your account and preferences"
              onPress={() => {}}
            />
            
            <MenuItem
              icon={<Bell size={24} color={colors.secondary} />}
              title="Notifications"
              subtitle="Configure your notification settings"
              onPress={() => {}}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.gray[500] }]}>
            SUPPORT
          </Text>
          
          <View style={[styles.menuCard, { backgroundColor: colors.cardBackground }]}>
            <MenuItem
              icon={<HelpCircle size={24} color={colors.accent} />}
              title="Help & Support"
              subtitle="Get help and contact support"
              onPress={() => {}}
            />
            
            <MenuItem
              icon={<Shield size={24} color={colors.success} />}
              title="Privacy & Security"
              subtitle="Review our privacy policy and security information"
              onPress={() => {}}
            />
            
            <MenuItem
              icon={<Heart size={24} color={colors.error} />}
              title="About ParentAssist"
              subtitle="Learn more about our app and mission"
              onPress={() => {}}
            />
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.logoutButton,
            { borderColor: colors.error }
          ]}
          onPress={() => router.replace('/auth/login')}
        >
          <LogOut size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>
            Log Out
          </Text>
        </TouchableOpacity>
        
        <Text style={[styles.versionText, { color: colors.gray[500] }]}>
          Version 1.0.0
        </Text>
      </ScrollView>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  menuCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuItemIcon: {
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 24,
  },
});