import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Utensils, CheckCircle, Info, XCircle, AlertCircle } from '../components/icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { Typography, Spacing, BorderRadius } from '../theme/styles';
import { Card, PageTransition, HeroTransition } from '../components';
import { ScanStackParamList } from '../navigation/types';
import historyService, { ScanHistory } from '../services/historyService';
import { MenuItem } from '../services/menuAnalysisService';

type AnalysisResultScreenRouteProp = RouteProp<ScanStackParamList, 'AnalysisResult'>;

// Menu item result card (reused from AnalysisScreen)
const MenuItemCard: React.FC<{ item: MenuItem }> = ({ item }) => {
  const { colors } = useTheme();

  const getClassificationColor = () => {
    switch (item.classification) {
      case 'compliant':
        return Colors.semantic.compliant;
      case 'modifiable':
        return Colors.semantic.modifiable;
      case 'non_compliant':
        return Colors.semantic.nonCompliant;
      default:
        return colors.secondaryText;
    }
  };

  const getClassificationIcon = () => {
    switch (item.classification) {
      case 'compliant':
        return <CheckCircle size={20} color={Colors.semantic.compliant} />;
      case 'modifiable':
        return <Info size={20} color={Colors.semantic.modifiable} />;
      case 'non_compliant':
        return <XCircle size={20} color={Colors.semantic.nonCompliant} />;
      default:
        return null;
    }
  };

  const getClassificationLabel = () => {
    switch (item.classification) {
      case 'compliant':
        return 'Safe to Eat';
      case 'modifiable':
        return 'Can Be Modified';
      case 'non_compliant':
        return 'Contains Restrictions';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card style={styles.menuItemCard} variant="elevated">
      <View style={styles.menuItemHeader}>
        <View style={styles.menuItemTitleRow}>
          {getClassificationIcon()}
          <Text style={[styles.menuItemName, { color: colors.primaryText }]}>
            {item.name}
          </Text>
        </View>
        <View
          style={[
            styles.classificationBadge,
            { backgroundColor: getClassificationColor() + '20' },
          ]}
        >
          <Text style={[styles.classificationText, { color: getClassificationColor() }]}>
            {getClassificationLabel()}
          </Text>
        </View>
      </View>
      <Text style={[styles.menuItemReason, { color: colors.secondaryText }]}>
        {item.reason}
      </Text>
    </Card>
  );
};

export const AnalysisResultScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<AnalysisResultScreenRouteProp>();
  const { scanId } = route.params;

  const [scan, setScan] = useState<ScanHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadScan();
  }, [scanId]);

  const loadScan = async () => {
    try {
      setLoading(true);
      setError(null);
      const scanData = await historyService.getScanById(scanId);
      if (scanData) {
        setScan(scanData);
      } else {
        setError('Scan not found');
      }
    } catch (err: any) {
      console.error('Error loading scan:', err);
      setError(err.message || 'Failed to load scan');
    } finally {
      setLoading(false);
    }
  };

  const getCategorizedItems = () => {
    if (!scan?.items) return { compliant: [], modifiable: [], nonCompliant: [] };

    const compliant = scan.items.filter(item => item.classification === 'compliant');
    const modifiable = scan.items.filter(item => item.classification === 'modifiable');
    const nonCompliant = scan.items.filter(item => item.classification === 'non_compliant');

    return { compliant, modifiable, nonCompliant };
  };

  if (loading) {
    return (
      <PageTransition type="zoomIn" duration={400}>
        <SafeAreaView style={[styles.container, { backgroundColor: colors.container }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.brand.blue} />
            <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
              Loading scan details...
            </Text>
          </View>
        </SafeAreaView>
      </PageTransition>
    );
  }

  if (error || !scan) {
    return (
      <PageTransition type="zoomIn" duration={400}>
        <SafeAreaView style={[styles.container, { backgroundColor: colors.container }]}>
          <View style={styles.errorContainer}>
            <AlertCircle size={48} color={Colors.semantic.nonCompliant} />
            <Text style={[styles.errorTitle, { color: colors.primaryText }]}>
              {error || 'Scan not found'}
            </Text>
            <Text style={[styles.errorMessage, { color: colors.secondaryText }]}>
              The scan you're looking for doesn't exist or has been deleted.
            </Text>
          </View>
        </SafeAreaView>
      </PageTransition>
    );
  }

  const { compliant, modifiable, nonCompliant } = getCategorizedItems();
  const scanDate = scan.scanDate?.toDate ? scan.scanDate.toDate() : new Date();

  return (
    <PageTransition type="slideUp" duration={400}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.container }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Image Preview */}
          {scan.imageUrl && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: scan.imageUrl }} style={styles.resultImage} resizeMode="cover" />
            </View>
          )}

          {/* Scan Info */}
          <View style={styles.infoContainer}>
            {scan.restaurantName && (
              <Text style={[styles.restaurantName, { color: colors.primaryText }]}>
                {scan.restaurantName}
              </Text>
            )}
            <Text style={[styles.scanDate, { color: colors.secondaryText }]}>
              {scanDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </View>

          {/* Results Summary */}
          <View style={styles.summaryContainer}>
            <Text style={[styles.summaryTitle, { color: colors.primaryText }]}>
              Analysis Results
            </Text>
            <Text style={[styles.summarySubtitle, { color: colors.secondaryText }]}>
              Found {scan.items.length} menu items
            </Text>

            {/* Statistics */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: Colors.semantic.compliant + '20' }]}>
                  <CheckCircle size={24} color={Colors.semantic.compliant} />
                </View>
                <Text style={[styles.statCount, { color: colors.primaryText }]}>{compliant.length}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Safe</Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: Colors.semantic.modifiable + '20' }]}>
                  <Info size={24} color={Colors.semantic.modifiable} />
                </View>
                <Text style={[styles.statCount, { color: colors.primaryText }]}>{modifiable.length}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Modifiable</Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: Colors.semantic.nonCompliant + '20' }]}>
                  <XCircle size={24} color={Colors.semantic.nonCompliant} />
                </View>
                <Text style={[styles.statCount, { color: colors.primaryText }]}>{nonCompliant.length}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Restricted</Text>
              </View>
            </View>
          </View>

          {/* Menu Items by Category */}
          {compliant.length > 0 && (
            <View style={styles.categorySection}>
              <Text style={[styles.categoryTitle, { color: Colors.semantic.compliant }]}>
                Safe to Eat
              </Text>
              {compliant.map((item, index) => (
                <HeroTransition key={`compliant-${index}`} delay={index * 80} duration={500}>
                  <MenuItemCard item={item} />
                </HeroTransition>
              ))}
            </View>
          )}

          {modifiable.length > 0 && (
            <View style={styles.categorySection}>
              <Text style={[styles.categoryTitle, { color: Colors.semantic.modifiable }]}>
                Can Be Modified
              </Text>
              {modifiable.map((item, index) => (
                <MenuItemCard key={`modifiable-${index}`} item={item} />
              ))}
            </View>
          )}

          {nonCompliant.length > 0 && (
            <View style={styles.categorySection}>
              <Text style={[styles.categoryTitle, { color: Colors.semantic.nonCompliant }]}>
                Contains Restrictions
              </Text>
              {nonCompliant.map((item, index) => (
                <MenuItemCard key={`non-compliant-${index}`} item={item} />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </PageTransition>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    ...Typography.body,
    marginTop: Spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorTitle: {
    ...Typography.h4,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    ...Typography.body,
    textAlign: 'center',
  },
  imageContainer: {
    height: 250,
    marginBottom: Spacing.lg,
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  restaurantName: {
    ...Typography.h3,
    marginBottom: Spacing.xs,
  },
  scanDate: {
    ...Typography.body,
  },
  summaryContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  summaryTitle: {
    ...Typography.h3,
    marginBottom: Spacing.xs,
  },
  summarySubtitle: {
    ...Typography.body,
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statCount: {
    ...Typography.h4,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
  },
  categorySection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  categoryTitle: {
    ...Typography.h4,
    marginBottom: Spacing.md,
    fontWeight: '600' as '600',
  },
  menuItemCard: {
    marginBottom: Spacing.sm,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  menuItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  menuItemName: {
    ...Typography.bodyMedium,
    marginLeft: Spacing.xs,
    flex: 1,
  },
  classificationBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  classificationText: {
    ...Typography.caption,
    fontWeight: '600' as '600',
  },
  menuItemReason: {
    ...Typography.bodySmall,
    marginTop: Spacing.xs,
  },
});

