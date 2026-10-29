export type AdminRole =
  | 'SUPERADMIN'
  | 'ADMIN'
  | 'PROPERTY_REVIEWER'
  | 'FINANCE_REVIEWER'
  | 'SUPPORT';

export type UserRole = AdminRole | 'PARTICIPANT' | 'USER';

export interface DiasporaEligibility {
  countryOfResidence: string; // e.g., 'United States', 'United Kingdom', 'Canada', 'UAE'
  state?: string;
  isAgeVerified: boolean;     // 21+ required under property competition rules
  isDiasporaCertified: boolean; // Ethiopian origin / Yellow card holder or lawfully eligible
  isGeofencePassed?: boolean;
  identityStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  eligibilityNotes?: string;
  verifiedAt?: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  isSuspended: boolean;
  createdAt: string;
  lastLoginAt: string;
  eligibility: DiasporaEligibility;
  phone?: string;
  phoneNumber?: string;
  backupEmail?: string;
}

export type AuditAction =
  | 'CREATE_COMPETITION'
  | 'CREATE_AUCTION'
  | 'UPDATE_COMPETITION_RULES'
  | 'PUBLISH_COMPETITION'
  | 'CLOSE_COMPETITION'
  | 'FINALIZE_WINNER'
  | 'VOID_COMPETITION'
  | 'MANUAL_ADJUDICATION'
  | 'VERIFY_PROPERTY_DOCUMENT'
  | 'REJECT_PROPERTY_DOCUMENT'
  | 'APPROVE_PROPERTY'
  | 'UPDATE_AWARD_STATUS'
  | 'RECORD_PAYMENT_REFUND'
  | 'UPDATE_ADMIN_ROLE'
  | 'INVITE_ADMIN'
  | 'SUSPEND_ADMIN'
  | 'UPDATE_LAUNCH_GATE'
  | 'EXPORT_REPORT'
  | 'AUTHENTICATION_FAILURE'
  | 'REVIEW_WITHDRAWAL'
  | 'UPDATE_PAYMENT_CONFIG'
  | 'UPDATE_USER_DATA';

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  adminRole: AdminRole;
  action: AuditAction;
  targetResource: string;
  targetId: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
  ipAddress?: string;
}
