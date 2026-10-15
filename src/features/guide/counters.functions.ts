import { createServerFn } from '@tanstack/react-start';

export type CounterRow = { shipTypeId: number; name: string; kills: number; share: number };
export type CounterReport = { targetId: number; sampled: number; counters: CounterRow[]; latest: string | null };

type Attacker = { character_id?: number; ship_type_id?: number; final_blow?: boolean };
type Killmail = { killmail_time?: string; attackers?: Attacker[] };

// Groups whose hulls are frigate-sized (the guide's scope). Black Ops are
// battleship-sized and excluded.
const FRIGATE_GROUPS = [25, 324, 830, 831, 834, 893, 1022, 1283, 1527];

// ESI group -> type-ID lists change only with expansions, so cache per isolate.
let frigateIds: Set<number> | null = null;
async function getFrigateIds(): Promise<Set<number>> {
  if (frigateIds) return frigateIds;
  const lists = await Promise.all(
    FRIGATE_GROUPS.map(g =>
      fetch(`https://esi.evetech.net/latest/universe/groups/${g}/?datasource=tranquility`)
        .then(r => (r.ok ? (r.json() as Promise<{ types: number[] }>) : { types: [] as number[] }))
        .catch(() => ({ types: [] as number[] }))
    )
  );
  frigateIds = new Set(lists.flatMap(l => l.types));
  return frigateIds;
}

// Reads zKillboard solo losses for a hull and tallies the frigate the solo killer flew.
export const getSoloCounters = createServerFn({ method: 'GET' })
  .inputValidator((input: { shipTypeId: number }) => {
    const id = Number(input?.shipTypeId);
    if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid ship');
    return { shipTypeId: id };
  })
  .handler(async ({ data }): Promise<CounterReport> => {
    const headers = { 'User-Agent': 'EVE Frigate Damage Guide (drve.co.uk)', 'Accept-Encoding': 'gzip' };
    const losses: Killmail[] = [];
    for (let page = 1; page <= 3; page++) {
      const res = await fetch(`https://zkillboard.com/api/losses/shipTypeID/${data.shipTypeId}/solo/page/${page}/`, { headers });
      if (!res.ok) { if (page === 1) throw new Error(`zKillboard unavailable (${res.status})`); break; }
      const batch = (await res.json()) as Killmail[];
      if (!Array.isArray(batch) || !batch.length) break;
      losses.push(...batch);
      if (batch.length < 200) break;
    }
    const tally = new Map<number, number>();
    let sampled = 0;
    for (const km of losses) {
      const players = (km.attackers ?? []).filter(a => a.character_id && a.ship_type_id);
      const killer = players.find(a => a.final_blow) ?? players[0];
      if (!killer?.ship_type_id) continue;
      sampled++;
      tally.set(killer.ship_type_id, (tally.get(killer.ship_type_id) ?? 0) + 1);
    }
    const top = [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25);
    const names = new Map<number, string>();
    if (top.length) {
      const r = await fetch('https://esi.evetech.net/latest/universe/names/?datasource=tranquility', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(top.map(([id]) => id)),
      });
      if (r.ok) for (const n of (await r.json()) as { id: number; name: string }[]) names.set(n.id, n.name);
    }
    return {
      targetId: data.shipTypeId,
      sampled,
      latest: losses[0]?.killmail_time ?? null,
      counters: top.map(([id, kills]) => ({ shipTypeId: id, name: names.get(id) ?? `Type ${id}`, kills, share: sampled ? kills / sampled : 0 })),
    };
  });
