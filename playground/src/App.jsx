import { useMemo, useState } from 'react';

function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function simulate({ rows, risk, products }) {
  const rand = seeded(rows * 17 + risk * 31 + products * 13);
  const days = 28;
  const sales = [];
  let invalidRows = 0;

  for (let day = 0; day < days; day += 1) {
    let total = 0;
    const events = Math.max(10, Math.floor(rows / days + rand() * 10));

    for (let i = 0; i < events; i += 1) {
      const weight = 1 + Math.floor(rand() * products);
      let amount = 22 + rand() * 90 + weight * 10;
      if (rand() < risk / 100) amount *= 1.7 + rand() * 1.6;
      if (rand() < risk / 220) amount *= -1;

      if (amount <= 0 || !Number.isFinite(amount)) {
        invalidRows += 1;
      } else {
        total += amount;
      }
    }

    sales.push(Math.round(total));
  }

  const rowsOut = Math.max(0, rows - invalidRows);
  const anomalyRate = invalidRows / Math.max(1, rows);
  const score = Math.max(55, Math.min(99, Math.round(100 - anomalyRate * 260 - risk * 0.28)));

  return { sales, rowsOut, anomalyRate, score };
}

function SalesChart({ values }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = Math.max(1, max - min);

  const points = values
    .map((v, idx) => {
      const x = (idx / (values.length - 1)) * 100;
      const y = 88 - ((v - min) / span) * 70;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="sales-chart">
      <polyline points={`0,92 ${points} 100,92`} fill="rgba(34,220,203,0.18)" stroke="none" />
      <polyline points={points} fill="none" stroke="rgba(34,220,203,0.95)" strokeWidth="1.1" />
    </svg>
  );
}

export function App() {
  const [rows, setRows] = useState(1200);
  const [risk, setRisk] = useState(12);
  const [products, setProducts] = useState(8);

  const model = useMemo(() => simulate({ rows, risk, products }), [rows, risk, products]);
  const fmt = new Intl.NumberFormat('en-US');

  return (
    <div className="page">
      <header className="hero panel">
        <p className="eyebrow">OceanicPatterns Playground</p>
        <h1>Simple Pipeline Simulator</h1>
        <p className="subtitle">Adjust volume and risk, then view output quality and sales trend instantly.</p>
      </header>

      <main className="layout">
        <section className="panel controls">
          <h2>Inputs</h2>
          <label>
            <span>Rows</span>
            <strong>{fmt.format(rows)}</strong>
            <input type="range" min="400" max="5000" step="100" value={rows} onChange={(e) => setRows(Number(e.target.value))} />
          </label>
          <label>
            <span>Risk</span>
            <strong>{risk}%</strong>
            <input type="range" min="0" max="45" step="1" value={risk} onChange={(e) => setRisk(Number(e.target.value))} />
          </label>
          <label>
            <span>Products</span>
            <strong>{products}</strong>
            <input type="range" min="2" max="20" step="1" value={products} onChange={(e) => setProducts(Number(e.target.value))} />
          </label>
        </section>

        <section className="panel main">
          <div className="kpis">
            <article>
              <p>Rows In</p>
              <strong>{fmt.format(rows)}</strong>
            </article>
            <article>
              <p>Rows Out</p>
              <strong>{fmt.format(model.rowsOut)}</strong>
            </article>
            <article>
              <p>Anomaly</p>
              <strong>{(model.anomalyRate * 100).toFixed(2)}%</strong>
            </article>
            <article>
              <p>Score</p>
              <strong>{model.score}%</strong>
            </article>
          </div>

          <h2>Sales Trend (28 days)</h2>
          <SalesChart values={model.sales} />

          <h2>Run For Real</h2>
          <pre>{`export DBT_PROFILES_DIR=profiles\ndbt seed --target local\ndbt build --target local\npytest -q`}</pre>
        </section>
      </main>
    </div>
  );
}
