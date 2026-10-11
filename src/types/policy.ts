export type AppType = 'Free' | 'Open Source' | 'Freemium' | 'Commercial' | 'Ad-Supported';

export type Platform = 'Android' | 'iOS' | 'Web' | 'Desktop' | 'Cross-platform';

export type EntityType = 'Individual' | 'Company';

export interface ThirdPartyService {
  id: string;
  name: string;
  category: 'analytics' | 'ads' | 'backend' | 'payment' | 'monitoring' | 'other';
  privacyUrl: string;
  selected: boolean;
  notes?: string;
}

export interface PolicyFormData {
  appName: string;
  developerName: string;
  entityType: EntityType;
  contactEmail: string;
  websiteUrl?: string;
  appType: AppType;
  platform: Platform;
  effectiveDate: string;
  governingCountry: string;
  
  // Data collected
  collectsPersonalData: boolean;
  collectedDataTypes: {
    name: boolean;
    email: boolean;
    phone: boolean;
    address: boolean;
    location: boolean;
    camera: boolean;
    storage: boolean;
    contacts: boolean;
    deviceId: boolean;
    ipAddress: boolean;
    financial: boolean;
  };
  customDataCollected?: string;

  // Third party SDKs
  thirdPartyServices: ThirdPartyService[];
  customThirdParties: Array<{ name: string; privacyUrl: string }>;

  // Compliance & Features
  gdprCompliant: boolean;
  ccpaCompliant: boolean;
  coppaCompliant: boolean; // Under 13
  targetMinAge: number;
  hasCookies: boolean;
  hasInAppPurchases: boolean;
  hasSubscription: boolean;
  usesAI: boolean;
  aiDataUsageDescription?: string;

  // Terms specific
  userAccountsAllowed: boolean;
  accountTerminationClause: boolean;
  arbitrationClause: boolean;
}

export interface GitHubConfig {
  token: string; // Personal Access Token (classic or fine-grained)
  owner: string; // github username or org
  repo: string; // repository name
  branch: string; // default 'main'
  privacyPath: string; // e.g. 'PRIVACY_POLICY.md' or 'docs/privacy.html'
  termsPath: string; // e.g. 'TERMS.md' or 'docs/terms.html'
  autoPushOnSave: boolean;
}

export interface SavedPolicyDoc {
  id?: string;
  slug?: string;
  userId: string;
  title: string;
  formData: PolicyFormData;
  privacyMarkdown: string;
  privacyHtml: string;
  termsMarkdown: string;
  termsHtml: string;
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
  lastGithubPush?: {
    timestamp: number;
    repo: string;
    branch: string;
    privacyCommitSha?: string;
    termsCommitSha?: string;
    privacyUrl?: string;
    termsUrl?: string;
  };
}
