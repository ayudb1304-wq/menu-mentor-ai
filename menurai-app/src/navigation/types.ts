export type RootStackParamList = {
  Auth: undefined;
  ProfileSetup: { isEditMode?: boolean };
  Home: undefined;
};

export type HomeTabParamList = {
  Scan: undefined;
  History: undefined;
  Profile: undefined;
};

export type ScanStackParamList = {
  ScanOptions: undefined;
  Analysis: {
    imageUri: string;
  };
};