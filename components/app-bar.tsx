import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AppBarProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export const AppBar: React.FC<AppBarProps> = ({ title, actionLabel, onActionPress }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: theme.tint }}>
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>{title}</Text>
        {actionLabel && (
          <TouchableOpacity style={styles.appBarButton} onPress={onActionPress}>
            <Text style={[styles.appBarButtonText, { color: theme.tint }]}>{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  appBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  appBarTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  appBarButton: {
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  appBarButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});
