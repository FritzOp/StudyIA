// Conversión entre filas de SQLite (camelCase, Date) y filas de Postgres (snake_case, ISO).
// Sin imports de Expo para poder probarla con Jest.

export type Row = Record<string, any>;

export type SyncFields = {
  /** Columnas propias: nombre en TypeScript -> columna en Postgres. */
  fields: Record<string, string>;
  /** Columnas propias que son fechas. */
  dates?: string[];
  /** Procesar es un estado local: en la nube y en otros dispositivos cuenta como pendiente. */
  hasStatus?: boolean;
};

function portableStatus(spec: SyncFields, row: Row): Row {
  return spec.hasStatus && row.status === 'processing' ? { ...row, status: 'pending' } : row;
}

export function toRemote(spec: SyncFields, row: Row, userId: string): Row {
  const out: Row = {
    id: row.id,
    user_id: userId,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    deleted_at: row.deletedAt ? row.deletedAt.toISOString() : null,
  };
  for (const [key, column] of Object.entries(spec.fields)) {
    const value = row[key];
    out[column] = value instanceof Date ? value.toISOString() : (value ?? null);
  }
  return portableStatus(spec, out);
}

export function fromRemote(spec: SyncFields, row: Row): Row {
  const out: Row = {
    id: row.id,
    userId: row.user_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
  };
  for (const [key, column] of Object.entries(spec.fields)) {
    const value = row[column];
    out[key] = spec.dates?.includes(key) && value ? new Date(value) : (value ?? null);
  }
  return portableStatus(spec, out);
}

/** Regla de conflicto: gana el último cambio. */
export function remoteWins(remoteUpdatedAt: Date, localUpdatedAt: Date | undefined): boolean {
  return localUpdatedAt === undefined || remoteUpdatedAt.getTime() > localUpdatedAt.getTime();
}

export function describeSync({ uploaded, downloaded }: { uploaded: number; downloaded: number }): string {
  if (uploaded === 0 && downloaded === 0) return 'Todo está al día.';
  const up = `${uploaded} ${uploaded === 1 ? 'subido' : 'subidos'}`;
  const down = `${downloaded} ${downloaded === 1 ? 'bajado' : 'bajados'}`;
  return `${up}, ${down}`;
}
