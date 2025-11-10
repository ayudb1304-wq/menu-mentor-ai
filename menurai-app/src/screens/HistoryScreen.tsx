import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { CheckCircle, Info, XCircle, Trash2, Share2, History as HistoryIcon } from '../components/icons';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../theme/styles';
import { Card, LoadingOverlay, SkeletonHistoryItem, PageTransition, StaggeredList, GlassCard, SwipeableCard, EmptyState, EnhancedRefresh, HeroTransition } from '../components';
import historyService, { ScanHistory } from '../services/historyService';

export const HistoryScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [history, setHistory] = useState<ScanHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const scans = await historyService.getScanHistory();
      setHistory(scans);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const handleDeleteScan = (scanId: string) => {
    Alert.alert(
      'Delete Scan',
      'Are you sure you want to delete this scan from history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await historyService.deleteScan(scanId);
              setHistory((prev) => prev.filter((scan) => scan.id !== scanId));
            } catch (error) {
              console.error('Error deleting scan:', error);
              Alert.alert('Error', 'Failed to delete scan');
            }
          },
        },
      ]
    );
  };

  const getCategoryCounts = (items: any[]) => {
    const compliant = items.filter((item) => item.classification === 'compliant').length;
    const modifiable = items.filter((item) => item.classification === 'modifiable').length;
    const nonCompliant = items.filter((item) => item.classification === 'non_compliant').length;
    return { compliant, modifiable, nonCompliant };
  };

  const renderScanItem = ({ item, index }: { item: ScanHistory; index: number }) => {
    const { compliant, modifiable, nonCompliant } = getCategoryCounts(item.items);
    const scanDate = item.scanDate?.toDate ? item.scanDate.toDate() : new Date();

    return (
      <HeroTransition delay={index * 50} duration={400}>
        <SwipeableCard
          leftAction={{
            icon: 'trash-2',
            color: Colors.semantic.nonCompliant,
            onPress: () => handleDeleteScan(item.id),
            label: 'Delete',
          }}
          rightAction={{
            icon: 'share-2',
            color: Colors.brand.blue,
            onPress: () => {
              Alert.alert('Share', `Share scan from ${format(scanDate, 'MMM d, yyyy')}`);
            },
            label: 'Share',
          }}
        >
          <Card 
        style={styles.scanCard}
        variant="elevated"
        pressable
        onPress={() => {
          // Navigate to detailed view (can be implemented later)
          Alert.alert(
            'Scan Details',
            `${item.items.length} items analyzed\n${compliant} compliant, ${modifiable} modifiable, ${nonCompliant} non-compliant`
          );
        }}
      >
          <View style={styles.scanHeader}>
            <View style={styles.scanInfo}>
              <Text style={[styles.scanDate, { color: colors.secondaryText }]}>
                {format(scanDate, 'MMM d, yyyy • h:mm a')}
              </Text>
              {item.restaurantName && (
                <Text style={[styles.restaurantName, { color: colors.primaryText }]}>
                  {item.restaurantName}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={() => handleDeleteScan(item.id)}>
              <Trash2 size={20} color={colors.secondaryText} />
            </TouchableOpacity>
          </View>

          <View style={styles.scanStats}>
            <View style={styles.statItem}>
              <CheckCircle size={16} color={Colors.semantic.compliant} />
              <Text style={[styles.statText, { color: Colors.semantic.compliant }]}>
                {compliant}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Info size={16} color={Colors.semantic.modifiable} />
              <Text style={[styles.statText, { color: Colors.semantic.modifiable }]}>
                {modifiable}
              </Text>
            </View>
            <View style={styles.statItem}>
              <XCircle size={16} color={Colors.semantic.nonCompliant} />
              <Text style={[styles.statText, { color: Colors.semantic.nonCompliant }]}>
                {nonCompliant}
              </Text>
            </View>
            <View style={styles.totalItems}>
              <Text style={[styles.totalText, { color: colors.secondaryText }]}>
                {item.items.length} items
              </Text>
            </View>
          </View>

        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.thumbnailImage} resizeMode="cover" />
        )}
      </Card>
        </SwipeableCard>
      </HeroTransition>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.listContent}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.primaryText }]}>Scan History</Text>
          </View>
          <SkeletonHistoryItem />
          <SkeletonHistoryItem />
          <SkeletonHistoryItem />
          <SkeletonHistoryItem />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <PageTransition type="fade" duration={300}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {history.length === 0 ? (
        <EmptyState
          icon="history"
          iconSet="MaterialIcons"
          title="No Scan History"
          description="Your menu scans will appear here. Start scanning to build your history!"
          actionLabel="Scan Now"
          onAction={() => navigation.navigate('Scan' as never)}
        />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderScanItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <EnhancedRefresh
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.primaryText }]}>Scan History</Text>
              <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
                {history.length} total scans
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
    </PageTransition>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
  },
  title: {
    ...Typography.h3,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
  },
  scanCard: {
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  scanInfo: {
    flex: 1,
  },
  scanDate: {
    ...Typography.caption,
  },
  restaurantName: {
    ...Typography.bodyMedium,
    marginTop: Spacing.xs,
  },
  scanStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  statText: {
    ...Typography.bodySmall,
    marginLeft: Spacing.xs,
    fontWeight: '600' as '600',
  },
  totalItems: {
    marginLeft: 'auto',
  },
  totalText: {
    ...Typography.bodySmall,
  },
  thumbnailImage: {
    width: '100%',
    height: 120,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h4,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
  },
});