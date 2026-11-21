export type PassportFontFamily = 'system' | 'opendyslexic' | 'lexend';
export type PassportSymbolSource = 'mulberry' | 'openmoji' | 'mixed';

export interface CommunicationProfile {
  fontFamily: PassportFontFamily;
  pageBackground: string;
  symbolSet: PassportSymbolSource;
  requiresLowArousal: boolean;
  requiresHighContrast: boolean;
  customPhotoBindings: Record<string, string>;
}

export interface ReviewLog {
  reviewedAt: string;
  reviewedBy: string;
  notes?: string;
}

export interface CommunicationPassport {
  id: string;
  residentInitials: string;
  profile: CommunicationProfile;
  createdAt: string;
  lastReviewedAt: string | null;
  nextReviewDue: string;
  reviewLog: ReviewLog[];
}
