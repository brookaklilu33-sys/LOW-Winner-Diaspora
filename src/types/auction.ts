export type CompetitionStatus =
  | 'DRAFT'
  | 'PROPERTY_REVIEW'
  | 'LEGAL_REVIEW'
  | 'SCHEDULED'
  | 'OPEN'
  | 'LIVE'
  | 'CLOSED'
  | 'CALCULATING'
  | 'WINNER_PENDING_REVIEW'
  | 'RESULT_PENDING_REVIEW'
  | 'RESULT_FINALIZED'
  | 'AWARD_IN_PROGRESS'
  | 'AWARDED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'VOID'
  | 'REFUNDED';

export type PropertyType = 'APARTMENT' | 'PENTHOUSE' | 'VILLA' | 'TOWNHOUSE' | 'CONDO';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'UNDER_REVIEW';

export interface PropertyDocumentEvidence {
  id: string;
  documentType:
    | 'TITLE_DEED'
    | 'DEVELOPER_AUTHORIZATION'
    | 'BUILDING_PERMIT'
    | 'TAX_CLEARANCE'
    | 'VALUATION_REPORT';
  title: string;
  fileName: string;
  fileSize: string;
  verificationStatus: VerificationStatus;
  uploadedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  reviewerNotes?: string;
}

export interface PropertyDetails {
  id?: string;
  title: string;
  subtitle: string;
  propertyType?: PropertyType;
  city?: string;
  subCityArea?: string; // e.g., 'Bole', 'Kazanchis', 'CMC', 'Sarbet'
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
  floorAreaSqM?: number;
  parkingSpaces?: number;
  floorLevel?: number;
  furnishedStatus?: 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED';
  valuationUSD?: number;
  retailValueUSD?: number;
  developerOrOwner?: string;
  titleDeedRegistration?: string;
  ownershipVerificationStatus?: VerificationStatus;
  verificationDate?: string;
  images?: string[];
  image?: string;
  videos?: string[];
  videoUrl?: string;
  documents?: PropertyDocumentEvidence[];
  description?: string;
  keyFeatures?: string[];
  specs?: string[];
}

export interface CompetitionEntryConfig {
  ticketPriceUSD?: number;           // Fixed $49.00 USD
  ticketPriceCents?: number;         // Fixed 4900 integer cents
  minNumber: number;                // e.g. 1
  maxNumber: number;                // e.g. 1000
  maxTicketsPerParticipant?: number; // e.g. 5
  maxEntriesPerUser?: number;
  timezone?: string;                 // 'UTC+3 (East Africa Time - Addis Ababa)'
  refundPolicy: 'FULL_REFUND_IF_NO_UNIQUE_WINNER' | 'ROLLOVER_DISCLOSED_POLICY' | 'REFUND_ALL_IF_NO_UNIQUE';
  entryFeeUnique?: number;
  includedBids?: number;
  costPerAdditionalBidUnique?: number;
}

export interface WinnerCalculationTrace {
  competitionId: string;
  totalBids: number;
  frequencyMap: Record<number, number>;
  uniqueNumbers: number[];
  lowestUniqueNumber: number | null;
  winningNumber?: number;
  winnerUserId: string | null;
  winnerUserName: string | null;
  calculationVersion: string;
  timestamp: string;
  hash: string;
  status: 'QUALIFIED_WINNER' | 'NO_UNIQUE_BIDS' | 'VOIDED';
  policyApplied?: string;
  adjudicationNotes?: string;
  adjudicatedBy?: string;
  adjudicationOfficer?: string;
}

export type AwardTransferStatus =
  | 'PENDING_WINNER_CONTACT'
  | 'KYC_ELIGIBILITY_VERIFIED'
  | 'CONTRACT_PREPARATION'
  | 'TAX_REGISTRATION_FEES_ASSIGNED'
  | 'TITLE_DEED_TRANSFER_PENDING'
  | 'TITLE_DEED_TRANSFERRED'
  | 'COMPLETED';

export interface PropertyAwardWorkflow {
  status: AwardTransferStatus;
  winnerNotifiedAt?: string;
  eligibilityVerifiedAt?: string;
  contractDraftedAt?: string;
  titleTransferredAt?: string;
  transferOfficeReference?: string;
  transferredByAdminId?: string;
  winnerAcceptanceRecorded: boolean;
  legalCounselApprovalRef?: string;
}

export interface Competition {
  id: string;
  slug: string;
  title: string;
  property: PropertyDetails;
  prize?: PropertyDetails;
  entryConfig: CompetitionEntryConfig;
  status: CompetitionStatus;
  startTime: string;
  endTime: string;
  totalTicketsSold?: number;
  totalParticipants?: number;
  totalBidsSubmitted?: number;
  winnerId?: string;
  winnerName?: string;
  winningNumber?: number;
  calculatedAt?: string;
  finalizedAt?: string;
  finalizedBy?: string;
  calculationTrace?: WinnerCalculationTrace;
  awardWorkflow?: PropertyAwardWorkflow;
}

// Backward compatibility alias for existing code
export type Auction = Competition;
export type AuctionStatus = CompetitionStatus;
export type EntryConfig = CompetitionEntryConfig;
export type PrizeDetails = PropertyDetails;

export interface Bid {
  id: string;
  auctionId: string; // Competition ID
  competitionId?: string;
  entryId: string;   // Ticket/Order ID
  userId: string;
  userName: string;
  number: number;
  submittedAt: string;
}

export interface CompetitionTicket {
  id: string;
  competitionId: string;
  auctionId?: string;
  userId: string;
  userName: string;
  priceUSD: number;
  priceCents: number; // 4900 integer cents ($49 USD)
  paymentStatus: 'PENDING' | 'CONFIRMED' | 'REFUNDED' | 'FAILED';
  paymentReference: string;
  submittedNumber?: number;
  submittedAt?: string;
  createdAt: string;
  entryFeeUnique?: number;
  bidsAllowed?: number;
}

export type AuctionEntry = CompetitionTicket;

export interface RecentPublicBidItem {
  id: string;
  number: number;
  amount?: string;
  submittedAt: string;
  relativeTime: string;
  isUniqueInRecentSample: boolean;
}
