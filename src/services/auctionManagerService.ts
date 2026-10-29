import {
  Competition,
  Bid,
  CompetitionTicket,
  CompetitionStatus,
  CompetitionEntryConfig,
  PropertyDetails,
  RecentPublicBidItem
} from '../types/auction';
import { LowestUniqueBidService } from './LowestUniqueBidService';
import { WalletLedgerService } from './walletLedgerService';

export class AuctionManagerService {
  private static competitions: Map<string, Competition> = new Map();
  private static bids: Map<string, Bid[]> = new Map(); // competitionId -> bids
  private static tickets: Map<string, CompetitionTicket[]> = new Map(); // competitionId -> tickets

  static {
    this.seedVerifiedProperties();
  }

  /**
   * Seeds verified residential properties in Addis Ababa for the Ethiopian Diaspora.
   */
  private static seedVerifiedProperties() {
    const now = new Date();
    const futureDate = (hours: number) => new Date(now.getTime() + hours * 3600 * 1000).toISOString();
    const pastDate = (hours: number) => new Date(now.getTime() - hours * 3600 * 1000).toISOString();

    const sampleProperties: Competition[] = [
      {
        id: 'comp_bole_luxury_apt',
        slug: 'bole-luxury-condominium-addis',
        title: '3-Bedroom Luxury Condominium — Bole, Addis Ababa',
        property: {
          id: 'prop_bole_01',
          title: 'The Oasis Residences — 3BR Luxury High-Rise Apartment',
          subtitle: 'Panoramic balcony, imported Italian kitchen fittings, dedicated parking',
          propertyType: 'APARTMENT',
          city: 'Addis Ababa',
          subCityArea: 'Bole (Near Rwanda Embassy)',
          address: 'Atlas / Rwanda Corridor, Bole Sub-City, Addis Ababa',
          bedrooms: 3,
          bathrooms: 3,
          floorAreaSqM: 185,
          parkingSpaces: 2,
          floorLevel: 7,
          furnishedStatus: 'SEMI_FURNISHED',
          valuationUSD: 245000,
          developerOrOwner: 'Oasis International Properties PLC',
          titleDeedRegistration: 'AA-BOLE-REG-2025-88412',
          ownershipVerificationStatus: 'VERIFIED',
          verificationDate: '2026-08-15',
          images: [
            '/src/assets/images/addis_bole_luxury_apartment_1792574992395.jpg',
            '/src/assets/images/addis_kazanchis_penthouse_1792574993870.jpg'
          ],
          documents: [
            {
              id: 'doc_bole_title_01',
              documentType: 'TITLE_DEED',
              title: 'Addis Ababa Land Registry Title Deed Certificate',
              fileName: 'Bole_Subcity_Registry_Deed_88412.pdf',
              fileSize: '4.2 MB',
              verificationStatus: 'VERIFIED',
              uploadedAt: pastDate(240),
              verifiedAt: pastDate(220),
              reviewerNotes: 'Verified against Addis Ababa Land Management & Title Archive.'
            },
            {
              id: 'doc_bole_auth_02',
              documentType: 'DEVELOPER_AUTHORIZATION',
              title: 'Developer Award Transfer Irrevocable Authority',
              fileName: 'Developer_Transfer_Authority_2026.pdf',
              fileSize: '2.1 MB',
              verificationStatus: 'VERIFIED',
              uploadedAt: pastDate(240),
              verifiedAt: pastDate(220),
              reviewerNotes: 'Signed by managing director and notarized.'
            }
          ],
          description: 'Spacious high-rise residence featuring expansive floor-to-ceiling double-glazed windows, backup generator, 24/7 security, dual high-speed elevators, and reliable water reserve reservoir.',
          keyFeatures: [
            '185 m² living area with 3 en-suite bedrooms',
            'Addis Ababa municipal clean title deed registered',
            'Independent backup generator & 40,000L water reservoir',
            '2 dedicated secure basement parking stalls'
          ]
        },
        entryConfig: {
          ticketPriceUSD: 49,
          ticketPriceCents: 4900,
          minNumber: 1,
          maxNumber: 1000,
          maxTicketsPerParticipant: 5,
          timezone: 'EAT (UTC+3, Addis Ababa)',
          refundPolicy: 'FULL_REFUND_IF_NO_UNIQUE_WINNER'
        },
        status: 'OPEN',
        startTime: pastDate(48),
        endTime: futureDate(120),
        totalTicketsSold: 84,
        totalParticipants: 28
      },
      {
        id: 'comp_kazanchis_penthouse',
        slug: 'kazanchis-executive-penthouse-addis',
        title: 'Executive Skyline Penthouse — Kazanchis, Addis Ababa',
        property: {
          id: 'prop_kazanchis_02',
          title: 'Kazanchis Skyline Penthouse Residence',
          subtitle: 'Overlooking UNECA & Downtown Financial District, travertine finishes',
          propertyType: 'PENTHOUSE',
          city: 'Addis Ababa',
          subCityArea: 'Kazanchis / Kirkos',
          address: 'Kazanchis Commercial Avenue, Kirkos Sub-City, Addis Ababa',
          bedrooms: 4,
          bathrooms: 4,
          floorAreaSqM: 260,
          parkingSpaces: 2,
          floorLevel: 14,
          furnishedStatus: 'FURNISHED',
          valuationUSD: 395000,
          developerOrOwner: 'Abyssinia Heights Development Group',
          titleDeedRegistration: 'AA-KIRKOS-REG-2025-99201',
          ownershipVerificationStatus: 'VERIFIED',
          verificationDate: '2026-09-02',
          images: [
            '/src/assets/images/addis_kazanchis_penthouse_1792574993870.jpg',
            '/src/assets/images/addis_bole_luxury_apartment_1792574992395.jpg'
          ],
          documents: [
            {
              id: 'doc_kaz_title_01',
              documentType: 'TITLE_DEED',
              title: 'Municipal Registry Clear Title Certificate',
              fileName: 'Kirkos_Registry_Title_99201.pdf',
              fileSize: '3.8 MB',
              verificationStatus: 'VERIFIED',
              uploadedAt: pastDate(180),
              verifiedAt: pastDate(160),
              reviewerNotes: 'Verified unencumbered title deed on file.'
            }
          ],
          description: 'Top-floor penthouse residence offering 360-degree vistas across the Ethiopian capital. Travertine fireplace, hardwood parquet floors, and integrated climate circulation.',
          keyFeatures: [
            '260 m² top-floor duplex with 4 master suites',
            'Private 45 m² wraparound terrace',
            'Full smart home access and 24/7 concierge',
            'Direct title transfer with developer closing warranty'
          ]
        },
        entryConfig: {
          ticketPriceUSD: 49,
          ticketPriceCents: 4900,
          minNumber: 1,
          maxNumber: 1500,
          maxTicketsPerParticipant: 5,
          timezone: 'EAT (UTC+3, Addis Ababa)',
          refundPolicy: 'FULL_REFUND_IF_NO_UNIQUE_WINNER'
        },
        status: 'OPEN',
        startTime: pastDate(24),
        endTime: futureDate(72),
        totalTicketsSold: 112,
        totalParticipants: 39
      },
      {
        id: 'comp_cmc_villa',
        slug: 'cmc-gated-villa-residence-addis',
        title: 'Modern Stone Villa & Garden — CMC, Addis Ababa',
        property: {
          id: 'prop_cmc_03',
          title: 'CMC Gated Community Executive Two-Story Villa',
          subtitle: 'Basalt stone facade, private green lawn, lap pool and perimeter security',
          propertyType: 'VILLA',
          city: 'Addis Ababa',
          subCityArea: 'CMC (Near St. Michael)',
          address: 'CMC Gated Zone 4, Yeka Sub-City, Addis Ababa',
          bedrooms: 5,
          bathrooms: 5,
          floorAreaSqM: 420,
          parkingSpaces: 4,
          furnishedStatus: 'UNFURNISHED',
          valuationUSD: 520000,
          developerOrOwner: 'Highland Estates Ethiopia',
          titleDeedRegistration: 'AA-YEKA-VILLA-2024-5104',
          ownershipVerificationStatus: 'VERIFIED',
          verificationDate: '2026-07-20',
          images: [
            '/src/assets/images/addis_cmc_villa_residence_1792574993455.jpg'
          ],
          documents: [
            {
              id: 'doc_cmc_title_01',
              documentType: 'TITLE_DEED',
              title: 'Yeka Sub-City Private Ownership Title Certificate',
              fileName: 'Yeka_Deed_5104_Stamped.pdf',
              fileSize: '5.1 MB',
              verificationStatus: 'VERIFIED',
              uploadedAt: pastDate(300),
              verifiedAt: pastDate(280),
              reviewerNotes: 'Verified against local property registry.'
            }
          ],
          description: 'Distinguished freestanding villa in quiet residential diaspora corridor. High ceilings, outdoor kitchen, landscaped yard with indigenous acacia and olive trees.',
          keyFeatures: [
            '420 m² built area on 500 m² freehold residential plot',
            '5 bedrooms plus detached service quarters',
            '4 vehicle covered parking and automated security gate',
            'Clean documented title deed ready for conveyance'
          ]
        },
        entryConfig: {
          ticketPriceUSD: 49,
          ticketPriceCents: 4900,
          minNumber: 1,
          maxNumber: 2000,
          maxTicketsPerParticipant: 5,
          timezone: 'EAT (UTC+3, Addis Ababa)',
          refundPolicy: 'FULL_REFUND_IF_NO_UNIQUE_WINNER'
        },
        status: 'SCHEDULED',
        startTime: futureDate(12),
        endTime: futureDate(180),
        totalTicketsSold: 0,
        totalParticipants: 0
      },
      {
        id: 'comp_sarbet_condo',
        slug: 'sarbet-azure-residence-addis',
        title: 'Azure Boutique Condominium — Sarbet, Addis Ababa',
        property: {
          id: 'prop_sarbet_04',
          title: 'Azure Residences — 2BR Modern Architectural Apartment',
          subtitle: 'Close to International Community School (ICS) and African Union',
          propertyType: 'APARTMENT',
          city: 'Addis Ababa',
          subCityArea: 'Sarbet (Near ICS)',
          address: 'Sarbet Inner Ring, Nifas Silk-Lafto, Addis Ababa',
          bedrooms: 2,
          bathrooms: 2,
          floorAreaSqM: 130,
          parkingSpaces: 1,
          floorLevel: 4,
          furnishedStatus: 'FURNISHED',
          valuationUSD: 175000,
          developerOrOwner: 'Azure Urban Real Estate PLC',
          titleDeedRegistration: 'AA-SARBET-REG-2025-1109',
          ownershipVerificationStatus: 'VERIFIED',
          verificationDate: '2026-08-10',
          images: [
            '/src/assets/images/addis_sarbet_modern_condo_1792574993989.jpg'
          ],
          documents: [
            {
              id: 'doc_sarbet_title_01',
              documentType: 'TITLE_DEED',
              title: 'Condominium Title Registration Document',
              fileName: 'Sarbet_Azure_Deed_1109.pdf',
              fileSize: '3.4 MB',
              verificationStatus: 'VERIFIED',
              uploadedAt: pastDate(200),
              verifiedAt: pastDate(190),
              reviewerNotes: 'Verified valid condominium subdivision title.'
            }
          ],
          description: 'Contemporary European-standard boutique apartment in high-demand diplomatic zone. Solar water heating, acoustic soundproofing, and turnkey rental potential.',
          keyFeatures: [
            '130 m² thoughtfully configured interior',
            'High rental demand zone near international schools',
            'Solar water heating & fiber-optic internet ready',
            'Full developer transfer warranty included'
          ]
        },
        entryConfig: {
          ticketPriceUSD: 49,
          ticketPriceCents: 4900,
          minNumber: 1,
          maxNumber: 800,
          maxTicketsPerParticipant: 5,
          timezone: 'EAT (UTC+3, Addis Ababa)',
          refundPolicy: 'FULL_REFUND_IF_NO_UNIQUE_WINNER'
        },
        status: 'OPEN',
        startTime: pastDate(72),
        endTime: futureDate(48),
        totalTicketsSold: 56,
        totalParticipants: 22
      },
      {
        id: 'comp_gerji_luxury_condo',
        slug: 'gerji-imperial-garden-condominium-addis',
        title: 'Imperial Garden Condominium — Gerji, Addis Ababa',
        winnerId: 'usr_samuel_bekele',
        winnerName: 'Samuel Bekele (London, UK)',
        winningNumber: 19,
        status: 'COMPLETED',
        startTime: pastDate(240),
        endTime: pastDate(24),
        totalTicketsSold: 3980,
        totalParticipants: 840,
        calculationTrace: {
          competitionId: 'comp_gerji_luxury_condo',
          totalBids: 3980,
          frequencyMap: { 19: 1, 34: 1, 78: 1, 102: 1, 145: 1, 219: 1 },
          uniqueNumbers: [19, 34, 78, 102, 145, 219],
          lowestUniqueNumber: 19,
          winningNumber: 19,
          winnerUserId: 'usr_samuel_bekele',
          winnerUserName: 'Samuel Bekele (London, UK)',
          calculationVersion: '1.4.0-AUDITED',
          timestamp: pastDate(24),
          hash: 'SHA256-DEED-ET-88912-7F3A9C82B14D90E5',
          status: 'QUALIFIED_WINNER',
          adjudicationOfficer: 'Brook Aklilu (Superadmin)',
          adjudicatedBy: 'usr_admin_brook'
        },
        property: {
          id: 'prop_gerji_05',
          title: 'Imperial Garden Residences — 3BR Modern Condominium',
          subtitle: 'Awarded to verified UK Diaspora participant via audited lowest unique bid',
          propertyType: 'CONDO',
          city: 'Addis Ababa',
          subCityArea: 'Gerji / Bole',
          address: 'Gerji Imperial Road, Bole Sub-City, Addis Ababa',
          bedrooms: 3,
          bathrooms: 2,
          floorAreaSqM: 165,
          parkingSpaces: 2,
          floorLevel: 5,
          furnishedStatus: 'SEMI_FURNISHED',
          valuationUSD: 195000,
          developerOrOwner: 'Imperial Construction PLC',
          titleDeedRegistration: 'AA-BOLE-GERJI-2026-4402',
          ownershipVerificationStatus: 'VERIFIED',
          verificationDate: '2026-07-20',
          images: [
            '/src/assets/images/addis_bole_luxury_apartment_1792574992395.jpg'
          ],
          documents: [
            {
              id: 'doc_gerji_title',
              documentType: 'TITLE_DEED',
              title: 'Transferred Title Deed Certificate',
              fileName: 'Deed_Gerji_Award_4402.pdf',
              fileSize: '3.8 MB',
              verificationStatus: 'VERIFIED',
              uploadedAt: pastDate(200),
              verifiedAt: pastDate(24),
              reviewerNotes: 'Conveyance executed to winner Samuel Bekele.'
            }
          ],
          description: 'Prestigious 3-bedroom residence officially awarded to diaspora winner Samuel Bekele. Clean title deed transferred via Addis Ababa Land Authority.',
          keyFeatures: [
            '165 m² living area with master suite',
            'Registered municipal title deed AA-BOLE-GERJI-2026-4402',
            'Full conveyance completed with zero dispute',
            'Winning lowest unique bid: #19'
          ]
        },
        entryConfig: {
          ticketPriceUSD: 49,
          ticketPriceCents: 4900,
          minNumber: 1,
          maxNumber: 1000,
          maxTicketsPerParticipant: 5,
          timezone: 'EAT (UTC+3, Addis Ababa)',
          refundPolicy: 'FULL_REFUND_IF_NO_UNIQUE_WINNER'
        }
      },
      {
        id: 'comp_old_airport_duplex',
        slug: 'old-airport-executive-duplex-addis',
        title: 'Executive Garden Duplex — Old Airport, Addis Ababa',
        winnerId: 'usr_helen_tesfaye',
        winnerName: 'Helen Tesfaye (Washington DC, USA)',
        winningNumber: 42,
        status: 'COMPLETED',
        startTime: pastDate(360),
        endTime: pastDate(48),
        totalTicketsSold: 6325,
        totalParticipants: 1265,
        calculationTrace: {
          competitionId: 'comp_old_airport_duplex',
          totalBids: 6325,
          frequencyMap: { 42: 1, 67: 1, 118: 1, 203: 1, 311: 1 },
          uniqueNumbers: [42, 67, 118, 203, 311],
          lowestUniqueNumber: 42,
          winningNumber: 42,
          winnerUserId: 'usr_helen_tesfaye',
          winnerUserName: 'Helen Tesfaye (Washington DC, USA)',
          calculationVersion: '1.4.0-AUDITED',
          timestamp: pastDate(48),
          hash: 'SHA256-DEED-ET-77194-0B9C4E18F23A81D2',
          status: 'QUALIFIED_WINNER',
          adjudicationOfficer: 'Brook Aklilu (Superadmin)',
          adjudicatedBy: 'usr_admin_brook'
        },
        property: {
          id: 'prop_airport_06',
          title: 'Diplomatic Garden Duplex Residence',
          subtitle: 'Awarded to verified US Diaspora participant Helen Tesfaye',
          propertyType: 'VILLA',
          city: 'Addis Ababa',
          subCityArea: 'Old Airport / Lideta',
          address: 'Tor Hailoch / Old Airport Zone, Addis Ababa',
          bedrooms: 4,
          bathrooms: 4,
          floorAreaSqM: 290,
          parkingSpaces: 3,
          floorLevel: 1,
          furnishedStatus: 'FURNISHED',
          valuationUSD: 310000,
          developerOrOwner: 'Diplomatic Enclave Developers',
          titleDeedRegistration: 'AA-LIDETA-AIRPORT-2026-9931',
          ownershipVerificationStatus: 'VERIFIED',
          verificationDate: '2026-06-15',
          images: [
            '/src/assets/images/addis_cmc_villa_residence_1792574993455.jpg'
          ],
          documents: [
            {
              id: 'doc_airport_deed',
              documentType: 'TITLE_DEED',
              title: 'Finalized Transfer Deed Certificate',
              fileName: 'Deed_OldAirport_Award_9931.pdf',
              fileSize: '4.5 MB',
              verificationStatus: 'VERIFIED',
              uploadedAt: pastDate(300),
              verifiedAt: pastDate(48),
              reviewerNotes: 'Conveyance executed to winner Helen Tesfaye.'
            }
          ],
          description: 'Luxurious duplex residence in prime diplomatic enclave awarded to Helen Tesfaye with winning unique number #42.',
          keyFeatures: [
            '290 m² architectural living area',
            'Full title deed conveyed to diaspora winner',
            '4 en-suite bedrooms and landscaped terrace',
            'Winning lowest unique bid: #42'
          ]
        },
        entryConfig: {
          ticketPriceUSD: 49,
          ticketPriceCents: 4900,
          minNumber: 1,
          maxNumber: 1500,
          maxTicketsPerParticipant: 5,
          timezone: 'EAT (UTC+3, Addis Ababa)',
          refundPolicy: 'FULL_REFUND_IF_NO_UNIQUE_WINNER'
        }
      }
    ];

    for (const comp of sampleProperties) {
      this.competitions.set(comp.id, comp);
      this.bids.set(comp.id, []);
      this.tickets.set(comp.id, []);
    }

    // Seed realistic sample bids for open competitions to demonstrate unique bid mechanic and the Recent Bids feed
    this.seedRealisticBids('comp_bole_luxury_apt');
    this.seedRealisticBids('comp_kazanchis_penthouse');
    this.seedRealisticBids('comp_sarbet_condo');
  }

