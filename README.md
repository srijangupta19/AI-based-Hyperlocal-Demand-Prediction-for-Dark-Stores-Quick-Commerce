# AI-based Hyperlocal Demand Prediction for Dark Stores & Quick Commerce

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Course Project](https://img.shields.io/badge/Project-Course%20Project-success)

A machine learning pipeline for **latent demand recovery** and **7-day demand forecasting** in quick-commerce and dark store operations, inspired by the **FreshRetailNet** benchmark. This project reproduces the paper's two-stage pipeline using computationally efficient models that can be trained and deployed on commodity hardware.

**Course:** Artificial Intelligence and Machine Learning

**Submitted to:** Dr. Anshika Srivastava, Assistant Professor & Program Coordinator

**Department:** Electronics and Communication Engineering, Gati Shakti Vishwavidyalaya

---

# Group Members

| # | Name | Primary Contribution |
|---|------|----------------------|
| 1 | [Parth Sidhu](https://github.com/Parth-Sidhu-4) | Pipeline design, feature engineering, Stage 1 implementation, model development, experimentation, documentation |
| 2 | [Shreya Mohanty](https://github.com/ShreyaPMohanty6) | Streamlit deployment, model packaging, deployment artifacts |
| 3 | Srijan Gupta | Baseline experiments, Stage 2 exploration, XGBoost implementation |
| 4 | [Assir Thota](https://github.com/assirT24) | Dataset analysis and preprocessing support |
| 5 | [Ayush Vaibhav Gond](https://github.com/ayushvg) | Two-stage pipeline study and methodology |

---

# Overview

Demand forecasting for fresh produce is challenging because observed sales often underestimate actual customer demand whenever products experience stockouts. This project addresses that problem using a **two-stage forecasting pipeline** based on the methodology proposed in the **FreshRetailNet** paper.

Instead of reproducing the original computationally intensive architecture, we replace it with lightweight machine learning models that deliver competitive performance while significantly reducing training time and hardware requirements.

---

# Workflow

```text
                   FreshRetailNet Dataset
                           │
                           ▼
               Data Preprocessing & Feature Engineering
                           │
                           ▼
             Stage 1: Latent Demand Recovery
                 (LightGBM - Tweedie Loss)
                           │
                   Recovered Demand (Dₜ)
                           │
                           ▼
        Stage 2: Multi-Horizon Demand Forecasting
            (LightGBM + MLP + SSA Baseline)
                           │
                           ▼
          Weighted Ensemble & Bias Calibration
                           │
                           ▼
                 7-Day Demand Forecasts
                           │
                           ▼
              Streamlit Deployment Application
```

---

# Project Highlights

- Two-stage demand forecasting pipeline inspired by the FreshRetailNet benchmark.
- Latent demand recovery using **LightGBM** with a Tweedie objective.
- Multi-horizon forecasting using an **MLP + LightGBM ensemble**.
- CPU-friendly implementation requiring no high-end GPU.
- End-to-end **Streamlit deployment** included.
- Comprehensive evaluation against the published benchmark.
- Modular notebooks for experimentation and reproducibility.

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

- Simulate Missing-Not-At-Random (MNAR) censoring.
- Train LightGBM using the Tweedie objective.
- Engineer lag, rolling, weather, promotional, and calendar features.
- Learn a scalar bias correction factor using validation data.
- Recover the latent daily demand.

### Features Used

- Lag demand statistics
- Rolling demand statistics
- Weather variables
- Holiday information
- Promotion flags
- Stock availability
- Calendar features

### Evaluation Metric

**Weighted Absolute Percentage Error (WAPE)**

**Paper Baseline:** **27.62%**

---

## Stage 2: Censoring-Robust Demand Forecasting

Recovered latent demand from Stage 1 becomes the target variable for multi-horizon forecasting.

### Inputs

- Previous 28 days of recovered demand
- Future weather information
- Promotion schedules
- Calendar variables

### Models

- **LightGBM**
- **DemandMLP (PyTorch)**
- **SSA (Similar Scenario Average)**

### Ensemble Strategy

Final predictions are generated by blending the LightGBM and MLP outputs using horizon-specific optimal weights selected through validation.

---
# Dataset

This project uses **FreshRetailNet-50K**, a large-scale benchmark dataset for censored demand estimation in fresh retail. The dataset contains **50,000 store-product time series**, collected from **898 stores across 18 major cities**, with detailed hourly sales records, stockout annotations, promotional information, weather variables, and other contextual features. It was introduced to support research in latent demand recovery and robust demand forecasting under stockout conditions. :contentReference[oaicite:0]{index=0}

The dataset is **not included** in this repository due to licensing and file size constraints.

### Dataset Resources

- **Research Paper:** https://arxiv.org/abs/2505.16319
- **Dataset:** https://huggingface.co/datasets/Dingdong-Inc/FreshRetailNet-50K
- **Official Baseline Repository:** https://github.com/Dingdong-Inc/frn-50k-baseline

### Dataset Characteristics

- Large-scale real-world retail transactions
- Fresh produce demand
- Multiple stores and products
- Weather information
- Promotional campaigns
- Inventory availability
- Calendar metadata

Expected dataset files:

```text
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
├── deployment/
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

The repository includes a complete **Streamlit deployment** contributed by **Shreya Mohanty**.

Location:

```text
deployment/
```

Contents include:

- Streamlit web application (`app.py`)
- Trained LightGBM models
- Trained MLP models
- Deployment configuration
- Saved evaluation outputs
- Deployment-specific dependencies

The deployment folder contains everything required to launch the trained forecasting models through a Streamlit interface without retraining.

---

# Installation

## 1. Clone the Repository

```bash
git clone https://github.com/Parth-Sidhu-4/AI-based-Hyperlocal-Demand-Prediction-for-Dark-Stores-Quick-Commerce.git

cd AI-based-Hyperlocal-Demand-Prediction-for-Dark-Stores-Quick-Commerce
```

---

## 2. Install Dependencies

```bash
pip install -r requirements.txt
```

---

# Running the Project

## Step 1: Download the Dataset

Download the **FreshRetailNet** dataset.

Expected files:

```text
train.parquet
eval.parquet
```

---

## Step 2: Configure Dataset Paths

Either:

- Place the dataset inside

```text
/kaggle/input/freshretailnet/
```

or

- Update the dataset paths inside

```text
notebooks/demand_prediction-final-stage-1-stage-2-parth-sidhu.ipynb
```

---

## Step 3: Execute the Notebook

Run the notebook sequentially.

The notebook performs:

- Data preprocessing
- Feature engineering
- Stage 1 latent demand recovery
- Stage 2 demand forecasting
- Model evaluation
- Visualization

If models have already been trained, the notebook can reload saved model checkpoints instead of retraining.

---

# Results

## Stage 1: Latent Demand Recovery

| Metric | Our Model | FreshRetailNet Paper |
|---------|----------:|---------------------:|
| WAPE | **27.98%** | **27.62%** |
| WPE | **-6.96%** | **-7.37%** |

---

## Stage 2: Seven-Day Demand Forecasting

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

1. Wang, Y., Gu, J., Long, L., Li, X., Shen, L., Fu, Z., Zhou, X., & Jiang, X. (2025).

   **FreshRetailNet-50K: A Stockout-Annotated Censored Demand Dataset for Latent Demand Recovery and Forecasting in Fresh Retail.**

   *arXiv preprint arXiv:2505.16319.*

2. Ke, G., Meng, Q., Finley, T., Wang, T., Chen, W., Ma, W., Ye, Q., & Liu, T. (2017).

   **LightGBM: A Highly Efficient Gradient Boosting Decision Tree.**

   *Advances in Neural Information Processing Systems (NeurIPS).*

3. Official FreshRetailNet-50K Resources

   - Dataset: https://huggingface.co/datasets/Dingdong-Inc/FreshRetailNet-50K
   - Baseline Implementation: https://github.com/Dingdong-Inc/frn-50k-baseline

---

# License

This project is released under the **MIT License** for academic purposes.

See the [LICENSE](LICENSE) file for details.

---

# Acknowledgements

We sincerely thank **Dr. Anshika Srivastava**, Assistant Professor and Program Coordinator, Gati Shakti Vishwavidyalaya, for her guidance and mentorship throughout the Artificial Intelligence and Machine Learning course.

This project is inspired by the **FreshRetailNet** benchmark while presenting our own implementation, experimentation, evaluation, and deployment pipeline.

---

# Citation

If you use this repository in your research or coursework, please also cite the original **FreshRetailNet-50K** paper:

```bibtex
@article{wang2025freshretailnet50k,
  title={FreshRetailNet-50K: A Stockout-Annotated Censored Demand Dataset for Latent Demand Recovery and Forecasting in Fresh Retail},
  author={Yangyang Wang and Jiawei Gu and Li Long and Xin Li and Li Shen and Zhouyu Fu and Xiangjun Zhou and Xu Jiang},
  journal={arXiv preprint arXiv:2505.16319},
  year={2025}
}
```

> **Academic Notice**
>
> This repository was developed as part of the Artificial Intelligence and Machine Learning coursework at **Gati Shakti Vishwavidyalaya**. It is intended solely for educational, research, and demonstration purposes.
