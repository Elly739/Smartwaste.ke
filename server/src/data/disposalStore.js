import { all, get, run } from "./database.js";

function mapEvent(row) {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    binId: row.bin_id,
    wasteType: row.waste_type,
    pointsEarned: row.points_earned,
    createdAt: row.created_at,
  };
}

export async function saveDisposalEvent(event) {
  await run(
    `INSERT INTO disposal_events (
      id,
      user_id,
      user_name,
      bin_id,
      waste_type,
      points_earned,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      event.id,
      event.userId,
      event.userName,
      event.binId,
      event.wasteType,
      event.pointsEarned,
      event.createdAt,
    ],
  );

  return event;
}

export async function getDisposalEvents(userId) {
  const rows = userId
    ? await all(
        `SELECT id, user_id, user_name, bin_id, waste_type, points_earned, created_at
         FROM disposal_events
         WHERE user_id = ?
         ORDER BY datetime(created_at) DESC`,
        [userId],
      )
    : await all(
        `SELECT id, user_id, user_name, bin_id, waste_type, points_earned, created_at
         FROM disposal_events
         ORDER BY datetime(created_at) DESC`,
      );

  return rows.map(mapEvent);
}

export async function getAdminOverview() {
  const totals = await get(
    `SELECT
      COUNT(*) AS total_disposals,
      COALESCE(SUM(points_earned), 0) AS total_points
     FROM disposal_events`,
  );
  const users = await get("SELECT COUNT(*) AS total_users FROM users");
  const wasteBreakdownRows = await all(
    `SELECT waste_type, COUNT(*) AS count
     FROM disposal_events
     GROUP BY waste_type`,
  );
  const topBins = await all(
    `SELECT bin_id, COUNT(*) AS count
     FROM disposal_events
     GROUP BY bin_id
     ORDER BY count DESC, bin_id ASC
     LIMIT 5`,
  );
  const recentRows = await all(
    `SELECT id, user_id, user_name, bin_id, waste_type, points_earned, created_at
     FROM disposal_events
     ORDER BY datetime(created_at) DESC
     LIMIT 10`,
  );
  const weeklyRows = await all(
    `SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS count
     FROM disposal_events
     WHERE datetime(created_at) >= datetime('now', '-6 days')
     GROUP BY substr(created_at, 1, 10)
     ORDER BY day ASC`,
  );

  const wasteBreakdown = {
    plastic: 0,
    organic: 0,
    general: 0,
  };

  wasteBreakdownRows.forEach((row) => {
    wasteBreakdown[row.waste_type] = row.count;
  });

  return {
    totalDisposals: totals?.total_disposals ?? 0,
    totalPoints: totals?.total_points ?? 0,
    totalUsers: users?.total_users ?? 0,
    wasteBreakdown,
    topBins: topBins.map((row) => ({
      binId: row.bin_id,
      count: row.count,
    })),
    recentActivity: recentRows.map(mapEvent),
    weeklyActivity: weeklyRows.map((row) => ({
      day: row.day,
      count: row.count,
    })),
  };
}