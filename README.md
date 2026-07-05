# AI-based Hyperlocal Demand Prediction for Dark Stores & Quick Commerce

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A machine learning pipeline for **latent demand recovery** and **7-day demand forecasting** in quick-commerce and dark store operations, inspired by the **FreshRetailNet** benchmark. This project reproduces the paper's two-stage pipeline using computationally efficient models that can be trained and deployed on commodity hardware.

**Course:** Artificial Intelligence and Machine Learning

**Submitted to:** Dr. Anshika Srivastava, Assistant Professor & Program Coordinator

**Department:** Electronics and Communication Engineering, Gati Shakti Vishwavidyalaya

---

# Group Members

| # | Name | Primary Contribution |
|---|------|----------------------|
| 1 | [Parth Sidhu](https://github.com/Parth-Sidhu-4) | Pipeline design, feature engineering, Stage 1 implementation, LightGBM, model training, experimentation, documentation |
| 2 | [Shreya Mohanty](https://github.com/ShreyaPMohanty6) | Streamlit deployment, deployment artifacts |
| 3 | Srijan Gupta | Baseline experiments (Stage 2 implementation, XGBoost) |
| 4 | [Assir Thota](https://github.com/assirT24) | Dataset study |
| 5 | [Ayush Vaibhav Gond](https://github.com/ayushvg) | 2 - Stage Pipeline Design |

---

# Overview

Demand forecasting for fresh produce is challenging because observed sales often underestimate actual customer demand whenever products go out of stock. This project addresses that problem using a **two-stage forecasting pipeline** based on the methodology proposed in the **FreshRetailNet** paper.

Instead of reproducing the original computationally intensive architecture, we replace it with lightweight machine learning models that deliver competitive performance while significantly reducing training time and hardware requirements.

---

# Project Highlights

- Two-stage demand forecasting pipeline inspired by FreshRetailNet
- Latent demand recovery using LightGBM with Tweedie objective
- Multi-horizon demand forecasting using LightGBM + MLP ensemble
- CPU-friendly implementation requiring no high-end GPU
- End-to-end Streamlit deployment included
- Comprehensive evaluation against the published benchmark
- Modular notebooks for experimentation and reproducibility

---

# Comparison with the Original Paper

| Aspect | Original Paper | Our Implementation |
|---------|----------------|--------------------|
| Stage 1 | TimesNet | **LightGBM (Tweedie)** |
| Stage 2 | LSTM + LightGBM | **MLP + LightGBM Ensemble** |
| Hardware | GPU-intensive | CPU-friendly |
| Training Time | High | Significantly Reduced |
| Deployment | Research Prototype | Streamlit Application |

---

# Pipeline Architecture

## Stage 1: Latent Demand Recovery

Observed retail sales become censored whenever products experience stockouts. Stage 1 reconstructs the underlying latent demand signal.

### Workflow

- Simulate Missing-Not-At-Random (MNAR) censoring
- Train LightGBM using Tweedie objective
- Engineer lag, rolling, weather, promotional, and calendar features
- Learn a bias correction factor using validation data
- Recover daily latent demand

### Features Used

- Lag demand statistics
- Rolling demand statistics
- Weather variables
- Holiday information
- Promotion flags
- Stock availability
- Calendar features

### Evaluation Metric

- **Weighted Absolute Percentage Error (WAPE)**

Paper baseline:

```
27.62%
```

---

## Stage 2: Censoring-Robust Demand Forecasting

Recovered latent demand from Stage 1 becomes the target variable for multi-horizon forecasting.

### Inputs

- Previous 28 days of recovered demand
- Future weather information
- Promotion schedule
- Calendar variables

### Models

- LightGBM
- Multi-Layer Perceptron (DemandMLP)
- Similar Scenario Average (SSA)

### Ensemble

Final predictions are obtained by blending the LightGBM and MLP predictions using horizon-specific optimal weights.

---

# Dataset

This project uses the **FreshRetailNet** dataset.

Dataset characteristics:

- Real-world retail transactions
- Fresh produce demand
- Multiple stores
- Multiple products
- Weather information
- Promotion information
- Inventory availability

The dataset is **not included** in this repository due to licensing and size constraints.

Key files:

```
train.parquet
eval.parquet
```

---

# Repository Structure

```text
.
├── notebooks/
│   ├── demand_prediction-final-stage-1-stage-2-parth-sidhu.ipynb
│   ├── lightgbm-stage-2-trial-1-srijan-gupta.ipynb
│   ├── random-forest-stage-1-trial-shreya-mohanty.ipynb
│   ├── random-forest-stage-1-trial-2-improved-shreya-mohanty.ipynb
│   └── xg-boost-stage-1-srijan-gupta.ipynb
│
├── models-deployment-Shreya/
│   ├── app.py
│   ├── deployment_config.pkl
│   ├── lgb_s2_h*.txt
│   ├── mlp_s2_h*.pt
│   ├── stage1_daily_D_t_eval.parquet
│   ├── stage2_eval_forecasts.parquet
│   ├── stage2_diagnostics.png
│   └── requirements.txt
│
├── report/
│   └── project_report.pdf
│
├── results/
│   ├── stage1/
│   └── stage2/
│
├── team/
│
├── index.html
├── styles.css
├── main.js
├── ppt.js
│
├── requirements.txt
├── LICENSE
└── README.md
```

---

# Deployment

The repository includes a complete **Streamlit deployment** developed by **Shreya Mohanty**.

Location:

```
models-deployment-Shreya/
```

Contents:

- Streamlit application
- Trained LightGBM models
- Trained MLP models
- Deployment configuration
- Forecast outputs
- Deployment-specific dependencies

---

# Installation

## Clone the Repository

```bash
git clone https://github.com/Parth-Sidhu-4/AI-based-Hyperlocal-Demand-Prediction-for-Dark-Stores-Quick-Commerce.git

cd AI-based-Hyperlocal-Demand-Prediction-for-Dark-Stores-Quick-Commerce
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

# Running the Project

## Step 1

Download the FreshRetailNet dataset.

Expected files:

```
train.parquet
eval.parquet
```

---

## Step 2

Update the dataset paths inside

```
notebooks/demand_prediction-final-stage-1-stage-2-parth-sidhu.ipynb
```

or place them under

```
/kaggle/input/freshretailnet/
```

---

## Step 3

Run the notebook sequentially.

The notebook performs:

- Data preprocessing
- Feature engineering
- Stage 1 demand recovery
- Stage 2 forecasting
- Evaluation
- Visualization

If training has already completed, the notebook can reload the saved models instead of retraining.

---

# Results

## Stage 1: Latent Demand Recovery

| Metric | Our Model | Paper |
|---------|-----------|--------|
| WAPE | **27.98%** | **27.62%** |
| WPE | **-6.96%** | **-7.37%** |

---

## Stage 2: Seven-Day Forecasting

| Model | Mean WAPE | Mean WPE |
|--------|----------:|---------:|
| SSA Baseline | 39.94% | -11.78% |
| LightGBM | 29.36% | -7.81% |
| MLP | 30.69% | -5.86% |
| **LightGBM + MLP Ensemble** | **29.30%** | **-7.35%** |

---

# Technologies Used

- Python
- Pandas
- NumPy
- SciPy
- LightGBM
- PyTorch
- Scikit-learn
- Matplotlib
- Streamlit

---

# References

1. **FreshRetailNet: A Large-Scale Dataset and Benchmark for Fresh Produce Demand Forecasting in Retail**

2. Guolin Ke et al.

   **LightGBM: A Highly Efficient Gradient Boosting Decision Tree**

   NeurIPS 2017.

---

# License

This project is released under the **MIT License** for academic purposes.

See the [LICENSE](LICENSE) file for details.

---

# Acknowledgements

We thank **Dr. Anshika Srivastava** for her guidance throughout the Artificial Intelligence and Machine Learning course at **Gati Shakti Vishwavidyalaya**.

This project is based on ideas introduced in the **FreshRetailNet** research paper while presenting our own implementation, experiments, and deployment pipeline.
