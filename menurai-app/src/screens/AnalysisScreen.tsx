import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
  Animated,
} from 'react-native';
import { Utensils, CheckCircle, Info, XCircle, AlertCircle, Camera } from '../components/icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { Typography, Spacing, BorderRadius } from '../theme/styles';
import { Button, Card, LoadingOverlay, SkeletonMenuItem, PageTransition, PulseLoader, GlassCard, SuccessCheckmark, HeroTransition, PressableWithFeedback } from '../components';
import { ScanStackParamList } from '../navigation/types';
import menuAnalysisService, { MenuItem, AnalysisResult } from '../services/menuAnalysisService';
import historyService from '../services/historyService';

type AnalysisScreenRouteProp = RouteProp<ScanStackParamList, 'Analysis'>;

// Animated loading text component
const LoadingText: React.FC = () => {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [textIndex, setTextIndex] = useState(0);

  const loadingTexts = [
    'Analyzing menu...',
    'Reading text from image...',
    'Checking dietary preferences...',
    'Identifying ingredients...',
    'Almost done...',
  ];

  useEffect(() => {
    // Fade in and out animation
    const fadeIn = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    });

    const fadeOut = Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    });

    const sequence = Animated.sequence([fadeIn, fadeOut]);

    sequence.start(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    });

    return () => {
      fadeAnim.setValue(0);
    };
  }, [textIndex, fadeAnim]);

  return (
    <Animated.Text
      style={[
        styles.loadingText,
        { color: colors.secondaryText, opacity: fadeAnim },
      ]}
    >
      {loadingTexts[textIndex]}
    </Animated.Text>
  );
};

// Menu item result card
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
        return 'check-circle';
      case 'modifiable':
        return 'info';
      case 'non_compliant':
        return 'cancel';
      default:
        return 'help';
    }
  };

  const getClassificationText = () => {
    switch (item.classification) {
      case 'compliant':
        return 'Safe to eat';
      case 'modifiable':
        return 'Can be modified';
      case 'non_compliant':
        return 'Contains restrictions';
      default:
        return 'Unknown';
    }
  };

      const IconComponent = () => {
        switch (item.classification) {
          case 'compliant':
            return <CheckCircle size={24} color={getClassificationColor()} />;
          case 'modifiable':
            return <Info size={24} color={getClassificationColor()} />;
          case 'non_compliant':
            return <XCircle size={24} color={getClassificationColor()} />;
          default:
            return <AlertCircle size={24} color={getClassificationColor()} />;
        }
      };

      return (
        <Card 
          variant="elevated" 
          style={[styles.itemCard, { borderColor: getClassificationColor() }]}
          pressable
        >
          <View style={styles.itemHeader}>
            <IconComponent />
        <Text style={[styles.itemName, { color: colors.primaryText }]}>
          {item.name}
        </Text>
      </View>
      <Text style={[styles.classificationText, { color: getClassificationColor() }]}>
        {getClassificationText()}
      </Text>
      {item.reason && (
        <Text style={[styles.reasonText, { color: colors.secondaryText }]}>
          {item.reason}
        </Text>
      )}
    </Card>
  );
};

export const AnalysisScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<AnalysisScreenRouteProp>();
  const { imageUri } = route.params;

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (imageUri) {
      startAnalysis();
    }
  }, [imageUri]);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await menuAnalysisService.processMenuImage(imageUri);
      setAnalysisResult(result);
      
      // Show success animation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      // Save to history
      try {
        await historyService.saveScan(result);
        console.log('Scan saved to history');
      } catch (historyError) {
        console.error('Failed to save to history:', historyError);
        // Don't fail the analysis if history save fails
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze menu');
      Alert.alert(
        'Analysis Failed',
        err.message || 'Failed to analyze menu. Please try again.',
        [
          { text: 'Try Again', onPress: startAnalysis },
          { text: 'Go Back', onPress: () => navigation.goBack() },
        ]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCategorizedItems = () => {
    if (!analysisResult?.items) return { compliant: [], modifiable: [], nonCompliant: [] };

    const compliant = analysisResult.items.filter(item => item.classification === 'compliant');
    const modifiable = analysisResult.items.filter(item => item.classification === 'modifiable');
    const nonCompliant = analysisResult.items.filter(item => item.classification === 'non_compliant');

    return { compliant, modifiable, nonCompliant };
  };

  if (isAnalyzing) {
    return (
      <PageTransition type="zoomIn" duration={400}>
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.resultImage} resizeMode="cover" />
          </View>
          <View style={styles.loadingContainer}>
            <View style={styles.loadingContent}>
              <Utensils size={48} color={Colors.brand.blue} />
              <LoadingText />
              <Text style={[styles.loadingHint, { color: colors.secondaryText }]}>
                This may take up to 30 seconds
              </Text>
            </View>
          </View>
          <View style={styles.skeletonSection}>
            <SkeletonMenuItem />
            <SkeletonMenuItem />
            <SkeletonMenuItem />
            <SkeletonMenuItem />
          </View>
        </ScrollView>
      </SafeAreaView>
      </PageTransition>
    );
  }

  const { compliant, modifiable, nonCompliant } = getCategorizedItems();

  return (
    <PageTransition type="slideUp" duration={400}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Image Preview */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.resultImage} resizeMode="cover" />
        </View>

        {/* Results Summary */}
        {analysisResult && (
          <>
            <View style={styles.summaryContainer}>
              <Text style={[styles.summaryTitle, { color: colors.primaryText }]}>
                Analysis Complete
              </Text>
              <Text style={[styles.summarySubtitle, { color: colors.secondaryText }]}>
                Found {analysisResult.items.length} menu items
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
          </>
        )}

        {/* Error State */}
        {error && !analysisResult && (
          <Card style={styles.errorCard}>
            <AlertCircle size={48} color={Colors.semantic.nonCompliant} />
            <Text style={[styles.errorTitle, { color: colors.primaryText }]}>Analysis Failed</Text>
            <Text style={[styles.errorMessage, { color: colors.secondaryText }]}>{error}</Text>
            <Button title="Try Again" onPress={startAnalysis} style={styles.retryButton} />
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Scan Another Menu"
            variant="primary"
            icon={<Camera size={20} color={Colors.white} />}
            onPress={() => navigation.goBack()}
            fullWidth
            style={styles.actionButton}
          />
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  skeletonSection: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    marginTop: Spacing.lg,
    minHeight: 24,
  },
  loadingHint: {
    ...Typography.caption,
    marginTop: Spacing.sm,
  },
  imageContainer: {
    height: 250,
    marginBottom: Spacing.lg,
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  summaryContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  summaryTitle: {
    ...Typography.h3,
    marginBottom: Spacing.xs,
  },
  summarySubtitle: {
    ...Typography.body,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
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
    fontWeight: '700' as '700',
  },
  statLabel: {
    ...Typography.caption,
  },
  categorySection: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  categoryTitle: {
    ...Typography.h5,
    fontWeight: '600' as '600',
    marginBottom: Spacing.md,
  },
  itemCard: {
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  itemName: {
    ...Typography.bodyMedium,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  classificationText: {
    ...Typography.bodySmall,
    fontWeight: '600' as '600',
    marginBottom: Spacing.xs,
  },
  reasonText: {
    ...Typography.caption,
    fontStyle: 'italic' as 'italic',
  },
  errorCard: {
    margin: Spacing.lg,
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorTitle: {
    ...Typography.h4,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryButton: {
    minWidth: 120,
  },
  actionButtons: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  actionButton: {
    marginBottom: Spacing.sm,
  },
});