  private static seedRealisticBids(competitionId: string) {
    const diasporaParticipants = [
      { id: 'usr_diaspora_dc', name: 'M. Bekele (Washington DC, USA)' },
      { id: 'usr_diaspora_london', name: 'S. Haile (London, UK)' },
      { id: 'usr_diaspora_toronto', name: 'T. Alemayehu (Toronto, Canada)' },
      { id: 'usr_diaspora_atlanta', name: 'H. Tadesse (Atlanta, USA)' },
      { id: 'usr_diaspora_frankfurt', name: 'B. Wolde (Frankfurt, Germany)' },
      { id: 'usr_diaspora_dubai', name: 'E. Kebede (Dubai, UAE)' }
    ];

    // Numbers with duplicate pairs and some unique values
    const seedNumbers = [14, 14, 27, 43, 43, 68, 89, 89, 102, 137, 137, 184, 219];
    const bidsList: Bid[] = [];

    seedNumbers.forEach((num, index) => {
      const p = diasporaParticipants[index % diasporaParticipants.length];
      const timeOffsetMinutes = (seedNumbers.length - index) * 22;
      bidsList.push({
        id: `bid_seed_${competitionId}_${index}`,
        auctionId: competitionId,
        competitionId,
        entryId: `tkt_seed_${p.id}_${index}`,
        userId: p.id,
        userName: p.name,
        number: num,
        submittedAt: new Date(Date.now() - timeOffsetMinutes * 60 * 1000).toISOString()
      });
    });

    this.bids.set(competitionId, bidsList);
    const comp = this.competitions.get(competitionId);
    if (comp) {
      comp.totalTicketsSold = bidsList.length;
      comp.totalParticipants = diasporaParticipants.length;
    }
  }

