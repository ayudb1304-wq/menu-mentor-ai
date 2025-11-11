import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  ScrollView,
} from 'react-native';
import { Camera, ImageIcon, CheckCircle, X, Utensils, Info, XCircle } from '../components/icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ScanStackParamList } from '../navigation/types';
import { format } from 'date-fns';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../theme/styles';
import { 
  Button, 
  Card, 
  SkeletonHistoryItem,
  GlassCard,
  PageTransition,
  PulseLoader,
  GlassModal,
  EmptyState,
  PressableWithFeedback,
  RevealAnimation,
} from '../components';
import historyService, { ScanHistory } from '../services/historyService';
import { useUserProfile } from '../hooks/useUserProfile';

type NavigationProp = StackNavigationProp<ScanStackParamList, 'ScanOptions'>;

export const ScanOptionsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { canScan, remainingScans, profile, isPremiumUser } = useUserProfile();
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentScans, setRecentScans] = useState<ScanHistory[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  // Reload recent scans when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadRecentScans();
    }, [])
  );

  const loadRecentScans = async () => {
    try {
      setLoadingRecent(true);
      console.log('Loading recent scans...');
      const scans = await historyService.getScanHistory();
      console.log(`Loaded ${scans.length} scans, showing first 3 in ScanOptionsScreen`);
      setRecentScans(scans.slice(0, 3)); // Show only 3 most recent scans
    } catch (error) {
      console.error('Error loading recent scans:', error);
    } finally {
      setLoadingRecent(false);
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'web') {
      return true;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos of menus.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    if (Platform.OS === 'web') {
      return true;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Photo library permission is required to select menu images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    setModalVisible(false);
    
    // Check scan limit before proceeding
    if (!canScan) {
      navigation.navigate('Paywall', { context: 'scanLimit' });
      return;
    }

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        navigation.navigate('Analysis', {
          imageUri: result.assets[0].uri,
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFromGallery = async () => {
    setModalVisible(false);
    
    // Check scan limit before proceeding
    if (!canScan) {
      navigation.navigate('Paywall', { context: 'scanLimit' });
      return;
    }

    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        navigation.navigate('Analysis', {
          imageUri: result.assets[0].uri,
        });
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const OptionCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    onPress: () => void;
  }> = ({ icon, title, description, onPress }) => (
    <TouchableOpacity
      style={styles.optionCardWrapper}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <GlassCard style={styles.optionCard} intensity={70}>
        <View style={[styles.iconContainer, { backgroundColor: colors.container }]}>
          {icon}
        </View>
        <Text style={[styles.optionTitle, { color: colors.primaryText }]}>{title}</Text>
        <Text style={[styles.optionDescription, { color: colors.secondaryText }]}>
          {description}
        </Text>
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.container }]}>
      <PageTransition type="fade" duration={300}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section with Glass Effect */}
          <GlassCard style={styles.headerGlass} intensity={60}>
            <View style={styles.header}>
              <View style={[styles.headerIcon, { backgroundColor: Colors.brand.blue + '20' }]}>
                <Utensils size={48} color={Colors.brand.blue} />
              </View>
              <Text style={[styles.title, { color: colors.primaryText }]}>
                Scan a Menu
              </Text>
              <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
                Take a photo or select from your gallery to analyze menu items based on your dietary preferences
              </Text>
            </View>
          </GlassCard>

          {/* Scan Limit Info */}
          {!isPremiumUser && (
            <GlassCard style={styles.limitCard} intensity={50}>
              <Text style={[styles.limitText, { color: colors.secondaryText }]}>
                {remainingScans > 0 
                  ? `${remainingScans} free scan${remainingScans === 1 ? '' : 's'} remaining`
                  : 'No free scans remaining'}
              </Text>
            </GlassCard>
          )}

          {/* Scan Button */}
          <Button
            title={canScan ? "Start Scanning" : "Upgrade to Scan"}
            onPress={() => {
              if (canScan) {
                setModalVisible(true);
              } else {
                navigation.navigate('Paywall', { context: 'scanLimit' });
              }
            }}
            icon={<Camera size={20} color={Colors.white} />}
            fullWidth
            style={styles.scanButton}
          />

          {/* Tips Section with Glass Effect */}
          <GlassCard style={styles.tipsCard} intensity={50}>
            <Text style={[styles.tipsTitle, { color: colors.primaryText }]}>
              Tips for Best Results
            </Text>
            <View style={styles.tipRow}>
              <CheckCircle size={16} color={Colors.brand.green} />
              <Text style={[styles.tipText, { color: colors.secondaryText }]}>
                Ensure good lighting for clear text
              </Text>
            </View>
            <View style={styles.tipRow}>
              <CheckCircle size={16} color={Colors.brand.green} />
              <Text style={[styles.tipText, { color: colors.secondaryText }]}>
                Capture the entire menu section
              </Text>
            </View>
            <View style={styles.tipRow}>
              <CheckCircle size={16} color={Colors.brand.green} />
              <Text style={[styles.tipText, { color: colors.secondaryText }]}>
                Avoid blurry or angled photos
              </Text>
            </View>
          </GlassCard>

          {/* Recent Scans */}
          <View style={styles.recentSection}>
            <Text style={[styles.recentTitle, { color: colors.primaryText }]}>
              Recent Scans
            </Text>
            {loadingRecent ? (
              <View>
                <SkeletonHistoryItem />
                <SkeletonHistoryItem />
                <SkeletonHistoryItem />
              </View>
            ) : recentScans.length === 0 ? (
              <EmptyState
                icon="clock"
                iconSet="Feather"
                title="No Recent Scans"
                description="Your recent scans will appear here after you analyze menus"
              />
            ) : (
              <View style={styles.recentList}>
                {recentScans.map((scan, index) => {
                  const scanDate = scan.scanDate?.toDate ? scan.scanDate.toDate() : new Date();
                  const compliant = scan.items.filter(i => i.classification === 'compliant').length;
                  const modifiable = scan.items.filter(i => i.classification === 'modifiable').length;
                  const nonCompliant = scan.items.filter(i => i.classification === 'non_compliant').length;

                  return (
                    <RevealAnimation key={scan.id} direction="bottom" delay={index * 100}>
                      <Card 
                      key={scan.id} 
                      style={styles.recentCard}
                      variant="elevated"
                      pressable
                      onPress={() => {
                        // Navigate to analysis result screen
                        navigation.navigate('AnalysisResult', { scanId: scan.id });
                      }}
                    >
                      <View style={styles.recentCardContent}>
                        <Text style={[styles.recentDate, { color: colors.secondaryText }]}>
                          {format(scanDate, 'MMM d, yyyy • h:mm a')}
                        </Text>
                        <View style={styles.recentStats}>
                          <View style={styles.statBadge}>
                            <CheckCircle size={14} color={Colors.semantic.compliant} />
                            <Text style={[styles.statCount, { color: Colors.semantic.compliant }]}>
                              {compliant}
                            </Text>
                          </View>
                          <View style={styles.statBadge}>
                            <Info size={14} color={Colors.semantic.modifiable} />
                            <Text style={[styles.statCount, { color: Colors.semantic.modifiable }]}>
                              {modifiable}
                            </Text>
                          </View>
                          <View style={styles.statBadge}>
                            <XCircle size={14} color={Colors.semantic.nonCompliant} />
                            <Text style={[styles.statCount, { color: Colors.semantic.nonCompliant}]}>
                              {nonCompliant}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </Card>
                    </RevealAnimation>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      </PageTransition>

      {/* Selection Modal with Glass Effect */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <GlassModal visible={modalVisible}>
          <GlassCard style={styles.modalContent} intensity={90}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderSpacer} />
              <Text style={[styles.modalTitle, { color: colors.primaryText }]}>
                Choose Image Source
              </Text>
              <TouchableOpacity 
                style={styles.modalHeaderSpacer}
                onPress={() => setModalVisible(false)}
              >
                <X size={24} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>

            <View style={styles.optionsContainer}>
              <OptionCard
                icon={<Camera size={32} color={Colors.brand.blue} />}
                title="Take Photo"
                description="Use your camera to capture a menu"
                onPress={handleTakePhoto}
              />
              <OptionCard
                icon={<ImageIcon size={32} color={Colors.brand.green} />}
                title="Choose from Gallery"
                description="Select an existing menu photo"
                onPress={handleSelectFromGallery}
              />
            </View>

            <Button
              title="Cancel"
              variant="ghost"
              onPress={() => setModalVisible(false)}
              fullWidth
              style={styles.cancelButton}
            />
          </GlassCard>
        </GlassModal>
      </Modal>

      {/* Custom Loading with Glass Effect */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <GlassCard style={styles.loadingCard} intensity={95}>
            <PulseLoader size={80} color={Colors.brand.blue} />
            <Text style={[styles.loadingText, { color: colors.primaryText }]}>Processing...</Text>
          </GlassCard>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl * 2,
  },
  headerGlass: {
    marginBottom: Spacing.xl,
    marginTop: Spacing.lg,
  },
  header: {
    alignItems: 'center',
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h3,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  limitCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  limitText: {
    ...Typography.bodySmall,
    textAlign: 'center',
  },
  scanButton: {
    marginBottom: Spacing.xl,
  },
  tipsCard: {
    marginBottom: Spacing.xl,
  },
  tipsTitle: {
    ...Typography.h5,
    marginBottom: Spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  tipText: {
    ...Typography.bodySmall,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  recentSection: {
    flex: 1,
  },
  recentTitle: {
    ...Typography.h5,
    marginBottom: Spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
  },
  emptyText: {
    ...Typography.body,
    marginTop: Spacing.sm,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    minWidth: 200,
  },
  loadingText: {
    ...Typography.bodyMedium,
    marginTop: Spacing.md,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalHeaderSpacer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    ...Typography.h4,
    textAlign: 'center',
    flex: 1,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
    alignItems: 'stretch',
  },
  optionCardWrapper: {
    flex: 1,
  },
  optionCard: {
    padding: Spacing.md,
    alignItems: 'center',
    minHeight: 195,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  optionTitle: {
    ...Typography.bodyMedium,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  optionDescription: {
    ...Typography.caption,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: Spacing.sm,
  },
  recentList: {
    flex: 1,
  },
  recentCard: {
    marginBottom: Spacing.sm,
  },
  recentCardContent: {
    padding: 0,
  },
  recentDate: {
    ...Typography.caption,
    marginBottom: Spacing.xs,
  },
  recentStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statCount: {
    ...Typography.bodySmall,
    fontWeight: '600' as '600',
  },
});
