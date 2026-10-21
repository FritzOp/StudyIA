import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Hand from 'reicon-react-native/icons/Hand';
import { useTheme } from '../context/ThemeContext';

export default function Header({ user, onNotificationPress, onProfilePress }) {
  const { theme } = useTheme();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días!';
    if (hour < 18) return '¡Buenas tardes!';
    return '¡Buenas noches!';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <View style={styles.userInfo}>
        <TouchableOpacity onPress={onProfilePress} activeOpacity={0.8}>
          <Image
            source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }}
            style={[styles.avatar, { borderColor: theme.primaryLight }]}
          />
          <View style={[styles.onlineBadge, { backgroundColor: theme.success, borderColor: theme.surface }]} />
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <Text style={[styles.greeting, { color: theme.textMuted }]}>{getGreeting()}</Text>
          <View style={styles.nameRow}>
            <Text style={[styles.userName, { color: theme.textPrimary }]} numberOfLines={1}>
              {user?.name || 'Estudiante'}
            </Text>
            <Hand size={18} color="#FBBF24" weight="Filled" />
          </View>
          <View style={styles.institutionBadge}>
            <MaterialCommunityIcons name="school-outline" size={12} color={theme.primary} />
            <Text style={[styles.institutionText, { color: theme.primary }]} numberOfLines={1}>
              {user?.institution || 'Universidad de La Guajira'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.primaryLight }]}
          onPress={onNotificationPress}
        >
          <MaterialCommunityIcons name="bell-outline" size={22} color={theme.textPrimary} />
          <View style={[styles.notificationDot, { backgroundColor: theme.error, borderColor: theme.surface }]} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  greeting: {
    fontSize: 12,
    fontWeight: '500',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },
  institutionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  institutionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
});