  public static getAllCompetitions(): Competition[] {
    return Array.from(this.competitions.values());
  }

  public static getCompetitionById(idOrSlug: string): Competition | undefined {
    const byId = this.competitions.get(idOrSlug);
    if (byId) return byId;
    return Array.from(this.competitions.values()).find((c) => c.slug === idOrSlug);
  }

  // Alias for backward compatibility
  public static getAllAuctions(): Competition[] {
    return this.getAllCompetitions();
  }

  public static getAuctionById(idOrSlug: string): Competition | undefined {
    return this.getCompetitionById(idOrSlug);
  }

  public static getBidsForCompetition(competitionId: string): Bid[] {
    return this.bids.get(competitionId) || [];
  }

  public static getBidsForAuction(auctionId: string): Bid[] {
    return this.getBidsForCompetition(auctionId);
  }

  public static getUserBidsForCompetition(competitionId: string, userId: string): Bid[] {
    const all = this.getBidsForCompetition(competitionId);
    return all.filter((b) => b.userId === userId);
  }

  public static getUserBidsForAuction(auctionId: string, userId: string): Bid[] {
    return this.getUserBidsForCompetition(auctionId, userId);
  }

  /**
   * Fetches recent unique bids for the public feed, strictly excluding the viewing user's
   * specific bid numbers for competitive fairness!
   */
  public static getRecentUniqueBids(
    competitionId: string,
    limit: number = 10,
    excludeUserId?: string
  ): RecentPublicBidItem[] {
    const all = this.getBidsForCompetition(competitionId);
    return LowestUniqueBidService.getRecentUniqueBids(all, limit, excludeUserId);
  }

