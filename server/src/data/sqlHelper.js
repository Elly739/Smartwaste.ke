// SQL Helper functions to handle parameter placeholders for both SQLite and PostgreSQL

const useSQLite = !process.env.DATABASE_URL || process.env.USE_SQLITE === "true";

/**
 * Convert SQL query placeholders based on database type
 * SQLite uses ? placeholders, PostgreSQL uses $1, $2, etc.
 */
export function normalizeSql(sql) {
  if (useSQLite) {
    return sql;
  }

  // Convert SQLite ? placeholders to PostgreSQL $1, $2, etc.
  let paramCount = 0;
  return sql.replace(/\?/g, () => {
    paramCount++;
    return `$${paramCount}`;
  });
}

/**
 * Get the appropriate SQL placeholder for current database
 */
export function getPlaceholder(index = 1) {
  return useSQLite ? "?" : `$${index}`;
}

/**
 * Check if using SQLite
 */
export function isSQLite() {
  return useSQLite;
}
