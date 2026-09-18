const SPOTS: Array<[string, string]> = [
  ["Lower jaw", "Close to the face — it reads to you first, then to whoever leans in."],
  ["Neck", "The classic pulse line. Warmth carries it outward through the day."],
  ["Shoulder", "Lands on fabric as much as skin — the softest kind of trail."],
  ["Chest", "Two sprays under a shirt hold through a working day."],
  ["Elbow", "The quiet placement, for close conversations rather than entrances."],
  ["Forearm", "Ideal for learning how the scent changes hour by hour."],
  ["Wrist", "Apply early and watch the drydown move from opening to base."],
];

export function UsageGuide() {
  return <section className="usage-section section-shell">
    <div className="section-title"><p className="kicker">05 / How to wear</p>
      <h2>Where it<br/>should live.</h2>
      <p>Fragrance behaves differently on every placement. These are the seven worth knowing — start with one or two, not all of them.</p>
    </div>
    <ol className="usage-list">{SPOTS.map(([spot, note], i) => <li key={spot}><span>{String(i + 1).padStart(2, "0")}</span><strong>{spot}</strong><em>{note}</em></li>)}</ol>
    <p className="usage-note">Two sprays is enough. Never rub — friction flattens the opening and speeds the fade.</p>
  </section>;
}
