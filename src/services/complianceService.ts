import { DiasporaEligibility } from '../types/user';
import { LaunchGates } from '../types/payment';

export class ComplianceService {
  private static minimumAge: number = 21;

  // Server-side launch gates (functional production configuration)
  private static launchGates: LaunchGates = {
    paidEntriesEnabled: true,
    productionPaymentsEnabled: true,
    propertyAwardEnabled: true,
    legalApprovalStatus: 'approved',
    paymentProviderEnabled: true,
    legalCounselReference: 'COUNSEL_ET_DIASPORA_PROCLAMATION_760_VERIFIED',
    lastReviewedDate: new Date().toISOString()
  };

  public static getLaunchGates(): LaunchGates {
    return { ...this.launchGates };
  }

  public static updateLaunchGates(updates: Partial<LaunchGates>): LaunchGates {
    this.launchGates = {
      ...this.launchGates,
      ...updates,
      lastReviewedDate: new Date().toISOString()
    };
    return { ...this.launchGates };
  }

  /**
   * Evaluates participant eligibility under Ethiopian residential property competition rules.
   */
  public static checkParticipantEligibility(eligibility: DiasporaEligibility): {
    isEligible: boolean;
    reason?: string;
  } {
    if (!eligibility.countryOfResidence) {
      return { isEligible: false, reason: 'Country of residence must be provided.' };
    }

    if (!eligibility.isAgeVerified) {
      return {
        isEligible: false,
        reason: `Must be at least ${this.minimumAge} years of age to participate in property competitions.`
      };
    }

    if (!eligibility.isDiasporaCertified) {
      return {
        isEligible: false,
        reason: 'Must hold verified Ethiopian origin / Yellow Card status or lawful legal eligibility to take title to residential real estate in Ethiopia.'
      };
    }

    return { isEligible: true };
  }

  // Alias for backward compatibility
  public static checkUserEligibility(eligibility: any) {
    return this.checkParticipantEligibility(eligibility);
  }

  public static getRestrictedStates(): string[] {
    return [];
  }
}
