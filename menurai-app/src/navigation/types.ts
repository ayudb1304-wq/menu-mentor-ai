export type RootStackParamList = {
  Auth: undefined;
  ProfileSetup: { isEditMode?: boolean; isNewProfile?: boolean; profileId?: string };
  Home: undefined;
  Terms: undefined;
  PrivacyPolicy: undefined;
  CancellationPolicy: undefined;
  ContactSupport: undefined;
};

export type HomeTabParamList = {
  Scan: {
    screen?: 'ScanOptions' | 'Analysis' | 'AnalysisResult' | 'Paywall';
    params?: {
      imageUri?: string;
      scanId?: string;
      context?: 'addProfile' | 'scanLimit';
    };
  } | undefined;
  History: undefined;
  Profile: undefined;
};

export type ScanStackParamList = {
  ScanOptions: undefined;
  Analysis: {
    imageUri: string;
  };
  AnalysisResult: {
    scanId: string;
  };
  Paywall: {
    context?: 'addProfile' | 'scanLimit';
  };
};