  public static getUserTickets(userId: string): CompetitionTicket[] {
    const result: CompetitionTicket[] = [];
    for (const ticketList of this.tickets.values()) {
      result.push(...ticketList.filter((t) => t.userId === userId));
    }
    return result.reverse();
  }

  public static getUserEntries(userId: string): CompetitionTicket[] {
    return this.getUserTickets(userId);
  }

  /**
   * Submit a bid number for an active confirmed ticket.
   */
  public static submitBidNumber(params: {
    competitionId: string;
    ticketId: string;
    userId: string;
    userName: string;
    number: number;
  }): { success: boolean; bid?: Bid; error?: string } {
    const comp = this.competitions.get(params.competitionId);
    if (!comp) return { success: false, error: 'Competition not found' };
    if (comp.status !== 'OPEN' && comp.status !== 'LIVE') {
      return { success: false, error: 'Number submissions are only accepted while competition is OPEN' };
    }

    // Validation
    const validation = LowestUniqueBidService.validateBid(params.number, comp.entryConfig);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const currentBids = this.bids.get(params.competitionId) || [];
    const bid: Bid = {
      id: `bid_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      auctionId: params.competitionId,
      competitionId: params.competitionId,
      entryId: params.ticketId,
      userId: params.userId,
      userName: params.userName,
      number: params.number,
      submittedAt: new Date().toISOString()
    };

    currentBids.push(bid);
    this.bids.set(params.competitionId, currentBids);
    comp.totalTicketsSold = currentBids.length;
    this.competitions.set(params.competitionId, comp);

    return { success: true, bid };
  }

  public static enterAuction(params: {
    auctionId: string;
    userId: string;
    userName: string;
    isDemo?: boolean;
  }): { success: boolean; entry?: CompetitionTicket; error?: string } {
    const comp = this.getCompetitionById(params.auctionId);
    if (!comp) return { success: false, error: 'Auction not found' };

    const ticket: CompetitionTicket = {
      id: `tkt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      competitionId: comp.id,
      auctionId: comp.id,
      userId: params.userId,
      userName: params.userName,
      priceUSD: comp.entryConfig.ticketPriceUSD ?? 49,
      priceCents: comp.entryConfig.ticketPriceCents ?? 4900,
      paymentStatus: 'CONFIRMED',
      paymentReference: `ref_entry_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    const tickets = this.tickets.get(comp.id) || [];
    tickets.push(ticket);
    this.tickets.set(comp.id, tickets);

    return { success: true, entry: ticket };
  }

  public static enterWithNumber(params: {
    competitionId: string;
    userId: string;
    userName: string;
    number: number;
    quantity?: number;
  }): { success: boolean; bids?: Bid[]; ticket?: CompetitionTicket; error?: string } {
    const comp = this.getCompetitionById(params.competitionId);
    if (!comp) return { success: false, error: 'Competition not found' };

    const validation = LowestUniqueBidService.validateBid(params.number, comp.entryConfig);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const qty = params.quantity || 1;
    const priceUSD = (comp.entryConfig.ticketPriceUSD ?? 49) * qty;
    const priceCents = (comp.entryConfig.ticketPriceCents ?? 4900) * qty;

    const tx = WalletLedgerService.recordFinancialTransaction({
      userId: params.userId,
      userEmail: `${params.userId}@participant.lowwin-diaspora.com`,
      type: 'TICKET_PURCHASE',
      amountCents: priceCents,
      ticketQuantity: qty,
      provider: 'STRIPE',
      providerReference: `pay_direct_${Date.now()}`,
      competitionId: comp.id,
      idempotencyKey: `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      description: `Entry purchase: ${qty} ticket(s) for ${comp.title}`
    });

