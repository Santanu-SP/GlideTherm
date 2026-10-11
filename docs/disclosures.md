# GlideTherm — Responsible Usage & Disclosures

## 1. Operational & Occupational Health Disclaimer

GlideTherm is an operational decision-support tool created to assist supervisors and outdoor workforce planners in evaluating environmental thermal risk and designing adaptive shift schedules.

**Important Occupational Health Distinctions:**
- **Calculated Risk Indicator vs. Measured WBGT**: GlideTherm computes an empirical **Heat Strain Index (0–100)** derived from numerical ambient weather variables (dry-bulb temperature, apparent temperature, relative humidity, wind velocity, and estimated solar irradiance). It is **not** a direct physical measurement from an onsite Wet-Bulb Globe Temperature (WBGT) instrument.
- **Not a Certified Medical Instrument**: The recommendations, rest intervals, and risk classifications produced by GlideTherm do not constitute a certified medical diagnosis or official OSHA / NIOSH / ISO 7243 compliance certification.
- **Site-Specific Conditions**: Microclimates, localized heat islands, reflective surfaces, personal protective equipment (PPE) clo-values, and individual acclimatization levels must be evaluated by qualified on-site safety professionals.

---

## 2. Weather Data Attribution

- Meteorological forecast data is provided by **[Open-Meteo](https://open-meteo.com/)** under the Creative Commons Attribution 4.0 International (CC BY 4.0) license.
- All retrieved weather forecasts are clearly attributed with query timestamps, forecast horizons, and data source indicators.
- GlideTherm does not fabricate weather readings or present synthetic measurements as live observations.

---

## 3. Development Disclosure

- **Engineering Assistance**: Developed with pair-programming assistance from Claude Sonnet 4.6 via the Antigravity IDE (Google DeepMind).
- **Core Algorithms**: The heat strain heuristic and deterministic constraint-satisfaction shift scheduler are implemented in pure TypeScript without black-box machine learning models or runtime generative AI dependencies.
- **Data Privacy**: GlideTherm operates with an open planning model and stores only operational schedule parameters (times, task types, location IDs) without personally identifiable employee records.
