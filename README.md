# snowflake-dbt-tests

Production-minded baseline for local-first dbt testing (DuckDB), Snowflake-compatible deployment profiles, and Python data utility tests.

## Table of Contents

- [Overview](#overview)
- [Playground Demo](#playground-demo)
- [Quick Start](#quick-start)
- [Project Navigation](#project-navigation)
- [dbt Workflow](#dbt-workflow)
- [Python Workflow](#python-workflow)
- [Configuration and Security](#configuration-and-security)
- [Testing Strategy](#testing-strategy)
- [CI Quality Gates](#ci-quality-gates)
- [Project Structure](#project-structure)

## Overview

This repository shows a clean analytics workflow where you can:

1. Build dbt models locally using DuckDB.
2. Preserve Snowflake compatibility using environment-driven profiles.
3. Validate model contracts using schema and data tests.
4. Validate Python transforms using deterministic pytest tests.

## Playground Demo

Visitor playground (React + Vite modern app):

- Live URL (after Pages deployment): `https://oceanicpatterns.github.io/snowflake-dbt-tests/`
- Source entry: [`index.html`](index.html)
- App source: [`playground/src/App.jsx`](playground/src/App.jsx), [`playground/src/styles.css`](playground/src/styles.css)
- Built Pages output: [`docs/index.html`](docs/index.html)

Run locally with hot reload:

```bash
npm install
npm run dev
```

What the playground offers:

1. Scenario controls for ingestion volume, outlier pressure, product breadth, and seasonality.
2. Revenue pulse visualization over a simulated 28-day period.
3. Daily quality heatmap across `seed -> staging -> marts -> tests -> python QA`.
4. Stage reliability cards and top-revenue day ranking table.
5. Execution plan block that maps directly to real local dbt/pytest commands.

## Quick Start

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Run local build/tests:

```bash
export DBT_PROFILES_DIR=profiles
dbt seed --target local
dbt build --target local
pytest -q
```

Build playground for Pages:

```bash
npm run build
```

## Project Navigation

- dbt config: [`dbt_project.yml`](dbt_project.yml)
- profiles: [`profiles/profiles.yml`](profiles/profiles.yml)
- staging model: [`models/staging/stg_transactions.sql`](models/staging/stg_transactions.sql)
- mart model: [`models/marts/daily_sales.sql`](models/marts/daily_sales.sql)
- schema tests: [`models/schema.yml`](models/schema.yml)
- custom data test: [`tests/daily_sales_non_negative.sql`](tests/daily_sales_non_negative.sql)
- sample seed: [`seeds/sample_transactions.csv`](seeds/sample_transactions.csv)
- python module: [`src/snowflake_dbt_tests/sales.py`](src/snowflake_dbt_tests/sales.py)
- script wrapper: [`scripts/calculate_daily_sales.py`](scripts/calculate_daily_sales.py)
- python tests: [`tests/test_sales.py`](tests/test_sales.py)
- playground app: [`playground/src/App.jsx`](playground/src/App.jsx)
- playground styles: [`playground/src/styles.css`](playground/src/styles.css)
- vite config: [`vite.config.js`](vite.config.js)
- CI workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)
- Pages workflow: [`.github/workflows/pages.yml`](.github/workflows/pages.yml)

## dbt Workflow

### Local target (recommended)

```bash
export DBT_PROFILES_DIR=profiles
dbt deps
dbt seed --target local
dbt run --target local
dbt test --target local
```

### Snowflake target

```bash
export SNOWFLAKE_ACCOUNT="..."
export SNOWFLAKE_USER="..."
export SNOWFLAKE_PASSWORD="..."
export SNOWFLAKE_ROLE="SYSADMIN"
export SNOWFLAKE_WAREHOUSE="..."
export SNOWFLAKE_DATABASE="..."
export SNOWFLAKE_SCHEMA="..."
```

Then:

```bash
export DBT_PROFILES_DIR=profiles
dbt build --target snowflake
```

## Python Workflow

```bash
python scripts/calculate_daily_sales.py
```

## Configuration and Security

- Secrets are read from environment variables.
- No credentials are committed in the repository.
- CI includes `gitleaks` secret scanning.

## Testing Strategy

1. dbt schema tests validate nullability/uniqueness contracts.
2. Custom data test enforces non-negative aggregate output.
3. Python unit tests validate happy path and failure modes.

## CI Quality Gates

On push/PR (`main`):

1. Secret scan (`gitleaks`)
2. Python syntax check
3. Python unit tests (`pytest`)
4. dbt local seed/build/test with DuckDB

## Project Structure

```text
snowflake-dbt-tests/
  .github/workflows/
    ci.yml
    pages.yml
  index.html
  playground/src/
    App.jsx
    main.jsx
    styles.css
  package.json
  package-lock.json
  vite.config.js
  dbt_project.yml
  profiles/profiles.yml
  models/
    staging/stg_transactions.sql
    marts/daily_sales.sql
    schema.yml
  seeds/sample_transactions.csv
  tests/
    data/sample_sales.csv
    daily_sales_non_negative.sql
    test_sales.py
  scripts/calculate_daily_sales.py
  src/snowflake_dbt_tests/
    __init__.py
    sales.py
  docs/
    index.html
    assets/
  requirements.txt
  pyproject.toml
```
