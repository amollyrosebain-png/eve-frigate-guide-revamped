import { useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Columns3, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import orbitalBackground from '@/assets/orbital-background.jpg';
import { damageTypes, profile, sdeBuild, shipImage, ships, sortedShips, weapons, yearbook, type Ship } from './engine';

const choices = sortedShips(ships);
const limit = 4;
type Entry = { ship: Ship; p: ReturnType<typeof profile>; y: ReturnType<typeof yearbook> };
export default function FrigateComparison({ initialIds }: { initialIds: number[] }) {
  const [ids, setIds] = useState<number[]>([...new Set(initialIds)].filter(id => ships.some(s => s.id === id)).slice(0, limit));
  const [weapon, setWeapon] = useState(weapons[0]?.label ?? '');
  const entries: Entry[] = ids.flatMap(id => { const ship = ships.find(s => s.id === id); return ship ? [{ ship, p: profile(ship, weapon), y: yearbook(ship) }] : []; });
  function row(label: string, value: (entry: Entry) => ReactNode, className = '') {
    return <tr className={className} key={label}><th scope="row" className="comparison-label">{label}</th>{entries.map(entry => <td key={entry.ship.id}>{value(entry)}</td>)}</tr>;
  }
  function group(title: string) { return <tr className="comparison-group"><th colSpan={entries.length + 1}>{title}</th></tr>; }
  return <main className="eve-guide"><img className="orbital-backdrop" src={orbitalBackground} alt="" /><div className="app">
    <div className="system-ribbon"><span>EVE ONLINE / FRIGATE INTELLIGENCE</span><span>SDE {sdeBuild}</span></div>
    <header><div><h1>FRIGATE.COMPARISON_</h1><div className="header-sub">DAMAGE ANALYSIS / RESISTANCES / YEARBOOK 2025b</div></div><div className="comparison-nav"><Button asChild variant="ghost" className="terminal-button"><Link to="/"><ArrowLeft /> Ship guide</Link></Button></div></header>
    <div className="comparison-controls"><label>Your weapon<select aria-label="Comparison weapon" value={weapon} onChange={e => setWeapon(e.target.value)}>{weapons.map(w => <option key={w.label}>{w.label}</option>)}</select></label>
      <label>Add frigate<select aria-label="Add frigate to comparison" value="" disabled={ids.length >= limit} onChange={e => { const id = Number(e.target.value); if (id && !ids.includes(id) && ids.length < limit) setIds([...ids, id]); }}><option value="">{ids.length >= limit ? '4 frigates selected' : 'Select a frigate…'}</option>{choices.filter(s => !ids.includes(s.id)).map(s => <option key={s.id} value={s.id}>{s.name} · {s.faction}</option>)}</select></label>
      <Button variant="ghost" className="terminal-button" disabled={!ids.length} onClick={() => setIds([])}><RotateCcw /> Clear comparison</Button><span className="comparison-count" aria-live="polite">{ids.length} / {limit} HULLS</span>
    </div>
    {entries.length ? <><div className="comparison-scroll" role="region" aria-label="Frigate comparison table" tabIndex={0}><table className="comparison-table"><thead><tr><th scope="col" className="comparison-label">TARGET HULLS</th>{entries.map(({ ship }) => <th scope="col" key={ship.id}><div className="comparison-ship-top"><img className="comparison-image" src={shipImage(ship)} alt={ship.name} /><div><h2>{ship.name}</h2><small>HULL {ship.id}</small></div><Button variant="ghost" size="icon" className="terminal-button comparison-remove" aria-label={`Remove ${ship.name}`} title={`Remove ${ship.name}`} onClick={() => setIds(ids.filter(id => id !== ship.id))}><X /></Button></div><select aria-label={`Replace ${ship.name}`} value={ship.id} onChange={e => setIds(ids.map(id => id === ship.id ? Number(e.target.value) : id))}>{choices.filter(s => s.id === ship.id || !ids.includes(s.id)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></th>)}</tr></thead><tbody>
      {group('Hull & tactical profile')}
      {row('Faction', e => e.ship.faction)}{row('Class / hull type', e => `${e.ship.class} · ${e.ship.group}`)}
      {row('Yearbook tier', e => e.y?.tier ?? 'Not covered')}{row('Typical weapons', e => e.y?.weapons ?? 'Not available')}{row('Typical tank', e => e.y?.tank ?? 'Not available')}
      {row('Likely fit', e => e.p.fit.fit)}{row('Engagement', e => e.p.fit.engage)}{row('Threat', e => <strong className={e.p.threat.cls}>{e.p.threat.label}</strong>)}
      {row('FW 1v1 engagements', e => e.y ? e.y.engagements.toLocaleString('en-GB') : 'Not available')}
      {group('Damage calculations — shared weapon')}
      {row('Weakest average resistance', e => <><strong>{e.p.weakest}</strong><small>{e.p.weakestResistance.toFixed(1)}% across shield, armour & hull</small></>, 'comparison-weakness')}
      {row('Damage weakness', e => <><strong>{e.p.weakness.name}</strong><small>{e.p.weakness.type === 'average' ? 'Average resistance' : e.p.weakness.type}</small></>, 'comparison-weakness')}
      {row('Best damage ammo', e => <strong>{e.p.ammo.damage?.name ?? 'No compatible ammo'}</strong>)}
      {row('Adjusted damage score', e => e.p.ammo.damage?.rawScore.toFixed(2) ?? '—')}
      {row('Weakness damage', e => e.p.ammo.damage ? `${e.p.ammo.damage.weaknessDamage.toFixed(2)} · ${e.p.ammo.damage.weaknessName}` : '—')}
      {row('Best application ammo', e => <strong>{e.p.ammo.application?.name ?? 'No compatible ammo'}</strong>)}
      {row('Applied damage score', e => e.p.ammo.application?.appliedDamage.toFixed(2) ?? '—')}
      {row('Application estimate', e => e.p.ammo.application ? `${Math.round(e.p.ammo.application.application * 100)}%` : '—')}
      {row('Best balanced ammo', e => <strong>{e.p.ammo.balance?.name ?? 'No compatible ammo'}</strong>)}
      {row('Balance score', e => e.p.ammo.balance?.balanceScore.toFixed(2) ?? '—')}
      {row('Recommended drone', e => <><strong>{e.p.drone.name}</strong><small>{e.p.drone.damage} damage</small></>)}
      {group('Resistance by damage type')}
      {(['shield', 'armor', 'hull', 'average'] as const).map(layer => damageTypes.map((damage, i) => row(`${layer === 'armor' ? 'Armour' : layer[0]?.toUpperCase() + layer.slice(1)} · ${damage}`, e => `${((layer === 'average' ? e.p.average : e.ship.res[layer])[i] ?? 0).toFixed(1)}%`)))}
      {group('Yearbook context')}{row('Fit styles', e => e.y?.styles ?? 'Not available')}{row('Weakness / counters', e => e.p.commentary)}{row('Profile source', e => e.y ? 'Yearbook-backed PvP profile' : 'SDE-only estimate')}
    </tbody></table></div><p className="comparison-note">Scores compare ammunition against each target frigate, not the frigate’s own DPS. Application uses representative engagement ranges and transversal, not an exact hit-chance simulation. Resistance values are the embedded SDE values, not a fitted ship. Balanced recommendations use the guide’s original 70% damage / 30% application calculation with weakness and Yearbook adjustments.</p></> : <div className="comparison-empty"><Columns3 /><h2>NO HULLS SELECTED</h2></div>}
    <footer className="footer-status"><span>CCP STATIC DATA EXPORT · BUILD {sdeBuild}</span><span>YEARBOOK 2025b · 31 MAR 2025 — 31 MAR 2026</span></footer>
  </div></main>;
}