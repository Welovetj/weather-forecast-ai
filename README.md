# Global Weather Trend Forecasting

> **PM Accelerator — AI Engineer Internship Technical Assessment**
> Dual-Role Submission (Data Science + Advanced Analysis)

---
PM Accelerator Mission

> *"To break down financial barriers and achieve educational fairness. With the goal of establishing 200 schools worldwide over the next 20 years, PM Accelerator aims to empower more kids for a better future in their life and career, simultaneously fostering a diverse landscape in the tech industry."*

---
Project Overview

This project performs end-to-end weather trend analysis and forecasting on the **Global Weather Repository** dataset (40+ features, daily observations for cities worldwide). It covers both the **Basic** and **Advanced** assessment tracks.


## 📂 Project Structure

```
weather-forecast-project/
│
├── GlobalWeatherRepository.csv        ← place Kaggle dataset here
│
├── 01_data_cleaning_eda.py            ← Step 1: cleaning + EDA
├── 02_forecasting_models.py           ← Step 2: SARIMA · Prophet · XGBoost · Ensemble
├── 03_advanced_analyses.py            ← Step 3: anomaly detection + advanced EDA
├── 04_generate_report.py              ← Step 4: compile PDF report
├── run_all.py                         ← Master runner (executes all steps)
│
├── requirements.txt
├── README.md
│
└── outputs/
    ├── cleaned_weather.csv            ← cleaned dataset (auto-generated)
    ├── Weather_Forecasting_Report.pdf ← final report (auto-generated)
    ├── figures/                       ← all plots (auto-generated)
    │   ├── 01_missing_values.png
    │   ├── 02_temperature_distribution.png
    │   ├── 03_precipitation_analysis.png
    │   ├── 04_correlation_heatmap.png
    │   ├── 05_temperature_trend.png
    │   ├── 06_wind_humidity_scatter.png
    │   ├── 07_forecast_comparison.png
    │   ├── 08_model_metrics.png
    │   ├── 09_residuals.png
    │   ├── 10_anomaly_detection.png
    │   ├── 11_climate_analysis.png
    │   ├── 12_air_quality.png
    │   ├── 13_feature_importance.png
    │   ├── 14_spatial_analysis.png
    │   └── 15_geographical_patterns.png
    └── models/
        └── forecast_metrics.json      ← MAE · RMSE · MAPE · R²
```

---

## 🚀 Setup & How to Run

### 1 · Get the dataset

Download from Kaggle and place the CSV in the project root:

```
https://www.kaggle.com/datasets/nelgiriyewithana/global-weather-repository
```

Rename the file to `GlobalWeatherRepository.csv` (or update the path in `01_data_cleaning_eda.py`).

### 2 · Install dependencies

```bash
# Python 3.10+ recommended
pip install -r requirements.txt
```

> **Note on Prophet:** If the `prophet` package fails to install, try:
> ```bash
> conda install -c conda-forge prophet
> ```

### 3 · Run the full pipeline

```bash
python run_all.py
```

Or run individual steps:

```bash
python 01_data_cleaning_eda.py
python 02_forecasting_models.py
python 03_advanced_analyses.py
python 04_generate_report.py
```

All outputs (figures, metrics JSON, cleaned CSV, PDF report) are written to the `outputs/` folder.

---

## 🔬 Methodology

### Data Cleaning (`01_data_cleaning_eda.py`)
- Parsed `last_updated` as datetime; extracted `year`, `month`, `hour`, `day_of_year`
- Dropped rows with missing timestamps; removed duplicates
- Filled numeric NaN with **column median** (robust to outliers)
- Clipped columns to physically valid bounds (e.g. humidity 0–100%, pressure 870–1085 mb)
- Computed z-score normalisation for 6 key numeric features

### EDA (`01_data_cleaning_eda.py`)
- Missing-value heatmap
- Temperature distribution (global histogram + per-country boxplot)
- Precipitation distribution (log-scale) + monthly averages
- Pearson correlation heatmap (14 weather + air-quality features)
- Global monthly temperature trend with 3-month rolling mean
- Wind speed vs humidity scatter coloured by temperature

### Forecasting (`02_forecasting_models.py`)
| Model | Configuration |
|---|---|
| **SARIMA** | (1,1,1)(1,1,1,7) — captures trend + weekly seasonality |
| **Prophet** | Yearly + weekly seasonality; changepoint_prior_scale = 0.05 |
| **XGBoost** | Lag features: 1,2,3,7,14,21,28 days + calendar features (dow, month, day) |
| **Ensemble** | Unweighted average of all three models |

Evaluation metrics: **MAE**, **RMSE**, **MAPE**, **R²** on a held-out 15% test set.

### Advanced Analyses (`03_advanced_analyses.py`)

| Analysis | Method |
|---|---|
| **Anomaly Detection** | Isolation Forest (contamination=2%) + Z-score (|z|>3) |
| **Climate Patterns** | Seasonal boxplots · Year×Month heatmap · Yearly dual-axis trend |
| **Air Quality** | PM2.5 seasonal violin · Correlation with weather vars · EPA index heatmap |
| **Feature Importance** | Random Forest + Gradient Boosting impurity scores |
| **Spatial Analysis** | Latitude–temperature scatter · World scatter-map · Country rankings |
| **Geographical Patterns** | Per-region KDE · Humidity heatmap by region × season |

---

## 📊 Key Insights

1. **Temperature is strongly latitude-dependent** — tropical nations average 15–20°C above polar/subpolar ones.
2. **Dew-point and feels-like temperature are the top predictors** of actual temperature (R ≈ 0.99); removing them exposes humidity, month, and pressure as the next strongest.
3. **The Ensemble model consistently outperforms any single model**, reducing RMSE and MAPE on the test set.
4. **PM2.5 is highest in Winter** across most regions — driven by stagnant cold air and heating emissions. High wind speed is the strongest meteorological mitigant.
5. **Isolation Forest flagged ~2% of rows** as multivariate outliers; these largely correspond to extreme precipitation and temperature events.

---

## 🛠️ Tech Stack

- **Python 3.10+**
- `pandas` · `numpy` · `scipy` — data manipulation
- `matplotlib` · `seaborn` — visualisation
- `statsmodels` — SARIMA
- `prophet` — Prophet forecasting
- `xgboost` · `scikit-learn` — ML models & feature importance
- `fpdf2` · `Pillow` — PDF report generation

---

## 📄 Deliverables

| Item | Location |
|---|---|
| All source code | `*.py` files in repo root |
| Cleaned dataset | `outputs/cleaned_weather.csv` |
| 15 analysis figures | `outputs/figures/` |
| Metrics JSON | `outputs/models/forecast_metrics.json` |
| PDF Report | `outputs/Weather_Forecasting_Report.pdf` |
| README | This file |

---

## 📬 Submission

Submitted via the [PM Accelerator Google Form](https://forms.gle/XfM3Xrzpo9sbHr4g8).
Repository access granted to `community@pmaccelerator.io` and `hr@pmaccelerator.io`.
