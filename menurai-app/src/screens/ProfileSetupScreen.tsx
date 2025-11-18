import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Info } from '../components/icons';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { Typography, Spacing, BorderRadius } from '../theme/styles';
import { Button, Chip, LoadingOverlay, Card } from '../components';
import { useUserProfile } from '../hooks/useUserProfile';
import userService, { DIETARY_PRESETS } from '../services/userService';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

type ProfileSetupScreenRouteProp = RouteProp<RootStackParamList, 'ProfileSetup'>;
type ProfileSetupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProfileSetup'>;

export const ProfileSetupScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<ProfileSetupScreenNavigationProp>();
  const route = useRoute<ProfileSetupScreenRouteProp>();
  const isEditMode = route.params?.isEditMode || false;
  const {
    profiles,
    currentProfile,
    updateDietaryPreferences,
    createProfile,
    renameProfile,
    deleteProfile,
    loading,
  } = useUserProfile();

  const isCreateMode = route.params?.mode === 'create';

  const targetProfile = useMemo(() => {
    if (isCreateMode) return null;
    if (route.params?.profileId) {
      return profiles.find((p) => p.id === route.params.profileId) || null;
    }
    return currentProfile;
  }, [profiles, currentProfile, route.params?.profileId, isCreateMode]);

  const [profileName, setProfileName] = useState(route.params?.profileName || targetProfile?.name || '');
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [customRestriction, setCustomRestriction] = useState('');
  const [customRestrictions, setCustomRestrictions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { canEdit, daysRemaining, isFreeEdit: profileFreeEdit } = useMemo(() => {
    if (isCreateMode) {
      return { canEdit: true, daysRemaining: 0, isFreeEdit: false };
    }
    return userService.canEditDietaryPresets(targetProfile ?? null);
  }, [targetProfile, isCreateMode, route.params?.profileName]);

  useEffect(() => {
    if (isCreateMode) {
      setProfileName(route.params?.profileName || '');
      setSelectedPresets([]);
      setCustomRestrictions([]);
      return;
    }
    if (targetProfile) {
      setProfileName(targetProfile.name);
      setSelectedPresets(targetProfile.dietaryPresets || []);
      setCustomRestrictions(targetProfile.customRestrictions || []);
    }
  }, [targetProfile, isCreateMode]);

  const togglePreset = (preset: string) => {
    if (!canEdit && isEditMode && !isCreateMode) {
      const message = profileFreeEdit
        ? 'This is your free edit. After this, dietary preferences will be locked for 30 days.'
        : `You can edit your dietary preferences in ${daysRemaining} days.`;

      if (!profileFreeEdit) {
        Alert.alert(
          'Edit Locked',
          message,
          [{ text: 'OK' }]
        );
        return;
      }
    }

    setSelectedPresets((prev) =>
      prev.includes(preset)
        ? prev.filter((p) => p !== preset)
        : [...prev, preset]
    );
  };

  const addCustomRestriction = () => {
    const trimmed = customRestriction.trim();
    if (trimmed && !customRestrictions.includes(trimmed)) {
      setCustomRestrictions([...customRestrictions, trimmed]);
      setCustomRestriction('');
    }
  };

  const removeCustomRestriction = (restriction: string) => {
    setCustomRestrictions((prev) => prev.filter((r) => r !== restriction));
  };

  const handleSave = async () => {
    if (!profileName.trim()) {
      Alert.alert('Name Required', 'Please enter a name for this profile.', [{ text: 'OK' }]);
      return;
    }
    if (selectedPresets.length === 0 && customRestrictions.length === 0) {
      Alert.alert(
        'Profile Incomplete',
        'Please select at least one dietary preference or add a custom restriction.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!isCreateMode && !targetProfile) {
      Alert.alert('Profile unavailable', 'Please wait for the profile to finish loading.');
      return;
    }

    setIsSaving(true);
    try {
      if (isCreateMode) {
        await createProfile({
          name: profileName.trim(),
          dietaryPresets: selectedPresets,
          customRestrictions,
        });
        navigation.goBack();
      } else {
        if (targetProfile) {
          if (profileName.trim() !== targetProfile.name) {
            await renameProfile(targetProfile.id, profileName.trim());
          }
          await updateDietaryPreferences(selectedPresets, customRestrictions, targetProfile.id);
        }

        if (isEditMode) {
          navigation.goBack();
        } else {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            })
          );
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save preferences', [
        { text: 'OK' },
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteProfile = () => {
    if (!targetProfile) return;
    Alert.alert(
      'Delete Profile',
      `Are you sure you want to delete ${targetProfile.name}? This will remove all associated history.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSaving(true);
              await deleteProfile(targetProfile.id);
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to delete profile.');
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  const canSave = () => {
    if (isCreateMode) {
      return profileName.trim().length > 0;
    }

    if (!isEditMode) return true;

    const nameChanged = profileName.trim() !== (targetProfile?.name || '').trim();
    const restrictionsChanged =
      JSON.stringify(customRestrictions.sort()) !== JSON.stringify(targetProfile?.customRestrictions?.sort());
    const presetsChanged =
      JSON.stringify(selectedPresets.sort()) !== JSON.stringify(targetProfile?.dietaryPresets?.sort());

    if (!canEdit && (presetsChanged || restrictionsChanged) && !nameChanged) {
      return false;
    }

    return nameChanged || restrictionsChanged || presetsChanged;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.container }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        enabled={Platform.OS !== 'web'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Description */}
          {!isEditMode && (
            <View style={styles.descriptionContainer}>
              <Text style={[styles.description, { color: colors.secondaryText }]}>
                Help us understand your dietary needs for personalized menu analysis
              </Text>
            </View>
          )}

          {/* Free Edit Notice */}
          {isEditMode && profileFreeEdit && !isCreateMode && (
            <View style={[styles.freeEditNotice, { backgroundColor: Colors.brand.primary + '20' }]}>
              <Info size={16} color={Colors.brand.primary} />
              <Text style={[styles.freeEditText, { color: Colors.brand.primary }]}>
                You're using your one-time free edit. After this, changes will be locked for 30 days.
              </Text>
            </View>
          )}

          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Profile Name</Text>
            <TextInput
              style={[
                styles.nameInput,
                {
                  color: colors.primaryText,
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
              placeholder="e.g., My Gluten Free Plan"
              placeholderTextColor={colors.secondaryText}
              value={profileName}
              onChangeText={setProfileName}
            />
          </Card>

          {/* Dietary Presets */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
                Dietary Preferences
              </Text>
              {isEditMode && !canEdit && !isCreateMode && (
                <Text style={[styles.lockText, { color: Colors.light.warning }]}>
                  Locked for {daysRemaining} days
                </Text>
              )}
            </View>
            <View style={styles.chipsContainer}>
              {DIETARY_PRESETS.map((preset) => (
                <Chip
                  key={preset}
                  label={preset}
                  selected={selectedPresets.includes(preset)}
                  onPress={() => togglePreset(preset)}
                  disabled={isEditMode && !canEdit && !isCreateMode}
                />
              ))}
            </View>
          </Card>

          {/* Custom Restrictions */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
              Allergies & Restrictions
            </Text>
            <Text style={[styles.sectionDescription, { color: colors.secondaryText }]}>
              Add specific ingredients or dishes to avoid
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.primaryText,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="e.g., shellfish, tree nuts, soy..."
                placeholderTextColor={colors.secondaryText}
                value={customRestriction}
                onChangeText={setCustomRestriction}
                onSubmitEditing={addCustomRestriction}
                returnKeyType="done"
              />
              <Button
                title="Add"
                size="small"
                onPress={addCustomRestriction}
                disabled={!customRestriction.trim()}
              />
            </View>

            {customRestrictions.length > 0 && (
              <View style={styles.restrictionsContainer}>
                {customRestrictions.map((restriction) => (
                  <Chip
                    key={restriction}
                    label={restriction}
                    selected={true}
                    variant="input"
                    closeable
                    onPress={() => removeCustomRestriction(restriction)}
                  />
                ))}
              </View>
            )}
          </Card>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              title={isEditMode ? 'Save Changes' : 'Complete Setup'}
              onPress={handleSave}
              disabled={!canSave()}
              fullWidth
              loading={isSaving}
            />
            {isEditMode && (
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => navigation.goBack()}
                fullWidth
                style={styles.cancelButton}
              />
            )}
            {isEditMode && !isCreateMode && targetProfile && !targetProfile.isPrimary && (
              <Button
                title="Delete Profile"
                variant="ghost"
                onPress={confirmDeleteProfile}
                fullWidth
                style={styles.cancelButton}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={loading || (!targetProfile && !isCreateMode)} message="Loading profile..." />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2, // Extra padding for bottom actions to ensure cancel button is visible
  },
  descriptionContainer: {
    marginBottom: Spacing.lg,
  },
  description: {
    ...Typography.body,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h5,
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    ...Typography.bodySmall,
    marginBottom: Spacing.md,
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Typography.body,
  },
  lockText: {
    ...Typography.caption,
    fontWeight: '600' as '600',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    ...Typography.body,
  },
  restrictionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actions: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  cancelButton: {
    marginTop: Spacing.sm,
  },
  freeEditNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  freeEditText: {
    ...Typography.bodySmall,
    marginLeft: Spacing.sm,
    flex: 1,
  },
});