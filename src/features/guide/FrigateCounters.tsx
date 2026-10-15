import { Link, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import orbitalBackground from '@/assets/orbital-background.jpg';
import { sdeBuild, shipImage, ships, sortedShips } from './engine';
import { getSoloCounters } from './counters.functions';

const choices = sortedShips(ships);

export default function FrigateCounters({ targetId }: { targetId?: number }) {
  const navigate = useNavigate();
  const target = ships.find(s => s.id === targetId);
  const q = useQuery({
    queryKey: ['solo-counters', targetId],
    queryFn: () => getSoloCounters({ data: { shipTypeId: targetId! } }),
    enabled: !!target, staleTime: 30 * 60_000,
  });
  const best = q.data?.counters[0];
  return <main className="eve-guide"><img className="orbital-backdrop" src={orbitalBackground} alt="" /><div className="app">
    <div className="system-ribbon"><span>EVE ONLINE / FRIGATE INTELLIGENCE</span><span>ZKILLBOARD SOLO DATA</span></div>
    <header><div><h1>COUNTER.SELECT_</h1><div className="header-sub">WHICH HULL WINS SOLO AGAINST YOUR TARGET</div></div><div className="comparison-nav"><Button asChild variant="ghost" className="terminal-button"><Link to="/"><ArrowLeft /> Ship guide</Link></Button></div></header>
    <div className="comparison-controls"><label>Target you want to fight<select aria-label="Target frigate" value={targetId ?? ''} onChange={e => navigate({ to: '/counters', search: { ship: e.target.value || undefined } })}><option value="">Select a frigate…</option>{choices.map(s => <option key={s.id} value={s.id}>{s.name} · {s.faction}</option>)}</select></label></div>
    {!target ? <div className="comparison-empty"><Crosshair /><h2>SELECT A TARGET</h2></div>
      : q.isLoading ? <div className="comparison-empty"><Crosshair /><h2>PULLING SOLO KILLMAILS…</h2></div>
      : q.isError ? <div className="comparison-empty"><h2>ZKILLBOARD DATA UNAVAILABLE</h2><p>{(q.error as Error).message}</p></div>
      : !q.data?.counters.length ? <div className="comparison-empty"><h2>NO SOLO LOSSES RECORDED</h2></div>
      : <>
        {best && <section className="counter-best"><img className="comparison-image" src={`https://images.evetech.net/types/${best.shipTypeId}/render?size=128`} alt={best.name} /><div><small>BEST COUNTER TO {target.name.toUpperCase()}</small><h2>{best.name}</h2><p>{best.kills} of {q.data.sampled} recent solo kills ({Math.round(best.share * 100)}%)</p></div><img className="comparison-image" src={shipImage(target)} alt={target.name} /></section>}
        <div className="comparison-scroll"><table className="comparison-table"><thead><tr><th>#</th><th>Killer hull</th><th>Solo kills</th><th>Share</th><th></th></tr></thead><tbody>
          {q.data.counters.map((c, i) => { const inGuide = ships.some(s => s.id === c.shipTypeId); return <tr key={c.shipTypeId}><td>{i + 1}</td><td><a href={`https://zkillboard.com/ship/${c.shipTypeId}/`} target="_blank" rel="noreferrer">{c.name}</a></td><td>{c.kills}</td><td><div className="counter-bar"><span style={{ width: `${c.share * 100}%` }} /></div>{Math.round(c.share * 100)}%</td><td>{inGuide && <Link to="/compare" search={{ hulls: `${c.shipTypeId},${target.id}` }}>Compare</Link>}</td></tr>; })}
        </tbody></table></div>
        <p className="comparison-note">Based on the last {q.data.sampled} solo losses of the {target.name} on <a href={`https://zkillboard.com/ship/${target.id}/solo/`} target="_blank" rel="noreferrer">zKillboard</a>, counting the frigate flown by the player who killed it — non-frigate hulls are excluded. More kills means a frigate that is popular and successful, not a guaranteed win.</p>
      </>}
    <footer className="footer-status"><span>CCP STATIC DATA EXPORT · BUILD {sdeBuild}</span><span>LIVE DATA · ZKILLBOARD.COM</span></footer>
  </div></main>;
}
