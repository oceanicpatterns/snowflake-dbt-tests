import { useMemo, useState } from 'react';

const stages = ['Seed', 'Staging', 'Marts', 'Data Tests', 'Python QA'];

function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function buildScenario({ rows, risk, products, seasonality, shock }) {
  const rand = seeded(rows * 11 + products * 23 + risk * 71 + seasonality * 17 + (shock ? 401 : 0));
  const days = 28;
  const sales = [];
  const quality = [];

  let invalidRows = 0;
  let nullRows = 0;
  let duplicateRows = 0;

  for (let day = 0; day < days; day += 1) {
    let daySales = 0;
    const cycle = 1 + Math.sin((day / days) * Math.PI * 2) * (seasonality / 100);
    const events = Math.max(8, Math.floor(rows / days + rand() * 16));

    for (let i = 0; i < events; i += 1) {
      const weight = 1 + Math.floor(rand() * products);
      let amount = (18 + rand() * 90 + weight * 11) * cycle;
      if (rand() < risk / 100) amount *= 1.8 + rand() * 1.7;
      if (shock && rand() < 0.045) amount *= -1;
      if (rand() < risk / 140) nullRows += 1;
      if (rand() < risk / 120) duplicateRows += 1;

      if (amount <= 0 || !Number.isFinite(amount)) {
        invalidRows += 1;
      } else {
        daySales += amount;
      }
    }

    sales.push(Math.round(daySales));

    const stageQuality = [
      97 - risk * 0.2 + rand() * 3,
      95 - risk * 0.25 + rand() * 3,
      94 - risk * 0.28 + rand() * 3,
      96 - risk * 0.18 + rand() * 2,
      98 - risk * 0.14 + rand() * 2,
    ].map((q) => Math.max(55, Math.min(99, Math.round(q))));
    quality.push(stageQuality);
  }

  const rowsOut = Math.max(0, rows - invalidRows - nullRows);
  const retainedRate = rowsOut / Math.max(1, rows);
  const anomalyRate = invalidRows / Math.max(1, rows);
  const dupRate = duplicateRows / Math.max(1, rows);
  const score = Math.max(48, Math.min(99, Math.round(100 - anomalyRate * 220 - dupRate * 140 - (1 - retainedRate) * 70)));

  const latestQuality = quality[quality.length - 1];
  const alerts = [];
  if (anomalyRate > 0.08) alerts.push('anomaly_spike');
  if (dupRate > 0.06) alerts.push('duplicate_pressure');
  if (score < 72) alerts.push('quality_threshold');

  return {
    sales,
    quality,
    latestQuality,
    rowsOut,
    invalidRows,
    nullRows,
    duplicateRows,
    retainedRate,
    anomalyRate,
    score,
    alerts,
  };
}

