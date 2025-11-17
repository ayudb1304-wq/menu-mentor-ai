import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../hooks/useAuth';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

type ProfileSetupScreenRouteProp = RouteProp<RootStackParamList, 'ProfileSetup'>;
type ProfileSetupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProfileSetup'>;

export const ProfileSetupScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<ProfileSetupScreenNavigationProp>();
  const route = useRoute<ProfileSetupScreenRouteProp>();
  const { user } = useAuth();
  const isEditMode = route.params?.isEditMode || false;
  const isNewProfile = route.params?.isNewProfile || false;
  const routeProfileId = route.params?.profileId;
  const {
    activeProfile,
    allProfiles,
    canEditDietaryPresets,
    daysRemainingForEdit,
    isFreeEdit,
    updateDietaryPreferences,
    loading,
  } = useUserProfile();
  const targetProfile = routeProfileId
    ? allProfiles.find((profileOption) => profileOption.id === routeProfileId)
    : activeProfile;
  const isCreatingProfile = isNewProfile || !targetProfile;

  const [profileName, setProfileName] = useState('');
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [customRestriction, setCustomRestriction] = useState('');
  const [customRestrictions, setCustomRestrictions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with existing profile data in edit mode
  useEffect(() => {
    if (targetProfile) {
      setProfileName(targetProfile.name);
      setSelectedPresets(targetProfile.dietaryPresets || []);
      setCustomRestrictions(targetProfile.customRestrictions || []);
    } else {
      setProfileName('');
      setSelectedPresets([]);
      setCustomRestrictions([]);
    }
  }, [targetProfile]);

  const togglePreset = (preset: string) => {
    const editingExistingProfile = !isCreatingProfile && isEditMode;
    if (editingExistingProfile && !canEditDietaryPresets) {
      const message = isFreeEdit
        ? 'This is your free edit. After this, dietary preferences will be locked for 30 days.'
        : `You can edit your dietary preferences in ${daysRemainingForEdit} days.`;

      if (!isFreeEdit) {
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
    if (selectedPresets.length === 0 && customRestrictions.length === 0) {
      Alert.alert(
        'Profile Incomplete',
        'Please select at least one dietary preference or add a custom restriction.',
        [{ text: 'OK' }]
      );
      return;
    }

    const trimmedName = profileName.trim();
    if (!trimmedName) {
      Alert.alert('Profile Name Required', 'Please enter a profile name to continue.', [{ text: 'OK' }]);
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not authenticated', [{ text: 'OK' }]);
      return;
    }

    setIsSaving(true);
    try {
      let profileId = targetProfile?.id ?? null;

      if (!profileId) {
        profileId = await userService.createProfile(user.uid, trimmedName);
      }

      await updateDietaryPreferences(selectedPresets, customRestrictions, {
        profileId,
        name: trimmedName,
      });

      if (isEditMode || routeProfileId) {
        navigation.goBack();
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          })
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save preferences', [{ text: 'OK' }]);
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = () => {
    if (isCreatingProfile) {
      return profileName.trim().length > 0;
    }

    if (!targetProfile) {
      return false;
    }

    const presetsChanged =
      JSON.stringify([...selectedPresets].sort()) !==
      JSON.stringify([...(targetProfile.dietaryPresets || [])].sort());
    const restrictionsChanged =
      JSON.stringify([...customRestrictions].sort()) !==
      JSON.stringify([...(targetProfile.customRestrictions || [])].sort());
    const nameChanged = profileName.trim() !== targetProfile.name;

    if (!canEditDietaryPresets && presetsChanged) {
      return false;
    }

    return presetsChanged || restrictionsChanged || nameChanged;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.container }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' && Platform.OS !== 'web' ? 'padding' : undefined}
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

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
            Profile Name
          </Text>
          <TextInput
            style={[
              styles.nameInput,
              {
                color: colors.primaryText,
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
            placeholder="e.g., David's Nut Allergy"
            placeholderTextColor={colors.secondaryText}
            value={profileName}
            onChangeText={setProfileName}
          />
        </Card>

          {/* Free Edit Notice */}
        {isEditMode && !isCreatingProfile && isFreeEdit && (
            <View style={[styles.freeEditNotice, { backgroundColor: Colors.brand.blue + '20' }]}>
              <Info size={16} color={Colors.brand.blue} />
              <Text style={[styles.freeEditText, { color: Colors.brand.blue }]}>
                You're using your one-time free edit. After this, changes will be locked for 30 days.
              </Text>
            </View>
          )}

          {/* Dietary Presets */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
                Dietary Preferences
              </Text>
                {!isCreatingProfile && isEditMode && !canEditDietaryPresets && (
                <Text style={[styles.lockText, { color: Colors.light.warning }]}>
                  Locked for {daysRemainingForEdit} days
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
                  disabled={isEditMode && !canEditDietaryPresets}
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

        <LoadingOverlay visible={loading} message="Loading profiles..." />
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
    paddingBottom: Spacing.xl * 2, // Extra padding for bottom actions
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
    nameInput: {
      borderWidth: 1,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      marginTop: Spacing.sm,
      ...Typography.body,
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