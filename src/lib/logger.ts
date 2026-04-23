import { createClient } from "@/lib/supabase/server";

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
  action: string;
  storeId?: string | null;
  resourceType?: string | null;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
};

/**
 * Grava um evento de auditoria em `audit_logs` via RPC `record_audit`.
 * A RPC é security definer e valida acesso do actor à loja.
 * Se a gravação falhar, o evento vai ao menos para o log estruturado — não
 * queremos que uma falha de auditoria derrube a ação do usuário.
 */
export async function logAudit(event: AuditEvent): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("record_audit", {
      p_action: event.action,
      p_store_id: event.storeId ?? undefined,
      p_resource_type: event.resourceType ?? undefined,
      p_resource_id: event.resourceId ?? undefined,
      p_metadata: (event.metadata ?? {}) as never,
    });
    if (error) {
      logger.error("audit:persist_failed", { event, error: error.message });
    }
  } catch (cause) {
    logger.error("audit:persist_exception", {
      event,
      cause: cause instanceof Error ? cause.message : String(cause),
    });
  }
}
