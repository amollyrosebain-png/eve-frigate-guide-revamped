import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ships, damageTypes, weapons, sdeBuild, yearbook, shipImage, sortedShips, profile } from './engine';

type Ship = (typeof ships)[number];
const all = 'all';
const factions = [...new Set(ships.map((s: Ship) => s.faction))].sort() as string[];
const groups = [...new Set(ships.map((s: Ship) => s.group))].sort() as string[];
function ShipPicture({ ship, className }: { ship: Ship; className: string }) {
  const [failed, setFailed] = useState(false);
  return <div className={className}>{failed ? <div className="fallback">◈</div> : <img className="ship-img" src={shipImage(ship)} alt={ship.name} onError={() => setFailed(true)} />}</div>;
}
export default function FrigateGuide() {
  const [search, setSearch] = useState('');
  const [faction, setFaction] = useState(all);
  const [shipClass, setShipClass] = useState(all);
  const [group, setGroup] = useState(all);
  const [yearbookOnly, setYearbookOnly] = useState(false);
  const [selected, setSelected] = useState<Ship | null>(null);
  const [weapon, setWeapon] = useState(weapons[0].label);
  const list = useMemo(() => sortedShips(ships.filter((s: Ship) => (!search || s.name.toLowerCase().includes(search.trim().toLowerCase())) && (faction === all || faction === s.faction) && (shipClass === all || shipClass === s.class) && (group === all || group === s.group) && (!yearbookOnly || yearbook(s)))), [search, faction, shipClass, group, yearbookOnly]);
  function clearFilters() { setSearch(''); setFaction(all); setShipClass(all); setGroup(all); setYearbookOnly(false); }
  function reset() { clearFilters(); setSelected(null); setWeapon(weapons[0].label); }
  return <main className="eve-guide"><div className="app">
    <header><div><h1>EVE FRIGATE DAMAGE GUIDE <span className="guide-version">v01</span></h1><div className="sub">Offline CCP SDE database · weakness-aware ammunition calculator</div></div><div className="sub" aria-live="polite">{list.length} / {ships.length} ships</div></header>
    <div className="toolbar">
      <input aria-label="Search frigates" placeholder="Search frigates…" autoComplete="off" value={search} onChange={e => setSearch(e.target.value)} />
      <select aria-label="Faction" value={faction} onChange={e => setFaction(e.target.value)}><option value={all}>All Factions</option>{factions.map(f => <option key={f}>{f}</option>)}</select>
      <select aria-label="Class" value={shipClass} onChange={e => { setShipClass(e.target.value); setGroup(all); }}><option value={all}>All Classes</option>{['Faction', 'T1', 'T2'].map(c => <option key={c}>{c}</option>)}</select>
      <Button variant="ghost" className="reset-btn" title="Reset all filters and selections" onClick={reset}>Reset</Button><span className="guide-count-space" />
    </div>
    <div className="layout"><aside className="sidebar">
      <div className="sidebox"><Button variant="ghost" className="sideall" onClick={clearFilters}><b>ALL SHIPS</b><span>{ships.length}</span></Button><h4>CLASSES</h4>{groups.map(g => <Button key={g} variant="ghost" className={`sideitem ${group === g ? 'active' : ''}`} onClick={() => { setGroup(group === g ? all : g); setShipClass(all); }}><span>{g}</span><span className="sidecount">{ships.filter((s: Ship) => s.group === g).length}</span></Button>)}</div>
      <div className="sidebox"><h4>FACTIONS</h4>{factions.map(f => <Button variant="ghost" key={f} className={`sideitem ${faction === f ? 'active' : ''}`} onClick={() => setFaction(faction === f ? all : f)}><span>{f}</span><span className="sidecount">{ships.filter((s: Ship) => s.faction === f).length}</span></Button>)}</div>
      <div className="sidebox"><h4>YEARBOOK 2025b</h4><Button variant="ghost" className={`sideall ${yearbookOnly ? 'active' : ''}`} aria-pressed={yearbookOnly} onClick={() => { clearFilters(); setYearbookOnly(!yearbookOnly); }}><b>FW PvP COVERAGE</b><span>47 covered</span></Button><div className="sub data-source">47 Yearbook frigate entries plus the wider FW metagame and engagement data.</div></div>
      <div className="sidebox data-source"><h4>DATA SOURCE</h4>CCP Static Data (SDE)<br />Build {sdeBuild}</div>
    </aside>
    <div className="grid">{list.length ? list.map((s: Ship) => { const y = yearbook(s); const tier = y?.tier === 'Top' ? 'tier-top' : y?.tier === 'Balanced Plus' ? 'tier-plus' : y?.tier === 'Balanced Minus' ? 'tier-minus' : ''; return <Button key={s.id} variant="ghost" className={`card ${tier} ${selected?.id === s.id ? 'active' : ''}`} aria-pressed={selected?.id === s.id} onClick={() => setSelected(s)}><ShipPicture ship={s} className="shippic" /><div className="cardbody"><div className="name">{s.name}</div><div className="meta">{s.faction} · {s.group}</div>{y && <div className="ybrole">{y.tier} · {y.weapons}</div>}</div></Button>; }) : <div className="empty">No frigates match your filters.</div>}</div>
    <aside className="detail" aria-live="polite">{selected ? <ShipDetail ship={selected} weapon={weapon} setWeapon={setWeapon} /> : <div className="section"><h2>Select a frigate</h2><p className="sub">The database is embedded in this HTML. No ESI request is made for ship data.</p></div>}</aside>
    </div>
  </div></main>;
}
function ShipDetail({ ship, weapon, setWeapon }: { ship: Ship; weapon: string; setWeapon: (value: string) => void }) {
  const p = profile(ship, weapon), y = yearbook(ship);
  const recommendations = [
    { title: 'Best damage', kind: 'damage', a: p.ammo.damage, metric: (a: typeof p.ammo.damage) => `Damage ${a.rawScore.toFixed(1)} · ${a.weaknessName} weakness ${a.weaknessDamage.toFixed(1)}`, tag: 'MAX DAMAGE + WEAKNESS' },
    { title: 'Best application', kind: 'application', a: p.ammo.application, metric: (a: typeof p.ammo.application) => `Applied ${a.appliedDamage.toFixed(1)} · ${a.weaknessName} weakness ${a.weaknessDamage.toFixed(1)}`, tag: 'APPLICATION + WEAKNESS' },
    { title: 'Best balance', kind: 'balance', a: p.ammo.balance, metric: (a: typeof p.ammo.balance) => `Damage ${a.rawScore.toFixed(1)} · Application ${Math.round(a.application * 100)}% · Score ${a.balanceScore.toFixed(1)}`, tag: '70/30 + WEAKNESS + YEARBOOK' },
  ];
  return <>
    <div className="hero"><div><div className="sub">{ship.faction} · {ship.class} · {ship.group}</div><h2>{ship.name}</h2><div className="weak"><small>WEAKEST AVERAGE RESISTANCE</small><strong>{p.weakest}</strong><span>{p.weakestResistance.toFixed(1)}% average resistance across Shield + Armour + Hull</span></div></div><ShipPicture key={ship.id} ship={ship} className="heroimg" /></div>
    <div className="section"><div className={`tacbox ${y ? '' : 'est'}`}><div className="tachead"><div className="tactitle">TACTICAL ENGAGEMENT GUIDE</div><span className={`ybbadge ${p.threat.cls}`}>Threat: {p.threat.label}</span></div>
      <div className="weapon-select"><div><label htmlFor="tacticalWeapon">Your weapon</label><select id="tacticalWeapon" value={weapon} onChange={e => setWeapon(e.target.value)}>{weapons.map((w: { label: string }) => <option key={w.label}>{w.label}</option>)}</select></div><div className="tank-summary"><label>Typical tank</label><div className="tank-result"><b>{y?.tank || 'Not available'}</b></div></div></div>
      <div className="ammo-recs">{recommendations.map(r => <div className={`ammo-rec ${r.kind}`} key={r.kind}><small>{r.title}</small><strong>{r.a?.name || 'No compatible ammo'}</strong>{r.a && <><span className="ammo-metric">{r.metric(r.a)}</span><span className="tag">{r.tag}</span></>}</div>)}</div>
      <div className="tacgrid"><div className="tacitem"><small>Drone</small><b className="drone-rec">{p.drone.name}</b><div className="drone-dmg">{p.drone.damage} damage</div></div><div className="tacitem"><small>Likely fit</small><b>{p.fit.fit}</b></div><div className="tacitem yb-weakness"><small>Weakness · Yearbook</small><b>{p.commentary}</b></div><div className="tacitem"><small>Damage weakness</small><b className="weakness-main">{p.weakness.name}</b><div className="weakness-detail">{p.weakness.type === 'average' ? 'Lowest average resistance' : `${p.weakness.type} · ${Math.min(...p.weakness.values).toFixed(1)}% resistance`}</div></div><div className="tacitem"><small>Engagement</small><b className="engage">{p.fit.engage}</b></div><div className="tacitem"><small>Threat level</small><b className={p.threat.cls}>{p.threat.label}</b></div></div>
      <div className="source-tag">{y ? 'Yearbook-backed PvP profile' : 'SDE-only estimate: no Yearbook profile is available for this ship'}. Ammo is shown as three weakness-aware recommendations: maximum resistance-adjusted damage, maximum applied damage at the likely engagement, and a balanced 70% damage / 30% application choice. Application uses the Yearbook's archetype ranges and representative transversal, plus weapon/ammunition tracking and range modifiers. All three choices explicitly exploit the calculated damage weakness; the balanced choice also uses small Yearbook-calibrated priors for documented choices such as Depleted Uranium for Firetail artillery, Xray for beam kiting and the weakness of Scorch for scram-kiting pulse contexts. The Weakness box is taken from the ship-specific limitations, counters and fit drawbacks described in the Yearbook 2025b profile commentary; it is not inferred from the SDE resistance data. This is an application estimate, not an exact hit-chance simulation for an unknown target fit.</div>
    </div></div>
    <div className="section"><h3>Average resistance</h3><div className="resgrid">{damageTypes.map((d: string, i: number) => <div className="res" key={d}><span>{d}</span><b>{p.average[i].toFixed(1)}%</b><meter className="res-meter" min={0} max={100} value={p.average[i]} aria-label={`${d} resistance`} /></div>)}</div></div>
    <div className="section"><h3>Resistance by layer</h3><div className="table-wrap"><table><thead><tr><th>Layer</th>{damageTypes.map((d: string) => <th key={d}>{d}</th>)}</tr></thead><tbody>{[['Shield', ship.res.shield], ['Armour', ship.res.armor], ['Hull', ship.res.hull], ['Average', p.average]].map(([name, values]) => <tr key={String(name)}><td>{String(name)}</td>{(values as number[]).map((v, i) => <td key={i}>{v.toFixed(1)}%</td>)}</tr>)}</tbody></table></div></div>
    <div className="section"><h3>Best ammunition by frigate weapon type</h3><p className="note">Ranked from the embedded CCP SDE ammunition damage values against this ship's average resistance. This is a damage-only ranking; range, tracking, explosion radius/velocity, skills and target fit are not included.</p><div className="ammo">{p.rankings.map((r: { family: string; ammo: { name: string; score: number }[] }) => <div className="ammoitem" key={r.family}><b>{r.family}</b><div className="rank-first">🥇 {r.ammo[0]?.name}</div><div className="meta">🥈 {r.ammo[1]?.name || '—'}</div><div className="score">Damage score: {r.ammo[0]?.score.toFixed(2)}</div></div>)}</div></div>
    <div className="section"><div className="note">Data source: CCP Static Data Export build {sdeBuild}. Resistance values use CCP Dogma resonance attributes (1.0 = 0% resistance).</div></div>
    {y && <div className="section"><div className="ybbox"><div className="ybhead"><div><h3>Faction Warfare Yearbook 2025b</h3><div className="ybnote">Profile data and metagame context from the Yearbook's 31 Mar 2025–31 Mar 2026 coverage.</div></div><span className="ybbadge">{y.tier}</span></div><div className="ybgrid"><div className="ybstat"><small>FW 1v1 engagements</small><b>{y.engagements?.toLocaleString() || '—'}</b></div><div className="ybstat"><small>Weapons</small><b>{y.weapons}</b></div><div className="ybstat"><small>Typical tank</small><b>{y.tank}</b></div></div><div className="fitstyles">{y.styles.split(' · ').map((s: string) => <span className="fitstyle" key={s}>{s}</span>)}</div><div className="ybnote">The Yearbook's engagement figures are solo killmail data from Faction Warfare systems; its page 15 chart reports kills, mirrors and losses for ships covered by the Yearbook.</div></div></div>}
  </>;
}