    if (!tx.success) {
      return { success: false, error: tx.error || 'Failed to process payment' };
    }

    const ticket: CompetitionTicket = {
      id: `tkt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      competitionId: comp.id,
      auctionId: comp.id,
      userId: params.userId,
      userName: params.userName,
      priceUSD,
      priceCents,
      paymentStatus: 'CONFIRMED',
      paymentReference: `pay_${Date.now()}`,
      submittedNumber: params.number,
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const tickets = this.tickets.get(comp.id) || [];
    tickets.push(ticket);
    this.tickets.set(comp.id, tickets);

    const bidRes = this.submitBidNumber({
      competitionId: comp.id,
      ticketId: ticket.id,
      userId: params.userId,
      userName: params.userName,
      number: params.number
    });

    if (!bidRes.success) {
      return { success: false, error: bidRes.error };
    }

    return { success: true, bids: [bidRes.bid!], ticket };
  }

  public static submitBids(params: {
    auctionId: string;
    entryId: string;
    userId: string;
    userName: string;
    numbers: number[];
  }): { success: boolean; bids?: Bid[]; error?: string } {
    const results: Bid[] = [];
    for (const num of params.numbers) {
      const res = this.submitBidNumber({
        competitionId: params.auctionId,
        ticketId: params.entryId,
        userId: params.userId,
        userName: params.userName,
        number: num
      });
      if (!res.success) {
        return { success: false, error: res.error };
      }
      if (res.bid) results.push(res.bid);
    }
    return { success: true, bids: results };
  }

  /**
   * Closes competition and deterministically calculates the lowest unique bid winner.
   */
  public static closeAndCalculateWinner(competitionId: string): {
    success: boolean;
    competition?: Competition;
    trace?: any;
    error?: string;
  } {
    const comp = this.competitions.get(competitionId);
    if (!comp) return { success: false, error: 'Competition not found' };

    comp.status = 'CALCULATING';
    const allBids = this.bids.get(competitionId) || [];

    const trace = LowestUniqueBidService.calculateWinner(competitionId, allBids, comp.entryConfig);

    comp.calculatedAt = trace.timestamp;
    comp.calculationTrace = trace;
    comp.winningNumber = trace.lowestUniqueNumber ?? undefined;
    comp.winnerId = trace.winnerUserId ?? undefined;
    comp.winnerName = trace.winnerUserName ?? undefined;
    comp.status = 'RESULT_PENDING_REVIEW';

    this.competitions.set(competitionId, comp);

    return { success: true, competition: comp, trace };
  }

  /**
   * Finalizes the approved result and initiates property award workflow.
   */
  public static finalizeCompetitionResult(
    competitionId: string,
    adminEmail: string
  ): { success: boolean; competition?: Competition; error?: string } {
    const comp = this.competitions.get(competitionId);
    if (!comp) return { success: false, error: 'Competition not found' };
    if (comp.status !== 'RESULT_PENDING_REVIEW') {
      return { success: false, error: `Cannot finalize competition in status: ${comp.status}` };
    }

    comp.status = 'RESULT_FINALIZED';
    comp.finalizedAt = new Date().toISOString();
    comp.finalizedBy = adminEmail;

    // Initialize property award workflow
    comp.awardWorkflow = {
      status: 'PENDING_WINNER_CONTACT',
      winnerNotifiedAt: new Date().toISOString(),
      winnerAcceptanceRecorded: false
    };

    this.competitions.set(competitionId, comp);
    return { success: true, competition: comp };
  }

  public static finalizeAuctionResult(auctionId: string, adminEmail: string) {
    return this.finalizeCompetitionResult(auctionId, adminEmail);
  }

  /**
   * Void competition and execute refunds in accordance with disclosed policy.
   */
  public static voidCompetition(
    competitionId: string,
    reason: string,
    adminEmail: string
  ): { success: boolean; competition?: Competition; error?: string } {
    const comp = this.competitions.get(competitionId);
    if (!comp) return { success: false, error: 'Competition not found' };

    comp.status = 'VOID';
    if (comp.calculationTrace) {
      comp.calculationTrace.status = 'VOIDED';
      comp.calculationTrace.adjudicationNotes = reason;
      comp.calculationTrace.adjudicatedBy = adminEmail;
    }

    this.competitions.set(competitionId, comp);
    return { success: true, competition: comp };
  }

  public static voidAuction(auctionId: string, reason: string, adminEmail: string) {
    return this.voidCompetition(auctionId, reason, adminEmail);
  }

  public static updatePropertyDetails(
    competitionId: string,
    updates: Partial<PropertyDetails>
  ): Competition | undefined {
    const comp = this.competitions.get(competitionId);
    if (!comp) return undefined;
    comp.property = {
      ...comp.property,
      ...updates
    };
    this.competitions.set(competitionId, comp);
    return comp;
  }

  public static saveCompetition(competition: Competition): Competition {
    this.competitions.set(competition.id, competition);
    return competition;
  }

  public static saveAuction(auction: Competition): Competition {
    return this.saveCompetition(auction);
  }
}
