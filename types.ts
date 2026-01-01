
export interface Scheme {
  id: string;
  name: string;
  description: string;
  eligibility: string[];
  benefits: string;
  link?: string;
  category: string;
}

export interface Reminder {
  id: string;
  schemeName: string;
  documentsNeeded: string[];
  savedDate: string;
  notes?: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum AppView {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD', // Acts as Overview
  DOCUMENTS = 'DOCUMENTS',
  APPLICATIONS = 'APPLICATIONS',
  SAVED = 'SAVED',
  EXPLORER = 'EXPLORER',
  ELISIBILITY_BOT = 'ELIGIBILITY_BOT',
  ELIGIBILITY_CHECKER = 'ELIGIBILITY_CHECKER',
  VOICE_ASSISTANT = 'VOICE_ASSISTANT',
  GRIEVANCE = 'GRIEVANCE',
  LOCATIONS = 'LOCATIONS',
  PROFILE = 'PROFILE'
}

export interface Application {
  id: string;
  schemeName: string;
  status: 'applied' | 'vao' | 'ri' | 'tahsildar' | 'disbursed';
  dateApplied: string;
  refNumber: string;
}

export interface Address {
  doorNo: string;
  village: string;
  taluk: string;
  district: string;
  pincode: string;
}

export interface UserEligibilityData {
  name: string;
  phone: string;
  email?: string;
  dob: string;
  aadhar: string;
  smartCard: string;
  income: number;
  incomePeriod: 'monthly' | 'annual';
  familyAssets: string;
  location: string;
  category: string;
  gender: string;
  age: number;
  occupation: string;
  education: string;
  employmentStatus: string;
  familySize: number;
  isDisabled: boolean;
  permAddress: Address;
  tempAddress: Address;
  isSameAddress: boolean;
  documents: {
    aadharCard?: string;
    rationCard?: string;
    incomeCert?: string;
    eduCert?: string;
    communityCert?: string;
  };
  activeApplications?: Application[];
  reminders?: Reminder[];
}

export type Language = 'en' | 'ta' | 'hi';