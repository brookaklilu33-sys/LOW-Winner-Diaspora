import { Bid, CompetitionEntryConfig, WinnerCalculationTrace, RecentPublicBidItem } from '../types/auction';

export interface BidValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * LowestUniqueBidService
 * 
 * Minimalist, authoritative Lowest Unique Bid auction engine for Lowwin Diaspora.
 * 
 * Core Rule: The winner is the participant whose submitted number
 * is the lowest positive whole integer chosen by exactly ONE participant.
 */
export class LowestUniqueBidService {
  public static readonly VERSION = 'v2.0-diaspora';

  /**
   * Validates a single bid candidate against competition entry configuration.
   */
  public static validateBid(number: number, config: CompetitionEntryConfig): BidValidationResult {
    if (!Number.isInteger(number)) {
      return { valid: false, error: 'Bid must be a whole integer.' };
    }
    if (number < config.minNumber || number > config.maxNumber) {
      return {
        valid: false,
        error: `Number ${number} is outside allowed range (${config.minNumber} - ${config.maxNumber}).`
      };
    }
    return { valid: true };
  }

  /**
   * Groups bids by number and identifies numbers chosen by exactly one participant.
   * Returns frequencies and ascending sorted unique numbers.
   */
  public static identifyUniqueNumbers(bids: Bid[], config: CompetitionEntryConfig): {
    frequencyMap: Record<number, number>;
    uniqueNumbers: number[];
    bidsByNumber: Record<number, Bid[]>;
  } {
    const frequencyMap: Record<number, number> = {};
    const bidsByNumber: Record<number, Bid[]> = {};

    for (const bid of bids) {
      // Exclude any out-of-boundary bids
      if (bid.number < config.minNumber || bid.number > config.maxNumber) continue;

      frequencyMap[bid.number] = (frequencyMap[bid.number] || 0) + 1;
      if (!bidsByNumber[bid.number]) bidsByNumber[bid.number] = [];
      bidsByNumber[bid.number].push(bid);
    }

    const uniqueNumbers = Object.keys(frequencyMap)
      .map(Number)
      .filter((num) => frequencyMap[num] === 1)
      .sort((a, b) => a - b);

    return { frequencyMap, uniqueNumbers, bidsByNumber };
  }

  /**
   * Authoritative winner determination based on the Lowest Unique Bid rule.
   */
  public static calculateWinner(
    competitionId: string,
    bids: Bid[],
    config: CompetitionEntryConfig
  ): WinnerCalculationTrace {
    const { frequencyMap, uniqueNumbers, bidsByNumber } = this.identifyUniqueNumbers(bids, config);

    const hasUnique = uniqueNumbers.length > 0;
    const lowestUniqueNumber = hasUnique ? uniqueNumbers[0] : null;
    const winningBid = lowestUniqueNumber !== null ? bidsByNumber[lowestUniqueNumber]?.[0] : null;

    const status = hasUnique && winningBid ? 'QUALIFIED_WINNER' : 'NO_UNIQUE_BIDS';
    const timestamp = new Date().toISOString();

    // Deterministic audit hash for reproducible verification
    const digest = `${competitionId}:${bids.length}:${lowestUniqueNumber}:${this.VERSION}`;
    const hash = this.createDigestHash(digest);

    return {
      competitionId,
      totalBids: bids.length,
      frequencyMap,
      uniqueNumbers,
      lowestUniqueNumber,
      winnerUserId: winningBid?.userId ?? null,
      winnerUserName: winningBid?.userName ?? null,
      calculationVersion: this.VERSION,
      timestamp,
      hash,
      status,
      policyApplied: status === 'QUALIFIED_WINNER'
        ? 'STANDARD_LOWEST_UNIQUE'
        : config.refundPolicy
    };
  }

  /**
   * Generates a fair feed of recent unique bids placed,
   * excluding the current viewing user's specific secret bid numbers for competitive fairness.
   */
  public static getRecentUniqueBids(
    allBids: Bid[],
    limit: number = 10,
    excludeUserId?: string
  ): RecentPublicBidItem[] {
    if (!allBids || allBids.length === 0) return [];

    // Calculate current frequency map across all bids
    const frequencyMap: Record<number, number> = {};
    for (const b of allBids) {
      frequencyMap[b.number] = (frequencyMap[b.number] || 0) + 1;
    }

    // Filter to bids that are currently unique, excluding user's own bids if specified
    const eligibleBids = allBids.filter((b) => {
      if (excludeUserId && b.userId === excludeUserId) return false;
      return frequencyMap[b.number] === 1;
    });

    // Sort by submission time descending
    const sorted = [...eligibleBids].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    const now = Date.now();

    return sorted.slice(0, limit).map((bid) => {
      const diffMs = Math.max(0, now - new Date(bid.submittedAt).getTime());
      const mins = Math.floor(diffMs / 60000);
      const hours = Math.floor(mins / 60);
      const days = Math.floor(hours / 24);

      let relativeTime = 'Just now';
      if (days > 0) relativeTime = `${days}d ago`;
      else if (hours > 0) relativeTime = `${hours}h ago`;
      else if (mins > 0) relativeTime = `${mins}m ago`;

      return {
        id: bid.id,
        number: bid.number,
        amount: '$49 USD',
        submittedAt: bid.submittedAt,
        relativeTime,
        isUniqueInRecentSample: true
      };
    });
  }

  /**
   * Deterministic hash helper for audit trail reproducibility.
   */
  private static createDigestHash(str: string): string {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    }
    return `lub_${Math.abs(h).toString(16).padStart(8, '0')}`;
  }
}
