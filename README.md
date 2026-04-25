# AI-based Hyperlocal Demand Prediction for Dark Stores & Quick Commerce

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Course:** Artificial Intelligence and Machine Learning
**Submitted to:** Dr. Anshika Srivastava, Assistant Professor & Program Coordinator
**Department:** Electronics and Communication Engineering, Gati Shakti Vishwavidyalaya

---

## Group Members

| #   | Name                                            |
| --- | ----------------------------------------------- |
| 1   | [Parth Sidhu](https://github.com/Parth-Sidhu-4) |
| 2   | Shreya Mohanty                                  |
| 3   | Srijan Gupta                                    |
| 4   | Assir Thota                                     |
| 5   | Ayush Vaibhav Gond                              |

---

## Overview

This project implements a **two-stage demand prediction pipeline** for dark stores and quick-commerce operations, inspired by the _FreshRetailNet_ paper. We follow the paper's pipeline architecture but replace the original (computationally heavy) models with lighter alternatives that are faster to train and deploy while remaining competitive in accuracy.

### What Makes This Different from the Paper

| Aspect                  | Original Paper              | Our Implementation          |
| ----------------------- | --------------------------- | --------------------------- |
| Stage 1 (Latent Demand) | TimesNet (deep time-series) | **LightGBM (Tweedie)**      |
| Stage 2 (Forecasting)   | LSTM + LightGBM ensemble    | **MLP + LightGBM ensemble** |
| Hardware requirement    | GPU-heavy                   | CPU-friendly                |

---

## Pipeline Architecture

### Stage 1 — Latent Demand Recovery

Raw sales data from dark stores suffers from **censoring**: on stockout days, observed sales underestimate true demand. Stage 1 recovers the latent (true) demand signal.

- **MNAR Simulation:** Missing-Not-At-Random masking is applied to in-stock days to create a labeled training set.
- **Model:** LightGBM with a Tweedie objective.
- **Features:** Lag/rolling demand statistics, weather (precipitation, temperature, humidity, wind), promotional flags, calendar features, and stockout fraction.
- **Bias Calibration:** A scalar correction factor is computed on in-stock validation rows to remove systematic underestimation bias.
- **Key Metric:** WAPE on the MNAR simulation set. Paper baseline (TimesNet): 27.62%.

### Stage 2 — Censoring-Robust Demand Forecasting

Using recovered demand $D_t$ from Stage 1 as the target, Stage 2 produces a **7-day ahead forecast** per (store, product) pair.

- **Inputs:** 28-day lookback of recovered demand, future-known covariates (promotions, weather, calendar).
- **Models:**
  - _LightGBM_: single stacked multi-horizon model with `feat_horizon` as a feature.
  - _MLP (DemandMLP)_: shallow tabular network with BatchNorm and Softplus activation.
  - _SSA Baseline_: Similar Scenario Average using day-of-week demand profiles.
- **Ensemble:** Weighted blend of LightGBM and MLP predictions, with per-horizon weights $w^*_h$ found by grid search minimising WAPE on in-stock test rows.
- **Bias Calibration:** Per-horizon WPE calibration applied post-ensemble.

---

## Dataset

**FreshRetailNet** — a large-scale real-world retail dataset for fresh produce demand forecasting.

- **Format:** `.parquet` files (`train.parquet`, `eval.parquet`)
- **Key columns:** `sale_amount`, `hours_stock_status`, `stock_hour6_22_cnt`, `discount`, `activity`, `holiday`, weather features, and categorical IDs (city, store, management group, product hierarchy).
- The dataset is **not included** in this repository due to size and licensing. It can be accessed via the original paper's release or Kaggle.

---

## Repository Structure

```
.
├── notebooks/
│   └── demand_prediction-final-stage-1-stage-2-parth-sidhu.ipynb        # Main project notebook (Stages 1 & 2)
│   └── lightgbm-stage-2-trial-1-srijan-gupta.ipynb
|   └── random-forest-stage-1-trial-2-improved-shreya-mohanty.ipynb
|   └── random-forest-stage-1-trial-shreya-mohanty.ipynb
|   └── xg-boost-stage-1-srijan-gupta.ipynb
├── results/
│   ├── stage1/
│   │   ├── stage1_daily_D_t_train.parquet   # Recovered demand (train)
│   │   ├── stage1_daily_D_t_eval.parquet    # Recovered demand (eval)
│   │   └── plots/
│   │       ├── stage1_diagnostics_9panel.png
│   │       └── stage1_demand_recovery.png
│   │
│   └── stage2/
│       ├── stage2_forecasts_eval.parquet    # Final 7-day forecasts (eval)
│       ├── deployment_config.pkl            # Saved model config & weights
│       └── plots/
│           └── stage2_diagnostics.png
│
├── report/
│   └── project_report.pdf             # Final project report
│
├── requirements.txt
├── LICENSE
└── README.md
```

---

## Installation & Usage

### 1. Clone the repository

```bash
git clone https://github.com/<Parth-Sidhu-4>/AI-based-Hyperlocal-Demand-Prediction-for-Dark-Stores-Quick-Commerce.git
cd AI-based-Hyperlocal-Demand-Prediction-for-Dark-Stores-Quick-Commerce
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Place the dataset

Download the FreshRetailNet dataset and place the parquet files at:

```
/kaggle/input/freshretailnet/train.parquet
/kaggle/input/freshretailnet/eval.parquet
```

Or update the `TRAIN_PATH` / `EVAL_PATH` variables in the notebook's **Section 3 (Dataset Paths)**.

### 4. Run the notebook

Open and run `notebooks/demand_prediction.ipynb` sequentially. The notebook is self-contained — Stage 2 loads Stage 1 outputs automatically.

> **Tip:** If the kernel is restarted after Stage 2 training, use the resume cell (Cell 54) to reload trained models from disk instead of retraining (~2 min vs several hours).

---

## Results

### Stage 1 — Demand Recovery

| Metric | Our LightGBM | Paper (TimesNet) |
| ------ | ------------ | ---------------- |
| WAPE   | 27.98%       | 27.62%           |
| WPE    | -6.96%       | −7.37% (raw)     |

### Stage 2 — 7-Day Forecast (Mean across horizons)

| Model        | Mean WAPE   | Mean WPE   |
| ------------ | ----------- | ---------- |
| SSA Baseline | 39.94%      | -11.78%    |
| LightGBM     | 29.36%      | -7.81%     |
| MLP          | 30.69%      | -5.86%     |
| **Ensemble** | **29.30% ** | **-7.35%** |

---

## Dependencies

Key libraries used:

- `pandas`, `numpy`, `scipy`
- `lightgbm`
- `torch` (PyTorch — for MLP)
- `scikit-learn`
- `matplotlib`

See `requirements.txt` for the full pinned list.

---

## References

1. _FreshRetailNet: A Large-Scale Dataset and Benchmark for Fresh Produce Demand Forecasting in Retail_ — original paper whose pipeline this project follows.
2. LightGBM: Ke et al., "LightGBM: A Highly Efficient Gradient Boosting Decision Tree", NeurIPS 2017.

---

## License

This project is released under the [MIT License](LICENSE) for academic purposes.
