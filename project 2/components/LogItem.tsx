import React from 'react';
import { StyleSheet, View, Text, useColorScheme } from 'react-native';
import Colors from '../constants/Colors';
import { formatTime } from '../utils/dateUtils';

export type LogType = 'feed' | 'sleep' | 'diaper' | 'note';

export interface LogEntry {
  id: string;
  type: LogType;
  timestamp: Date;
  note?: string;
  details?: Record<string, any>;
}

interface LogItemProps {
  entry: LogEntry;
}

export default function LogItem({ entry }: LogItemProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Define color and title based on log type
  const getLogTypeDetails = (type: LogType) => {
    switch (type) {
      case 'feed':
        return { 
          color: colors.primary, 
          title: 'Feed',
          textColor: '#fff'
        };
      case 'sleep':
        return { 
          color: colors.secondary, 
          title: 'Sleep',
          textColor: '#fff'
        };
      case 'diaper':
        return { 
          color: colors.accent, 
          title: 'Diaper',
          textColor: '#000'
        };
      case 'note':
        return { 
          color: colors.gray[300], 
          title: 'Note',
          textColor: colors.text
        };
      default:
        return { 
          color: colors.gray[300], 
          title: 'Event',
          textColor: colors.text
        };
    }
  };

  const { color, title, textColor } = getLogTypeDetails(entry.type);

  const getDetailsText = () => {
    if (!entry.details) return null;

    switch (entry.type) {
      case 'feed':
        return `${entry.details.amount}${entry.details.unit} of ${entry.details.type}`;
      case 'sleep':
        return `${entry.details.duration} hours - ${entry.details.quality} sleep`;
      case 'diaper':
        return `${entry.details.type} diaper - ${entry.details.consistency} consistency`;
      default:
        return null;
    }
  };

  const detailsText = getDetailsText();

  return (
    <View style={styles.container}>
      <View style={styles.timelineContainer}>
        <View style={[styles.timelineDot, { backgroundColor: color }]} />
        <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <View style={[styles.badge, { backgroundColor: color }]}>
            <Text style={[styles.badgeText, { color: textColor }]}>
              {title}
            </Text>
          </View>
          <Text style={[styles.time, { color: colors.gray[500] }]}>
            {formatTime(entry.timestamp)}
          </Text>
        </View>
        {detailsText && (
          <Text style={[styles.details, { color: colors.text }]}>
            {detailsText}
          </Text>
        )}
        {entry.note && (
          <Text style={[styles.note, { color: colors.gray[600] }]}>
            {entry.note}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineContainer: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  contentContainer: {
    flex: 1,
    marginBottom: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  time: {
    fontSize: 14,
  },
  details: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  note: {
    fontSize: 14,
    lineHeight: 20,
  },
});