export interface Ship { id: number; name: string; group: string; class: string; faction: string; res: { shield: number[]; armor: number[]; hull: number[] } }
export interface Yearbook { tier: string; weapons: string; tank: string; styles: string; engagements: number }
export interface Weapon { label: string; family: string; type: string; tracking: number | null; optimal: number | null; falloff: number | null }
export interface Ammo { name: string; rawScore: number; weaknessName: string; weaknessDamage: number; appliedDamage: number; application: number; balanceScore: number }
export const ships: Ship[];
export const damageTypes: string[];
export const weapons: Weapon[];
export const sdeBuild: string;
export function yearbook(ship: Ship): Yearbook | null;
export function shipImage(ship: Ship): string;
export function sortedShips(list: Ship[]): Ship[];
export function profile(ship: Ship, weaponLabel: string): {
  average: number[]; weakest: string; weakestResistance: number;
  weakness: { type: string; name: string; values: number[] };
  fit: { fit: string; engage: string; range: number; transversal: number };
  threat: { label: string; cls: string };
  ammo: { damage: Ammo | undefined; application: Ammo | undefined; balance: Ammo | undefined };
  drone: { name: string; damage: string };
  commentary: string;
  rankings: { family: string; ammo: { name: string; score: number }[] }[];
};