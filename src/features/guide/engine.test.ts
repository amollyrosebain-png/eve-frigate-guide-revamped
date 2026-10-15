import { describe, expect, it } from 'vitest';
import { profile, ships, sortedShips, weapons, yearbook } from './engine';

describe('Imported frigate guide', () => {
  it('preserves 101 hulls and 47 Yearbook profiles', () => {
    expect(ships).toHaveLength(101);
    expect(ships.filter(yearbook)).toHaveLength(47);
    expect(sortedShips(ships)[0]?.name).toBe('Federation Navy Comet');
  });

  it('preserves the original Comet ammunition and resistance results', () => {
    const comet = ships.find(s => s.name === 'Federation Navy Comet');
    if (!comet) throw new Error('Comet missing');
    const result = profile(comet, '200mm Autocannon II');
    expect(result.weakest).toBe('EM');
    expect(result.weakestResistance).toBeCloseTo(16.6667, 3);
    expect(result.ammo.damage?.name).toBe('Hail S');
    expect(result.ammo.application?.name).toBe('Domination Fusion S');
    expect(result.ammo.balance?.name).toBe('Hail S');
    expect(result.drone.name).toBe('Warrior II');
    expect(profile(comet, 'Rocket Launcher II').ammo.damage?.name).toBe('Dread Guristas Nova Rocket');
  });

  it('calculates finite recommendations for every hull and weapon', () => {
    for (const ship of ships) {
      for (const weapon of weapons) {
        const result = profile(ship, weapon.label);
        for (const ammo of Object.values(result.ammo)) {
          expect(ammo).toBeDefined();
          expect(Number.isFinite(ammo?.rawScore)).toBe(true);
          expect(Number.isFinite(ammo?.balanceScore)).toBe(true);
          expect(ammo?.application).toBeGreaterThanOrEqual(0);
          expect(ammo?.application).toBeLessThanOrEqual(1);
        }
      }
    }
  });
});