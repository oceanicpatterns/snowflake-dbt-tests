## dbt Core and Local Testing: A Guided Demo

This guide delves into dbt Core, its functionalities, and the process of running tests locally without relying on a connected data warehouse environment (Snowflake).

### Introduction to dbt Core

**dbt Core** stands as the open-source foundation of the dbt ecosystem, empowering developers and data analysts to:

- **Seamlessly transform raw data** into business-ready models using an intuitive SQL-based syntax.
- **Write unit tests** to guarantee data transformation accuracy and reliability.
- **Generate comprehensive documentation** for enhanced understanding and collaboration.
- **Embrace version control** for efficient change management and tracking.
- **Integrate with CI/CD pipelines** for streamlined deployments.

dbt Core boasts support for a broad spectrum of data warehouses, including Snowflake, Redshift, BigQuery, and more.

### Advantages of Local Testing with dbt Core

Local testing with dbt Core offers numerous benefits, including:

- **Faster Feedback:** Achieve quicker iterations and debugging by testing models without the overhead of connecting to a live data warehouse.
- **Offline Testing:** Conduct testing even in the absence of a production environment, ideal for developers working on laptops or in disconnected setups.
- **Increased Efficiency:** Integrate tests into your CI pipelines for streamlined deployments without incurring data warehouse usage costs.

### Steps for Local Testing with dbt Core

**1. Set Up Your Development Environment:**

- Install Python (preferably within a virtual environment) and dbt. You can install dbt using `pip install dbt`.

**2. Create a dbt Project:**

- Initialize a dbt project in your local directory using `dbt init`. This creates the essential project structure, including a `models` directory to house your data transformation logic.

**3. Define Models and Tests:**

- Create model files within the `models` directory using dbt's SQL-based syntax to define your data transformations.

**4. Add Test Files (Optional):**

- Create test files within the `tests` directory using a testing framework like `pytest` or `great_expectations` to write unit tests for your models.

**5. Run Tests Locally:**

- Activate your virtual environment (if using one).
- Navigate to your dbt project directory.
- Run `dbt test` to execute your defined tests. This will test your models without requiring a live data warehouse connection.

**Example: Local Testing with a Sample Model**

The example of this repo showcases how to implement local testing for a basic model calculating daily sales