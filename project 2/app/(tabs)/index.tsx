import React from 'react';
import { StyleSheet, Text, View, ScrollView, useColorScheme } from 'react-native';
import Colors from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogEntry } from '../../components/LogItem';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { router } from 'expo-router';
import { formatDate } from '../../utils/dateUtils';
import { Heart, Utensils, Moon, Baby } from 'lucide-react-native';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Sample data
  const childName = "Alex";
  const childAge = "8 months";
  const today = new Date();
  
  // Recent activity - this would come from your data store in a real app
  const recentActivity: LogEntry[] = [
    {
      id: '1',
      type: 'feed',
      timestamp: new Date(today.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      note: 'Bottle feed, 5oz'
    },
    {
      id: '2',
      type: 'sleep',
      timestamp: new Date(today.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
      note: 'Nap time, slept for 1.5 hours'
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.date, { color: colors.gray[500] }]}>
            {formatDate(today)}
          </Text>
          <Text style={[styles.greeting, { color: colors.text }]}>
            Good morning!
          </Text>
        </View>

        <Card style={styles.childCard}>
          <View style={styles.childInfo}>
            <View style={styles.childTextContainer}>
              <Text style={[styles.childName, { color: colors.text }]}>
                {childName}
              </Text>
              <Text style={[styles.childDetails, { color: colors.gray[500] }]}>
                {childAge}
              </Text>
            </View>
            
            <View style={[
              styles.childAvatarPlaceholder, 
              { backgroundColor: colors.primary + '20' }
            ]}>
              <Baby color={colors.primary} size={32} />
            </View>
          </View>
          
          <View style={styles.quickStatsContainer}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
                <Utensils size={16} color={colors.primary} />
              </View>
              <Text style={[styles.statText, { color: colors.gray[600] }]}>
                Last feed: 2h ago
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: colors.secondary + '20' }]}>
                <Moon size={16} color={colors.secondary} />
              </View>
              <Text style={[styles.statText, { color: colors.gray[600] }]}>
                Last nap: 4h ago
              </Text>
            </View>
          </View>
          
          <Button 
            title="Add New Record" 
            onPress={() => router.push('/(tabs)/records')}
            style={styles.recordButton}
          />
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Check
          </Text>
        </View>

        <View style={styles.quickChecksContainer}>
          <Card style={styles.tipCard}>
            <View style={[styles.tipIcon, { backgroundColor: colors.warning + '20' }]}>
              <Heart size={20} color={colors.warning} />
            </View>
            <Text style={[styles.tipTitle, { color: colors.text }]}>
              Health Check
            </Text>
            <Text style={[styles.tipText, { color: colors.gray[500] }]}>
              8-month checkup recommended this month
            </Text>
          </Card>
          
          <Card style={styles.tipCard}>
            <View style={[styles.tipIcon, { backgroundColor: colors.primary + '20' }]}>
              <Utensils size={20} color={colors.primary} />
            </View>
            <Text style={[styles.tipTitle, { color: colors.text }]}>
              Feeding Tip
            </Text>
            <Text style={[styles.tipText, { color: colors.gray[500] }]}>
              Try introducing soft finger foods
            </Text>
          </Card>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Activity
          </Text>
          <Text 
            style={[styles.viewAll, { color: colors.primary }]}
            onPress={() => router.push('/(tabs)/records')}
          >
            View all
          </Text>
        </View>

        {recentActivity.map(activity => (
          <Card key={activity.id} style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <View style={[
                styles.activityBadge, 
                { 
                  backgroundColor: activity.type === 'feed' 
                    ? colors.primary 
                    : colors.secondary 
                }
              ]}>
                {activity.type === 'feed' ? (
                  <Utensils size={16} color="#fff" />
                ) : (
                  <Moon size={16} color="#fff" />
                )}
              </View>
              
              <Text style={[styles.activityType, { color: colors.text }]}>
                {activity.type === 'feed' ? 'Feeding' : 'Sleep'}
              </Text>
              
              <Text style={[styles.activityTime, { color: colors.gray[500] }]}>
                {formatDate(activity.timestamp)}
              </Text>
            </View>
            
            <Text style={[styles.activityNote, { color: colors.text }]}>
              {activity.note}
            </Text>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  date: {
    fontSize: 14,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
  },
  childCard: {
    marginBottom: 24,
  },
  childInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  childTextContainer: {
    flex: 1,
  },
  childName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  childDetails: {
    fontSize: 14,
  },
  childAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickStatsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statText: {
    fontSize: 14,
  },
  recordButton: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickChecksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tipCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
  },
  activityCard: {
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  activityType: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  activityTime: {
    fontSize: 14,
  },
  activityNote: {
    fontSize: 14,
    lineHeight: 20,
  },
});