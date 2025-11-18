import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { CheckCircle, Info, XCircle, Trash2, Share2, History as HistoryIcon, Lock } from '../components/icons';
import { format } from 'date-fns';
import { useNavigation, useFocusEffect, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../theme/styles';
import { Card, LoadingOverlay, SkeletonHistoryItem, PageTransition, StaggeredList, GlassCard, SwipeableCard, EmptyState, EnhancedRefresh, HeroTransition, Button } from '../components';
import historyService, { ScanHistory } from '../services/historyService';
import { useUserProfile } from '../hooks/useUserProfile';
import { ScanStackParamList, HomeTabParamList } from '../navigation/types';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<HomeTabParamList, 'History'>,
  StackNavigationProp<ScanStackParamList>
>;

export const HistoryScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { isPremiumUser } = useUserProfile();
  const [history, setHistory] = useState<ScanHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [scanToDelete, setScanToDelete] = useState<string | null>(null);
  
  const isPremium = isPremiumUser;
  const FREE_SCAN_LIMIT = 3;

  // Reload history when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    try {
      console.log('Loading history...');
      const scans = await historyService.getScanHistory();
      console.log(`Loaded ${scans.length} scans in HistoryScreen`);
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

  const setDeletingState = (scanId: string, value: boolean) => {
    setDeletingIds((prev) => {
      const updated = { ...prev };
      if (value) {
        updated[scanId] = true;
      } else {
        delete updated[scanId];
      }
      return updated;
    });
  };

  const handleDeleteScan = (scanId: string) => {
    console.log('handleDeleteScan called with scanId:', scanId);
    
    if (deletingIds[scanId]) {
      console.log('Scan is already being deleted, ignoring request');
      return;
    }

    // Show confirmation modal
    setScanToDelete(scanId);
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = async () => {
    if (!scanToDelete) return;

    const scanId = scanToDelete;
    console.log('Delete confirmed, starting deletion process for:', scanId);
    
    setDeleteConfirmVisible(false);
    const previousHistory = [...history];
    setDeletingState(scanId, true);
    setHistory((prev) => prev.filter((scan) => scan.id !== scanId));
    setScanToDelete(null);

    try {
      console.log('Calling historyService.deleteScan with:', scanId);
      const result = await historyService.deleteScan(scanId);
      console.log('Delete result:', result);

      if (!result.success) {
        console.warn('Delete failed:', result.message);
        setHistory(previousHistory);
        Alert.alert(
          'Unable to Delete Scan',
          result.message || 'Failed to delete scan. Please try again.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Success - item already removed from UI via optimistic update
      console.log('Scan successfully deleted:', scanId);
    } catch (error: any) {
      console.error('Error deleting scan:', error);
      setHistory(previousHistory);
      const errorMessage = error?.message || 'Failed to delete scan. Please try again.';
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    } finally {
      setDeletingState(scanId, false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmVisible(false);
    setScanToDelete(null);
  };

  const getCategoryCounts = (items: any[]) => {
    const compliant = items.filter((item) => item.classification === 'compliant').length;
    const modifiable = items.filter((item) => item.classification === 'modifiable').length;
    const nonCompliant = items.filter((item) => item.classification === 'non_compliant').length;
    return { compliant, modifiable, nonCompliant };
  };

  const handleScanPress = (scanId: string, isBlurred: boolean) => {
    if (isBlurred) {
      // Show premium upgrade prompt
      Alert.alert(
        'Premium Required',
        'Upgrade to Premium to view your full scan history. Free users can view up to 3 recent scans.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upgrade',
            onPress: () =>
              navigation.navigate('Scan', {
                screen: 'Paywall',
                params: { context: 'scanLimit' },
              }),
          },
        ]
      );
    } else {
      // Navigate to analysis result screen in the Scan stack
      // Since HistoryScreen is in the tab navigator, we need to navigate to the Scan tab first
      navigation.navigate('Scan', {
        screen: 'AnalysisResult',
        params: { scanId },
      });
    }
  };

  const renderScanItem = ({ item, index }: { item: ScanHistory; index: number }) => {
    const { compliant, modifiable, nonCompliant } = getCategoryCounts(item.items);
    const scanDate = item.scanDate?.toDate ? item.scanDate.toDate() : new Date();
    const isBlurred = !isPremium && index >= FREE_SCAN_LIMIT;

    const isDeleting = !!deletingIds[item.id];

    return (
      <HeroTransition delay={index * 50} duration={400}>
        <SwipeableCard
          leftAction={{
            icon: 'trash-2',
            color: Colors.semantic.nonCompliant,
            onPress: () => {
              if (!isDeleting) {
                handleDeleteScan(item.id);
              }
            },
            label: 'Delete',
          }}
          rightAction={{
            icon: 'share-2',
            color: Colors.brand.primary,
            onPress: () => {
              if (isBlurred) {
                Alert.alert('Premium Required', 'Upgrade to Premium to share scans.');
              } else {
                Alert.alert('Share', `Share scan from ${format(scanDate, 'MMM d, yyyy')}`);
              }
            },
            label: 'Share',
          }}
        >
          <Card
            style={styles.scanCard}
            variant="elevated"
            pressable
            onPress={() => {
              // Only navigate if not deleting
              if (!isDeleting) {
                handleScanPress(item.id, isBlurred);
              }
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
                <View style={styles.profileRow}>
                  <Text style={[styles.profileLabel, { color: colors.secondaryText }]}>Profile</Text>
                  <Text style={[styles.profileValue, { color: colors.primaryText }]}>
                    {item.profileName || 'Primary profile'}
                  </Text>
                </View>
              </View>
              <View
                onStartShouldSetResponder={() => true}
                onResponderTerminationRequest={() => false}
              >
                <Pressable
                  onPress={() => {
                    console.log('Trash button pressed for scanId:', item.id);
                    handleDeleteScan(item.id);
                  }}
                  disabled={isDeleting}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={({ pressed }) => [
                    {
                      padding: 4,
                      opacity: isDeleting ? 0.6 : pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color={colors.secondaryText} />
                  ) : (
                    <Trash2 size={20} color={colors.secondaryText} />
                  )}
                </Pressable>
              </View>
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
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.imageUrl }} style={styles.thumbnailImage} resizeMode="cover" />
                {isBlurred && (
                  <View style={styles.blurOverlay}>
                    <View style={styles.blurContent}>
                      <Lock size={32} color={Colors.white} />
                      <Text style={styles.blurText}>Premium Required</Text>
                      <Text style={styles.blurSubtext}>Upgrade to view this scan</Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </Card>
        </SwipeableCard>
      </HeroTransition>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.container }]}>
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.container }]}>
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

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteConfirmVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={cancelDelete}
        >
          <Pressable 
            style={[styles.modalContent, { backgroundColor: colors.card }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Trash2 size={24} color={Colors.semantic.nonCompliant} />
              <Text style={[styles.modalTitle, { color: colors.primaryText }]}>
                Delete Scan?
              </Text>
            </View>
            
            <Text style={[styles.modalMessage, { color: colors.secondaryText }]}>
              Are you sure you want to delete this scan from your history? This action cannot be undone.
            </Text>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={cancelDelete}
                style={styles.modalButton}
              />
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmDelete}
                activeOpacity={0.8}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  profileLabel: {
    ...Typography.caption,
    textTransform: 'uppercase' as 'uppercase',
    marginRight: Spacing.xs,
  },
  profileValue: {
    ...Typography.caption,
    fontWeight: '600' as '600',
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
  imageContainer: {
    position: 'relative',
    marginTop: Spacing.sm,
  },
  thumbnailImage: {
    width: '100%',
    height: 120,
    borderRadius: BorderRadius.sm,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContent: {
    alignItems: 'center',
  },
  blurText: {
    ...Typography.bodyMedium,
    color: Colors.white,
    marginTop: Spacing.sm,
    fontWeight: '600' as '600',
  },
  blurSubtext: {
    ...Typography.caption,
    color: Colors.white,
    marginTop: Spacing.xs,
    opacity: 0.9,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  modalTitle: {
    ...Typography.h4,
    flex: 1,
  },
  modalMessage: {
    ...Typography.body,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: Colors.semantic.nonCompliant,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    ...Typography.button,
    color: Colors.white,
    fontWeight: '600',
  },
});