function SalesChart({ values }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = Math.max(1, max - min);

  const points = values
    .map((v, idx) => {
      const x = (idx / (values.length - 1)) * 100;
      const y = 88 - ((v - min) / span) * 72;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="sales-chart">
      <defs>
        <linearGradient id="salesGlow" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(34, 220, 203, 0.4)" />
          <stop offset="100%" stopColor="rgba(34, 220, 203, 0.04)" />
        </linearGradient>
      </defs>
      <polyline points={`0,92 ${points} 100,92`} fill="url(#salesGlow)" stroke="none" />
      <polyline points={points} fill="none" stroke="rgba(34,220,203,0.98)" strokeWidth="1" />
    </svg>
  );
}

function QualityHeatmap({ quality }) {
  return (
    <div className="heatmap">
      {quality.map((day, dayIdx) => (
        <div className="heat-row" key={dayIdx}>
          {day.map((q, stageIdx) => (
            <div
              key={`${dayIdx}-${stageIdx}`}
              className="heat-cell"
              title={`Day ${dayIdx + 1} · ${stages[stageIdx]} · ${q}`}
              style={{
                background: `hsl(${Math.max(0, q - 50) * 1.8}, 75%, ${Math.max(24, 58 - q * 0.22)}%)`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function StageRail({ scores }) {
  return (
    <div className="stage-rail">
      {stages.map((name, idx) => {
        const score = scores[idx] ?? 0;
        const tone = score >= 90 ? 'ok' : score >= 78 ? 'warn' : 'bad';
        return (
          <article className={`stage-card ${tone}`} key={name}>
            <p>{name}</p>
            <strong>{score}%</strong>
            <span>{score >= 90 ? 'Stable' : score >= 78 ? 'Watch' : 'Action'}</span>
          </article>
        );
      })}
    </div>
  );
}

export function App() {
  const [rows, setRows] = useState(1200);
  const [risk, setRisk] = useState(14);
  const [products, setProducts] = useState(8);
  const [seasonality, setSeasonality] = useState(18);
  const [shock, setShock] = useState(false);

  const model = useMemo(
    () => buildScenario({ rows, risk, products, seasonality, shock }),
    [rows, risk, products, seasonality, shock]
  );
  const dailyTop = useMemo(
    () =>
      model.sales
        .map((value, idx) => ({ day: idx + 1, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
    [model.sales]
  );

  const fmt = new Intl.NumberFormat('en-US');

  return (
    <div className="page">
      <div className="halo a" />
      <div className="halo b" />
      <div className="halo c" />

      <header className="hero panel">
        <p className="eyebrow">OceanicPatterns · Interactive Pipeline Lab</p>
        <h1>Modern data engineering playground</h1>
        <p className="subtitle">
          Stress test a realistic analytics pipeline profile: simulate ingestion volume, quality pressure, model complexity,
          and observe downstream behavior across dbt layers and Python checks.
        </p>
        <div className="hero-metrics">
          <div><span>Rows In</span><strong>{fmt.format(rows)}</strong></div>
          <div><span>Rows Out</span><strong>{fmt.format(model.rowsOut)}</strong></div>
          <div><span>Data Health</span><strong>{model.score}%</strong></div>
          <div><span>Alerts</span><strong>{model.alerts.length || 0}</strong></div>
        </div>
      </header>

      <main className="layout">
        <section className="panel controls">
          <h2>Scenario Controls</h2>
          <label>
            <span>Input rows</span>
            <strong>{fmt.format(rows)}</strong>
            <input type="range" min="400" max="5000" step="100" value={rows} onChange={(e) => setRows(Number(e.target.value))} />
          </label>
          <label>
            <span>Outlier pressure</span>
            <strong>{risk}%</strong>
            <input type="range" min="0" max="45" step="1" value={risk} onChange={(e) => setRisk(Number(e.target.value))} />
          </label>
          <label>
            <span>Product breadth</span>
            <strong>{products}</strong>
            <input type="range" min="2" max="20" step="1" value={products} onChange={(e) => setProducts(Number(e.target.value))} />
          </label>
          <label>
            <span>Seasonality swing</span>
            <strong>{seasonality}%</strong>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={seasonality}
              onChange={(e) => setSeasonality(Number(e.target.value))}
            />
          </label>
          <label className="toggle">
            <input type="checkbox" checked={shock} onChange={(e) => setShock(e.target.checked)} />
            <span>Inject shock events</span>
          </label>
        </section>

        <section className="panel visuals">
          <div className="section-head">
            <h2>Revenue Pulse</h2>
            <p>28-day simulated trajectory after transformation and quality guards.</p>
          </div>
          <SalesChart values={model.sales} />
          <div className="stat-row">
            <article>
              <p>Anomaly Rate</p>
              <strong>{(model.anomalyRate * 100).toFixed(2)}%</strong>
            </article>
            <article>
              <p>Null Rows</p>
              <strong>{fmt.format(model.nullRows)}</strong>
            </article>
            <article>
              <p>Duplicates</p>
              <strong>{fmt.format(model.duplicateRows)}</strong>
            </article>
          </div>
        </section>

        <section className="panel heatmap-wrap">
          <div className="section-head">
            <h2>Quality Heatmap</h2>
            <p>Daily pass tendency per pipeline stage.</p>
          </div>
          <QualityHeatmap quality={model.quality} />
        </section>

        <section className="panel stages">
          <div className="section-head">
            <h2>Stage Reliability</h2>
            <p>Latest cycle reliability by layer.</p>
          </div>
          <StageRail scores={model.latestQuality} />
        </section>

        <section className="panel terminal">
          <div className="section-head">
            <h2>Execution Plan</h2>
            <p>Run this pipeline for real in your local environment.</p>
          </div>
          <pre>
{`export DBT_PROFILES_DIR=profiles
dbt seed --target local
dbt build --target local
pytest -q

# simulated result
rows_out=${model.rowsOut}
quality_score=${model.score}
alerts=${model.alerts.length}`}
          </pre>
        </section>

        <section className="panel ranking">
          <div className="section-head">
            <h2>Top Revenue Days</h2>
            <p>Highest simulated daily totals after quality filters.</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {dailyTop.map((entry) => (
                <tr key={entry.day}>
                  <td>Day {entry.day}</td>
                  <td>{fmt.format(entry.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
