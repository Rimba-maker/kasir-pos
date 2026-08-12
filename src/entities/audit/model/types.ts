export interface AuditLog {
  id: string;
  at: string;
  staffId: string | null;
  /** What happened, e.g. "opname.post", "backup.import", "price.change". */
  action: string;
  entity: string;
  entityId: string | null;
  before?: unknown;
  after?: unknown;
}
