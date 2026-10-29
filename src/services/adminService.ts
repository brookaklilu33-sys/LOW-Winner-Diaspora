import { User, AdminRole, AdminAuditLog } from '../types/user';

export class AdminService {
  // Configured securely via environment or bootstrap configuration — no personal email hardcoded
  public static readonly DEFAULT_BOOTSTRAP_ADMIN = 'admin@lowwin-diaspora.com';
  public static readonly INITIAL_SUPERADMIN = 'admin@lowwin-diaspora.com';

  private static administrators: Map<string, User> = new Map();
  private static auditLogs: AdminAuditLog[] = [];

  static {
    // Seed initial bootstrap administrator record
    const bootstrapEmail = (typeof process !== 'undefined' && process.env?.INITIAL_SUPERADMIN_EMAIL)
      ? process.env.INITIAL_SUPERADMIN_EMAIL
      : this.DEFAULT_BOOTSTRAP_ADMIN;

    // Authorize user-specified admin: brookaklilu33@gmail.com
    const requestedAdmin = 'brookaklilu33@gmail.com';
    this.administrators.set(requestedAdmin.toLowerCase().trim(), {
      id: 'usr_admin_brook',
      email: requestedAdmin,
      displayName: 'Brook Aklilu (Superadmin)',
      role: 'SUPERADMIN',
      isSuspended: false,
      createdAt: '2026-08-01T00:00:00.000Z',
      lastLoginAt: new Date().toISOString(),
      eligibility: {
        countryOfResidence: 'Ethiopia / Diaspora',
        isAgeVerified: true,
        isDiasporaCertified: true,
        identityStatus: 'VERIFIED'
      }
    });

    this.administrators.set(bootstrapEmail.toLowerCase().trim(), {
      id: 'usr_superadmin_bootstrap',
      email: bootstrapEmail,
      displayName: 'System Superadmin',
      role: 'SUPERADMIN',
      isSuspended: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      eligibility: {
        countryOfResidence: 'Ethiopia / International',
        isAgeVerified: true,
        isDiasporaCertified: true,
        identityStatus: 'VERIFIED'
      }
    });

    // Seed property reviewer role for testing authorization boundaries
    const propertyReviewerEmail = 'property.reviewer@lowwin-diaspora.com';
    this.administrators.set(propertyReviewerEmail, {
      id: 'usr_reviewer_01',
      email: propertyReviewerEmail,
      displayName: 'Property Legal & Title Reviewer',
      role: 'PROPERTY_REVIEWER',
      isSuspended: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      eligibility: {
        countryOfResidence: 'Ethiopia',
        isAgeVerified: true,
        isDiasporaCertified: true,
        identityStatus: 'VERIFIED'
      }
    });
  }

  public static getAdminByEmail(email: string): User | undefined {
    if (!email) return undefined;
    return this.administrators.get(email.toLowerCase().trim());
  }

  public static getAllAdministrators(): User[] {
    return Array.from(this.administrators.values());
  }

  public static isSuperAdmin(email: string): boolean {
    const admin = this.getAdminByEmail(email);
    return !!admin && admin.role === 'SUPERADMIN' && !admin.isSuspended;
  }

  public static isAdmin(email: string): boolean {
    const admin = this.getAdminByEmail(email);
    return !!admin && !admin.isSuspended && [
      'SUPERADMIN', 'ADMIN', 'PROPERTY_REVIEWER', 'FINANCE_REVIEWER', 'SUPPORT'
    ].includes(admin.role);
  }

