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
import { Camera, CheckCircle, Info, XCircle, History as HistoryIcon, X } from '../components/icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format } from 'date-fns';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../theme/styles';
import { Button, Card, LoadingOverlay } from '../components';
import { ScanStackParamList } from '../navigation/types';
import historyService, { ScanHistory } from '../services/historyService';

type NavigationProp = StackNavigationProp<ScanStackParamList, 'ScanOptions'>;

export const ScanOptionsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentScans, setRecentScans] = useState<ScanHistory[]>([]);

  useEffect(() => {
    loadRecentScans();
  }, []);

  const loadRecentScans = async () => {
    try {
      const scans = await historyService.getScanHistory();
      setRecentScans(scans.slice(0, 3)); // Show only 3 most recent scans
    } catch (error) {
      console.error('Error loading recent scans:', error);
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
      style={[styles.optionCard, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
        {icon}
      </View>
      <Text style={[styles.optionTitle, { color: colors.primaryText }]}>{title}</Text>
      <Text style={[styles.optionDescription, { color: colors.secondaryText }]}>
        {description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: Colors.brand.blue + '20' }]}>
            <Camera size={48} color={Colors.brand.blue} />
          </View>
          <Text style={[styles.title, { color: colors.primaryText }]}>
            Scan a Menu
          </Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Take a photo or select from your gallery to analyze menu items based on your dietary preferences
          </Text>
        </View>

        {/* Scan Button */}
        <Button
          title="Start Scanning"
          onPress={() => setModalVisible(true)}
          icon={<Camera size={20} color={Colors.white} />}
          fullWidth
          style={styles.scanButton}
        />

        {/* Tips Section */}
        <Card style={styles.tipsCard}>
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
        </Card>

        {/* Recent Scans */}
        <View style={styles.recentSection}>
          <Text style={[styles.recentTitle, { color: colors.primaryText }]}>
            Recent Scans
          </Text>
          {recentScans.length === 0 ? (
            <View style={[styles.emptyState, { borderColor: colors.border }]}>
              <HistoryIcon size={32} color={colors.secondaryText} />
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                No recent scans yet
              </Text>
            </View>
          ) : (
            <View style={styles.recentList}>
              {recentScans.map((scan) => {
                const scanDate = scan.scanDate?.toDate ? scan.scanDate.toDate() : new Date();
                const compliant = scan.items.filter(i => i.classification === 'compliant').length;
                const modifiable = scan.items.filter(i => i.classification === 'modifiable').length;
                const nonCompliant = scan.items.filter(i => i.classification === 'non_compliant').length;

                return (
                  <Card key={scan.id} style={styles.recentCard}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        Alert.alert(
                          'Scan Details',
                          `${scan.items.length} items analyzed\n${compliant} compliant, ${modifiable} modifiable, ${nonCompliant} non-compliant`
                        );
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
                    </TouchableOpacity>
                  </Card>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.primaryText }]}>
                Choose Image Source
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
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
                icon={<Camera size={32} color={Colors.brand.green} />}
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
          </View>
        </View>
      </Modal>

      <LoadingOverlay visible={isLoading} message="Processing..." />
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
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.lg,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    ...Typography.h4,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  optionCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
    ...Shadows.sm,
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