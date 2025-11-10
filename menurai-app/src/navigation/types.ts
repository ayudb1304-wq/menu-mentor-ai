export type RootStackParamList = {
  Auth: undefined;
  ProfileSetup: { isEditMode?: boolean };
  Home: undefined;
};

export type HomeTabParamList = {
  Scan: {
    screen?: 'ScanOptions' | 'Analysis' | 'AnalysisResult';
    params?: {
      imageUri?: string;
      scanId?: string;
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