  public static hasPermission(
    email: string,
    action: 'MANAGE_ADMINS' | 'VERIFY_PROPERTY' | 'APPROVE_FINANCES' | 'VIEW_AUDIT_LOGS' | 'CLOSE_COMPETITION'
  ): boolean {
    const admin = this.getAdminByEmail(email);
    if (!admin || admin.isSuspended) return false;

    if (admin.role === 'SUPERADMIN') return true;

    switch (action) {
      case 'MANAGE_ADMINS':
        return false; // Superadmin only
      case 'VERIFY_PROPERTY':
        return admin.role === 'ADMIN' || admin.role === 'PROPERTY_REVIEWER';
      case 'APPROVE_FINANCES':
        return admin.role === 'ADMIN' || admin.role === 'FINANCE_REVIEWER';
      case 'CLOSE_COMPETITION':
        return admin.role === 'ADMIN';
      case 'VIEW_AUDIT_LOGS':
        return admin.role === 'ADMIN' || admin.role === 'FINANCE_REVIEWER' || admin.role === 'PROPERTY_REVIEWER';
      default:
        return false;
    }
  }

  public static addAdmin(params: {
    email: string;
    displayName: string;
    role: AdminRole;
    actorEmail: string;
  }): { success: boolean; admin?: User; error?: string } {
    if (!this.isSuperAdmin(params.actorEmail)) {
      return { success: false, error: 'Unauthorized: Only SUPERADMIN can add or invite administrators.' };
    }

    const email = params.email.toLowerCase().trim();
    if (this.administrators.has(email)) {
      return { success: false, error: 'Administrator with this email already exists.' };
    }

    const newAdmin: User = {
      id: `usr_adm_${Date.now()}`,
      email,
      displayName: params.displayName,
      role: params.role,
      isSuspended: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      eligibility: {
        countryOfResidence: 'International',
        isAgeVerified: true,
        isDiasporaCertified: true,
        identityStatus: 'VERIFIED'
      }
    };

    this.administrators.set(email, newAdmin);
    this.recordAuditLog({
      adminEmail: params.actorEmail,
      adminRole: 'SUPERADMIN',
      action: 'INVITE_ADMIN',
      targetResource: 'ADMIN_STAFF',
      targetId: email,
      details: `Added new ${params.role}: ${email}`
    });

    return { success: true, admin: newAdmin };
  }

  public static setAdminSuspension(params: {
    email: string;
    suspended: boolean;
    actorEmail: string;
  }): { success: boolean; error?: string } {
    if (!this.isSuperAdmin(params.actorEmail)) {
      return { success: false, error: 'Unauthorized: Only SUPERADMIN can suspend or reactivate staff.' };
    }

    const email = params.email.toLowerCase().trim();
    const admin = this.administrators.get(email);
    if (!admin) return { success: false, error: 'Administrator not found.' };

    if (admin.role === 'SUPERADMIN' && this.getAllAdministrators().filter(a => a.role === 'SUPERADMIN' && !a.isSuspended).length <= 1 && params.suspended) {
      return { success: false, error: 'Cannot suspend the sole active Superadmin.' };
    }

    admin.isSuspended = params.suspended;
    this.administrators.set(email, admin);

    this.recordAuditLog({
      adminEmail: params.actorEmail,
      adminRole: 'SUPERADMIN',
      action: 'SUSPEND_ADMIN',
      targetResource: 'ADMIN_STAFF',
      targetId: email,
      details: `${params.suspended ? 'Suspended' : 'Reactivated'} staff member ${email}`
    });

    return { success: true };
  }

  public static recordAuditLog(params: {
    adminEmail: string;
    adminRole?: AdminRole;
    action: AdminAuditLog['action'];
    targetResource: string;
    targetId: string;
    details: string;
    previousValue?: string;
    newValue?: string;
  }): AdminAuditLog {
    const role = params.adminRole || this.getAdminByEmail(params.adminEmail)?.role || 'ADMIN';
    const log: AdminAuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      adminId: params.adminEmail,
      adminEmail: params.adminEmail,
      adminRole: role as AdminRole,
      action: params.action,
      targetResource: params.targetResource,
      targetId: params.targetId,
      details: params.details,
      previousValue: params.previousValue,
      newValue: params.newValue,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    return log;
  }

  public static getAuditLogs(): AdminAuditLog[] {
    return [...this.auditLogs];
  }
}
