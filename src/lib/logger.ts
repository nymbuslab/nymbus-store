type LogLevel = "debug" | "info" | "warn" | "error";

type LogFields = Record<string, unknown>;

function emit(level: LogLevel, message: string, fields?: LogFields) {
  const payload = {
    level,
    time: new Date().toISOString(),
    message,
    ...fields,
  };
  const target =
    level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  target(JSON.stringify(payload));
}

export const logger = {
  debug: (message: string, fields?: LogFields) => emit("debug", message, fields),
  info: (message: string, fields?: LogFields) => emit("info", message, fields),
  warn: (message: string, fields?: LogFields) => emit("warn", message, fields),
  error: (message: string, fields?: LogFields) => emit("error", message, fields),
};

export type AuditEvent = {
  actorId: string | null;
  storeId: string | null;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Stub de auditoria — Fase 0 só loga.
 * Na Fase 1, quando a tabela `audit_logs` existir, a gravação real vai aqui
 * sem precisar tocar nas chamadas espalhadas pelo código.
 */
export async function logAudit(event: AuditEvent): Promise<void> {
  logger.info("audit:event", { ...event, persisted: false });
}
