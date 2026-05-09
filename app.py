import warnings
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------
# App config
# ---------------------------------------------------------------------
st.set_page_config(
    page_title="🚀 Demand Forecast Dashboard",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ---------------------------------------------------------------------
# Styling (kept close to the original)
# ---------------------------------------------------------------------
st.markdown(
    """
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: bold;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 2rem;
    }
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1.5rem;
        border-radius: 10px;
        color: white;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .alert-high {
        background-color: #ff4444;
        padding: 1rem;
        border-radius: 5px;
        color: white;
        font-weight: bold;
    }
    .alert-medium {
        background-color: #ffaa00;
        padding: 1rem;
        border-radius: 5px;
        color: white;
        font-weight: bold;
    }
    .alert-low {
        background-color: #00C851;
        padding: 1rem;
        border-radius: 5px;
        color: white;
        font-weight: bold;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 2rem;
    }
    .stTabs [data-baseweb="tab"] {
        height: 50px;
        padding-left: 20px;
        padding-right: 20px;
    }
</style>
""",
    unsafe_allow_html=True,
)

# ---------------------------------------------------------------------
# Schema helpers
# ---------------------------------------------------------------------
STAGE1_MARKERS = {
    "sale_amount",
    "recovery_uplift",
    "mean_sales_mu",
    "discount",
    "activity_flag",
    "holiday_flag",
    "precpt",
    "avg_temperature",
    "avg_humidity",
    "avg_wind_level",
    "first_stockout_hour",
    "stockout_in_peak",
}
STAGE2_MARKERS = {
    "ens_h1",
    "ens_h2",
    "ens_h3",
    "ens_h4",
    "ens_h5",
    "ens_h6",
    "ens_h7",
    "lgb_h1",
    "lgb_h2",
    "lgb_h3",
    "lgb_h4",
    "lgb_h5",
    "lgb_h6",
    "lgb_h7",
}

BASE_ID_COLS = [
    "city_id",
    "store_id",
    "management_group_id",
    "first_category_id",
    "second_category_id",
    "third_category_id",
    "product_id",
    "dt",
]

FORECAST_HORIZON = 7
EPS = 1e-9


def safe_corr(a: pd.Series, b: pd.Series) -> float:
    x = pd.to_numeric(a, errors="coerce")
    y = pd.to_numeric(b, errors="coerce")
    mask = x.notna() & y.notna()
    if mask.sum() < 3:
        return 0.0
    x = x[mask]
    y = y[mask]
    if x.nunique() < 2 or y.nunique() < 2:
        return 0.0
    val = x.corr(y)
    if pd.isna(val):
        return 0.0
    return float(val)


def parquet_columns(path: Path) -> list[str]:
    try:
        import pyarrow.parquet as pq

        return list(pq.ParquetFile(path).schema.names)
    except Exception:
        # Fallback: read once if pyarrow schema inspection is unavailable
        return list(pd.read_parquet(path).columns)


@st.cache_data(show_spinner=False)
def discover_parquet_paths(base_dir: str = ".") -> tuple[str, str]:
    files = sorted(Path(base_dir).rglob("*.parquet"))
    if not files:
        raise FileNotFoundError(
            "No parquet files found. Put your Stage 1 and Stage 2 parquet files in the same folder as app.py "
            "or set the working directory accordingly."
        )

    scored = []
    for path in files:
        cols = set(parquet_columns(path))
        stage1_score = len(cols & STAGE1_MARKERS)
        stage2_score = len(cols & STAGE2_MARKERS)
        scored.append((stage1_score, stage2_score, path))

    stage1_path = max(scored, key=lambda x: (x[0], -x[1], -len(str(x[2]))))[2]
    stage2_path = max(scored, key=lambda x: (x[1], -x[0], -len(str(x[2]))))[2]

    if stage1_path == stage2_path:
        # If one file happens to match both, keep the best stage1 and try to find another stage2
        others = [x for x in scored if x[2] != stage1_path]
        if others:
            stage2_path = max(others, key=lambda x: (x[1], -x[0], -len(str(x[2]))))[2]

    return str(stage1_path), str(stage2_path)


@st.cache_data(show_spinner=False)
def read_stage1() -> pd.DataFrame:
    stage1_path, _ = discover_parquet_paths()
    df = pd.read_parquet(stage1_path)
    df = df.copy()
    if "first_category_id" not in df.columns:
        raise KeyError("Stage 1 file must contain first_category_id.")
    if "sale_amount" not in df.columns:
        raise KeyError("Stage 1 file must contain sale_amount.")
    if "recovered_demand" not in df.columns:
        raise KeyError("Stage 1 file must contain recovered_demand.")

    # Convert dt to datetime
    df["dt"] = pd.to_datetime(df["dt"])
    df["category"] = df["first_category_id"]
    df["product_name"] = "Product_" + df["product_id"].astype(str)
    df["lost_sales"] = (df["recovered_demand"] - df["sale_amount"]).clip(lower=0)
    return df


@st.cache_data(show_spinner=False)
def read_stage2() -> pd.DataFrame:
    _, stage2_path = discover_parquet_paths()
    df = pd.read_parquet(stage2_path)
    df = df.copy()

    ens_cols = [f"ens_h{i}" for i in range(1, FORECAST_HORIZON + 1) if f"ens_h{i}" in df.columns]
    lgb_cols = [f"lgb_h{i}" for i in range(1, FORECAST_HORIZON + 1) if f"lgb_h{i}" in df.columns]

    if ens_cols:
        forecast_cols = ens_cols
        source_name = "ensemble"
    elif lgb_cols:
        forecast_cols = lgb_cols
        source_name = "lightgbm"
    else:
        raise KeyError(
            "Stage 2 file must contain either ens_h1..ens_h7 or lgb_h1..lgb_h7."
        )

    id_vars = [c for c in df.columns if c not in forecast_cols]
    long_df = df.melt(
        id_vars=id_vars,
        value_vars=forecast_cols,
        var_name="horizon",
        value_name="predicted_demand",
    )
    long_df["horizon"] = long_df["horizon"].str.extract(r"(\d+)").astype(int)
    long_df["dt"] = pd.to_datetime(long_df["dt"])
    long_df["forecast_date"] = long_df["dt"] + pd.to_timedelta(long_df["horizon"], unit="D")
    long_df["category"] = long_df["first_category_id"]
    long_df["product_name"] = "Product_" + long_df["product_id"].astype(str)
    long_df["forecast_source"] = source_name

    return long_df


@st.cache_data(show_spinner=False)
def build_stage1_product_stats(stage1_df: pd.DataFrame) -> pd.DataFrame:
    agg = stage1_df.groupby("product_id", as_index=False).agg(
        baseline_sales_mu=("mean_sales_mu", "mean"),
        service_level=("in_stock", "mean"),
        stockout_peak_rate=("stockout_in_peak", "mean"),
        avg_recovery_uplift=("recovery_uplift", "mean"),
        avg_discount=("discount", "mean"),
        avg_activity_flag=("activity_flag", "mean"),
        avg_holiday_flag=("holiday_flag", "mean"),
        avg_precpt=("precpt", "mean"),
        avg_temperature=("avg_temperature", "mean"),
        avg_humidity=("avg_humidity", "mean"),
        avg_wind_level=("avg_wind_level", "mean"),
        avg_sale_amount=("sale_amount", "mean"),
        avg_recovered_demand=("recovered_demand", "mean"),
        avg_lost_sales=("lost_sales", "mean"),
        category=("first_category_id", "first"),
    )

    agg["lost_sales_rate"] = agg["avg_lost_sales"] / (agg["avg_recovered_demand"] + EPS)
    agg["stock_health_score"] = (
        agg["service_level"].fillna(0) * (1 - agg["stockout_peak_rate"].fillna(0))
    ).clip(0, 1)
    return agg


@st.cache_data(show_spinner=False)
def build_stage1_category_stats(stage1_df: pd.DataFrame) -> pd.DataFrame:
    drivers = [
        "precpt",
        "avg_temperature",
        "avg_humidity",
        "avg_wind_level",
        "discount",
        "activity_flag",
        "holiday_flag",
    ]

    rows = []
    for cat, sub in stage1_df.groupby("first_category_id"):
        row = {
            "category": cat,
            "n_rows": len(sub),
            "avg_recovered_demand": float(sub["recovered_demand"].mean()),
            "avg_sale_amount": float(sub["sale_amount"].mean()),
            "avg_lost_sales": float((sub["recovered_demand"] - sub["sale_amount"]).clip(lower=0).mean()),
            "avg_recovery_uplift": float(sub["recovery_uplift"].mean()),
            "avg_discount": float(sub["discount"].mean()),
            "avg_precpt": float(sub["precpt"].mean()),
            "avg_temperature": float(sub["avg_temperature"].mean()),
            "avg_humidity": float(sub["avg_humidity"].mean()),
            "avg_wind_level": float(sub["avg_wind_level"].mean()),
        }
        for d in drivers:
            row[f"corr_{d}"] = safe_corr(sub["recovered_demand"], sub[d])
        rows.append(row)

    return pd.DataFrame(rows)


@st.cache_data(show_spinner=False)
def enrich_stage2_with_stage1(stage2_long: pd.DataFrame, stage1_stats: pd.DataFrame) -> pd.DataFrame:
    keep_cols = [
        "product_id",
        "baseline_sales_mu",
        "service_level",
        "stockout_peak_rate",
        "avg_recovery_uplift",
        "avg_discount",
        "avg_activity_flag",
        "avg_holiday_flag",
        "avg_precpt",
        "avg_temperature",
        "avg_humidity",
        "avg_wind_level",
        "avg_sale_amount",
        "avg_recovered_demand",
        "avg_lost_sales",
        "lost_sales_rate",
        "stock_health_score",
    ]
    return stage2_long.merge(stage1_stats[keep_cols], on="product_id", how="left")


@st.cache_data(show_spinner=False)
def calculate_surge_products(forecasts_df: pd.DataFrame, threshold: float = 3.0) -> pd.DataFrame:
    df = forecasts_df.copy()
    baseline = df["baseline_sales_mu"].fillna(df["predicted_demand"].groupby(df["product_id"]).transform("mean"))
    surge = df[df["predicted_demand"] > threshold * baseline].copy()
    surge["surge_ratio"] = surge["predicted_demand"] / (baseline.loc[surge.index] + EPS)
    return surge.sort_values("surge_ratio", ascending=False)


@st.cache_data(show_spinner=False)
def calculate_stockout_risk(forecasts_df: pd.DataFrame) -> pd.DataFrame:
    product_forecast = forecasts_df.groupby(
        ["product_id", "product_name", "category"], as_index=False
    ).agg(
        predicted_demand=("predicted_demand", "mean"),
        forecast_7day=("predicted_demand", "sum"),
        baseline_sales_mu=("baseline_sales_mu", "first"),
        service_level=("service_level", "first"),
        stockout_peak_rate=("stockout_peak_rate", "first"),
        avg_lost_sales=("avg_lost_sales", "first"),
        stock_health_score=("stock_health_score", "first"),
    )

    product_forecast["baseline_sales_mu"] = product_forecast["baseline_sales_mu"].fillna(
        product_forecast["predicted_demand"]
    )
    product_forecast["service_level"] = product_forecast["service_level"].fillna(0.5)
    product_forecast["stockout_peak_rate"] = product_forecast["stockout_peak_rate"].fillna(0.0)
    product_forecast["stock_health_score"] = product_forecast["stock_health_score"].fillna(
        product_forecast["service_level"] * (1 - product_forecast["stockout_peak_rate"])
    )

    demand_pressure = product_forecast["predicted_demand"] / (product_forecast["baseline_sales_mu"] + EPS)
    protection = product_forecast["stock_health_score"].clip(0.05, 1.0)
    product_forecast["days_of_cover"] = np.clip(7 * protection / np.clip(demand_pressure, 0.25, None), 0, 30)

    product_forecast["risk_level"] = pd.cut(
        product_forecast["days_of_cover"],
        bins=[-np.inf, 1, 3, 7, np.inf],
        labels=["CRITICAL (<24h)", "HIGH (1-3 days)", "MEDIUM (3-7 days)", "LOW (>7 days)"],
    )

    product_forecast["estimated_stock_proxy"] = (
        product_forecast["baseline_sales_mu"] * 7 * protection
    )

    return product_forecast.sort_values("days_of_cover")


@st.cache_data(show_spinner=False)
def calculate_lost_revenue(stage1_df: pd.DataFrame, avg_price: float = 15.0) -> pd.DataFrame:
    df = stage1_df.copy()
    df["lost_sales"] = (df["recovered_demand"] - df["sale_amount"]).clip(lower=0)
    df["lost_revenue"] = df["lost_sales"] * avg_price

    summary = df.groupby("category", as_index=False).agg(
        lost_sales=("lost_sales", "sum"),
        lost_revenue=("lost_revenue", "sum"),
    )
    return summary.sort_values("lost_revenue", ascending=False)


@st.cache_data(show_spinner=False)
def daily_weather_summary(stage1_df: pd.DataFrame) -> pd.DataFrame:
    cols = ["precpt", "avg_temperature", "avg_humidity", "avg_wind_level"]
    available = [c for c in cols if c in stage1_df.columns]
    if not available:
        return pd.DataFrame(columns=["dt"] + cols)

    daily = stage1_df.groupby("dt", as_index=False)[available].mean(numeric_only=True)
    return daily.sort_values("dt")


def compute_scenario_factors(
    stage1_df: pd.DataFrame,
    category_stats: pd.DataFrame,
    rainfall: float,
    temperature: float,
    humidity: float,
    wind_level: float,
    discount: float,
    is_promotion: bool,
    is_holiday: bool,
) -> pd.DataFrame:
    baselines = stage1_df[[
        "precpt",
        "avg_temperature",
        "avg_humidity",
        "avg_wind_level",
        "discount",
        "holiday_flag",
        "activity_flag",
        "recovery_uplift",
    ]].mean(numeric_only=True)

    rows = []
    for _, r in category_stats.iterrows():
        # Data-driven sensitivity terms from historical category correlations
        w_precpt = r.get("corr_precpt", 0.0)
        w_temp = r.get("corr_avg_temperature", 0.0)
        w_hum = r.get("corr_avg_humidity", 0.0)
        w_wind = r.get("corr_avg_wind_level", 0.0)
        w_disc = r.get("corr_discount", 0.0)
        w_act = r.get("corr_activity_flag", 0.0)
        w_hol = r.get("corr_holiday_flag", 0.0)

        # Scaled deviations from real historical baselines
        delta_precpt = (rainfall - baselines["precpt"]) / (abs(baselines["precpt"]) + 1.0)
        delta_temp = (temperature - baselines["avg_temperature"]) / 10.0
        delta_hum = (humidity - baselines["avg_humidity"]) / 10.0
        delta_wind = (wind_level - baselines["avg_wind_level"]) / 2.0
        delta_disc = (discount - baselines["discount"]) / 100.0
        delta_promo = 1.0 if is_promotion else 0.0
        delta_holiday = float(is_holiday) - float(baselines["holiday_flag"])

        score = (
            w_precpt * delta_precpt
            + w_temp * delta_temp
            + w_hum * delta_hum
            + w_wind * delta_wind
            + w_disc * delta_disc
            + w_act * delta_promo
            + w_hol * delta_holiday
        )

        factor = max(0.25, 1.0 + 0.25 * score)

        top_driver = max(
            [
                ("precpt", abs(w_precpt)),
                ("temperature", abs(w_temp)),
                ("humidity", abs(w_hum)),
                ("wind", abs(w_wind)),
                ("discount", abs(w_disc)),
                ("promotion/activity", abs(w_act)),
                ("holiday", abs(w_hol)),
            ],
            key=lambda x: x[1],
        )[0]

        reason_parts = []
        if abs(w_precpt) > 0.15:
            reason_parts.append(f"rain sensitivity {w_precpt:+.2f}")
        if abs(w_temp) > 0.15:
            reason_parts.append(f"temp sensitivity {w_temp:+.2f}")
        if abs(w_disc) > 0.15:
            reason_parts.append(f"discount sensitivity {w_disc:+.2f}")
        if is_holiday:
            reason_parts.append("holiday active")

        rows.append(
            {
                "Category": int(r["category"]),
                "Impact Factor": f"{factor:.2f}x",
                "Change": f"{(factor - 1) * 100:+.1f}%",
                "Reason": f"Top driver: {top_driver}" + (f" | {', '.join(reason_parts)}" if reason_parts else ""),
                "factor": factor,
            }
        )

    return pd.DataFrame(rows).sort_values("factor", ascending=False)


# ---------------------------------------------------------------------
# Main app
# ---------------------------------------------------------------------
def main():
    st.markdown(
        '<h1 class="main-header">🚀 AI-Powered Demand Forecasting Dashboard</h1>',
        unsafe_allow_html=True,
    )
    st.markdown(
        "**Hyperlocal Quick Commerce** | Stage 1: Demand Recovery + Stage 2: 7-Day Forecast"
    )

    with st.spinner("Loading real parquet data..."):
        stage1_df = read_stage1()
        stage2_df = read_stage2()
        stage1_stats = build_stage1_product_stats(stage1_df)
        category_stats = build_stage1_category_stats(stage1_df)
        stage2_df = enrich_stage2_with_stage1(stage2_df, stage1_stats)
        weather_df = daily_weather_summary(stage1_df)

    # Get date range from actual data
    min_forecast_date = stage2_df['forecast_date'].min().date()
    max_forecast_date = stage2_df['forecast_date'].max().date()

    # Sidebar filters
    st.sidebar.title("🎛️ Control Panel")
    st.sidebar.markdown("---")

    # ✅ Store filter FIRST
    stores = sorted(stage2_df['store_id'].unique().tolist())
    selected_store = st.sidebar.selectbox("🏪 Store", stores, key="store_select")

    # ✅ Filter data by store
    filtered_forecasts = stage2_df[
       stage2_df['store_id'] == selected_store
    ].copy()

    filtered_stage1 = stage1_df[
       stage1_df['store_id'] == selected_store
    ].copy()

    # ✅ Category filter (based on selected store)
    categories = ['All Categories'] + sorted(filtered_forecasts['category'].unique().tolist())
    selected_category = st.sidebar.selectbox("📦 Category Filter", categories, key="category_select")

    # Apply category filter
    if selected_category != 'All Categories':
       filtered_forecasts = filtered_forecasts[
        filtered_forecasts['category'] == selected_category
    ]
       filtered_stage1 = filtered_stage1[
        filtered_stage1['category'] == selected_category
    ]

    # Date range - using actual data range
    st.sidebar.markdown("### 📅 Forecast Period")
    start_date = st.sidebar.date_input(
        "Start Date", 
        value=min_forecast_date,
        min_value=min_forecast_date,
        max_value=max_forecast_date,
        key="start_date"
    )
    end_date = st.sidebar.date_input(
        "End Date", 
        value=max_forecast_date,
        min_value=min_forecast_date,
        max_value=max_forecast_date,
        key="end_date"
    )

    # Filter by date range
    filtered_forecasts = filtered_forecasts[
        (filtered_forecasts['forecast_date'].dt.date >= start_date) &
        (filtered_forecasts['forecast_date'].dt.date <= end_date)
    ]

    tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs(
        [
            "📊 Demand Overview",
            "⚠️ Stockout Countdown",
            "💰 Lost Sales Audit",
            "🎮 What-If Simulator",
            "📋 Replenishment List",
            "🌡️ Weather Impact",
        ]
    )

    # TAB 1
    with tab1:
        st.header("📊 Next 7-Day Demand Forecast")

        col1, col2, col3, col4 = st.columns(4)

        total_forecast = filtered_forecasts["predicted_demand"].sum()
        avg_daily = filtered_forecasts.groupby("forecast_date")["predicted_demand"].sum().mean()

        surge_count = len(calculate_surge_products(filtered_forecasts, threshold=2.5))

        risk_df = calculate_stockout_risk(filtered_forecasts)
        critical_count = len(risk_df[risk_df["risk_level"] == "CRITICAL (<24h)"])

        with col1:
            st.metric("📦 Total Forecasted Demand", f"{total_forecast:,.0f} units")
        with col2:
            st.metric("📈 Avg Daily Demand", f"{avg_daily:,.0f} units/day")
        with col3:
            st.metric("🔥 Surge Alerts", surge_count)
        with col4:
            st.metric("⚠️ Critical Stock Items", critical_count)

        st.markdown("---")

        daily_demand = (
            filtered_forecasts.groupby("forecast_date", as_index=False)
            .agg(predicted_demand=("predicted_demand", "sum"))
            .sort_values("forecast_date")
        )

        fig_daily = go.Figure()
        fig_daily.add_trace(
            go.Bar(
                x=daily_demand["forecast_date"],
                y=daily_demand["predicted_demand"],
                marker_color="#667eea",
                name="Forecasted Demand",
                text=daily_demand["predicted_demand"].round(0),
                textposition="outside",
                hovertemplate="<b>%{x|%A, %b %d}</b><br>Demand: %{y:,.0f} units<extra></extra>",
            )
        )
        fig_daily.update_layout(
            title="Daily Demand Forecast - Selected Period",
            xaxis_title="Date",
            yaxis_title="Predicted Demand (units)",
            height=400,
            hovermode="x unified",
            showlegend=False,
        )
        st.plotly_chart(fig_daily, use_container_width=True)

        st.subheader("📊 Demand by Category")
        category_demand = (
            filtered_forecasts.groupby("category", as_index=False)
            .agg(predicted_demand=("predicted_demand", "sum"))
            .sort_values("predicted_demand", ascending=False)
        )
        category_demand["category"] = category_demand["category"].astype(str)

        fig_cat = px.pie(
            category_demand,
            values="predicted_demand",
            names="category",
            title="Forecast Distribution by Category ID",
            hole=0.4,
            color_discrete_sequence=px.colors.qualitative.Set3,
        )
        fig_cat.update_traces(textposition="inside", textinfo="percent+label")
        st.plotly_chart(fig_cat, use_container_width=True)

        st.markdown("---")
        st.subheader("🔥 Surge Alert - Products with Unusual Demand Spikes")
        surge_threshold = st.slider("Surge Threshold (multiple of average)", 1.5, 5.0, 2.5, 0.5, key="surge_threshold")

        surge_products = calculate_surge_products(filtered_forecasts, threshold=surge_threshold)
        if len(surge_products) > 0:
            st.warning(
                f"⚠️ **{len(surge_products)} products** have forecasted demand > {surge_threshold}x their historical average!"
            )
            top_surge = surge_products.head(10)[
                [
                    "product_name",
                    "category",
                    "predicted_demand",
                    "baseline_sales_mu",
                    "surge_ratio",
                    "forecast_date",
                ]
            ].copy()
            top_surge["surge_ratio"] = top_surge["surge_ratio"].round(2)
            top_surge["predicted_demand"] = top_surge["predicted_demand"].round(0)
            top_surge["baseline_sales_mu"] = top_surge["baseline_sales_mu"].round(1)

            st.dataframe(
                top_surge,
                column_config={
                    "product_name": "Product",
                    "category": "Category ID",
                    "predicted_demand": st.column_config.NumberColumn("Forecasted Demand", format="%d"),
                    "baseline_sales_mu": st.column_config.NumberColumn("Historical Avg Demand", format="%.1f"),
                    "surge_ratio": st.column_config.NumberColumn("Surge Ratio", format="%.2fx"),
                    "forecast_date": st.column_config.DateColumn("Date"),
                },
                hide_index=True,
                use_container_width=True,
            )
            st.info(
                "💡 **Manager Action**: Pre-position inventory and staffing for products/categories with unusually high forecast ratios."
            )
        else:
            st.success("✅ No unusual demand surges detected for the selected period.")

    # TAB 2
    with tab2:
        st.header("⚠️ Stockout Countdown - Predictive Alerts")
        st.markdown(
            "**Stockout proxy**: Based on historical in-stock rate, stockout peak rate, and 7-day demand pressure from the real data."
        )

        risk_df = calculate_stockout_risk(filtered_forecasts)

        col1, col2, col3, col4 = st.columns(4)
        critical = len(risk_df[risk_df["risk_level"] == "CRITICAL (<24h)"])
        high = len(risk_df[risk_df["risk_level"] == "HIGH (1-3 days)"])
        medium = len(risk_df[risk_df["risk_level"] == "MEDIUM (3-7 days)"])
        low = len(risk_df[risk_df["risk_level"] == "LOW (>7 days)"])

        with col1:
            st.markdown(
                f'<div class="alert-high">🚨 CRITICAL<br>{critical} items<br>< 24 hours</div>',
                unsafe_allow_html=True,
            )
        with col2:
            st.markdown(
                f'<div class="alert-medium">⚠️ HIGH<br>{high} items<br>1-3 days</div>',
                unsafe_allow_html=True,
            )
        with col3:
            st.markdown(
                f'<div style="background-color: #ffbb33; padding: 1rem; border-radius: 5px; color: white; font-weight: bold; text-align: center;">📊 MEDIUM<br>{medium} items<br>3-7 days</div>',
                unsafe_allow_html=True,
            )
        with col4:
            st.markdown(
                f'<div class="alert-low">✅ LOW<br>{low} items<br>> 7 days</div>',
                unsafe_allow_html=True,
            )

        st.markdown("---")

        fig_risk = go.Figure()
        color_map = {
            "CRITICAL (<24h)": "#ff4444",
            "HIGH (1-3 days)": "#ffaa00",
            "MEDIUM (3-7 days)": "#ffbb33",
            "LOW (>7 days)": "#00C851",
        }

        for risk_level in risk_df["risk_level"].dropna().unique():
            subset = risk_df[risk_df["risk_level"] == risk_level].head(20)
            fig_risk.add_trace(
                go.Bar(
                    x=subset["product_name"],
                    y=subset["days_of_cover"],
                    name=str(risk_level),
                    marker_color=color_map.get(str(risk_level), "#999"),
                    hovertemplate="<b>%{x}</b><br>Days of Cover: %{y:.1f}<extra></extra>",
                )
            )

        fig_risk.update_layout(
            title="Top Products by Stockout Risk (sorted by urgency)",
            xaxis_title="Product",
            yaxis_title="Days of Cover (proxy from real data)",
            height=500,
            barmode="group",
            hovermode="x unified",
        )
        st.plotly_chart(fig_risk, use_container_width=True)

        st.subheader("📋 Detailed Stockout Risk Table")
        display_df = risk_df[
            [
                "product_name",
                "category",
                "estimated_stock_proxy",
                "predicted_demand",
                "days_of_cover",
                "risk_level",
            ]
        ].copy()
        display_df["estimated_stock_proxy"] = display_df["estimated_stock_proxy"].round(0)
        display_df["predicted_demand"] = display_df["predicted_demand"].round(1)
        display_df["days_of_cover"] = display_df["days_of_cover"].round(1)

        st.dataframe(
            display_df,
            column_config={
                "product_name": "Product",
                "category": "Category ID",
                "estimated_stock_proxy": st.column_config.NumberColumn(
                    "Estimated Stock Proxy", format="%.0f units"
                ),
                "predicted_demand": st.column_config.NumberColumn(
                    "Avg Daily Forecast", format="%.1f units/day"
                ),
                "days_of_cover": st.column_config.NumberColumn("Days of Cover", format="%.1f days"),
                "risk_level": st.column_config.TextColumn("Risk Level"),
            },
            hide_index=True,
            use_container_width=True,
            height=400,
        )

        csv = display_df.to_csv(index=False)
        st.download_button(
            label="📥 Download Stockout Risk Report (CSV)",
            data=csv,
            file_name=f"stockout_risk_{datetime.now().strftime('%Y%m%d')}.csv",
            mime="text/csv",
        )

    # TAB 3
    with tab3:
        st.header("💰 Lost Sales Audit - Ghost Revenue Recovery")
        st.markdown("**Stage 1 Demand Recovery**: How much revenue did we miss due to stockouts?")

        avg_price = st.number_input("💵 Average Product Price (₹)", min_value=1.0, value=15.0, step=1.0, key="avg_price")

        lost_revenue_df = calculate_lost_revenue(filtered_stage1, avg_price=avg_price)

        col1, col2, col3 = st.columns(3)
        total_lost_sales = filtered_stage1["lost_sales"].sum()
        total_lost_revenue = total_lost_sales * avg_price
        avg_recovery_rate = filtered_stage1["recovery_uplift"].mean()

        with col1:
            st.metric("📦 Total Lost Sales", f"{total_lost_sales:,.0f} units")
        with col2:
            st.metric("💰 Total Lost Revenue", f"₹{total_lost_revenue:,.0f}")
        with col3:
            st.metric("📈 Avg Recovery Uplift", f"{avg_recovery_rate:.1f}%")

        st.markdown("---")

        fig_lost = go.Figure()
        fig_lost.add_trace(
            go.Bar(
                x=lost_revenue_df["category"].astype(str),
                y=lost_revenue_df["lost_revenue"],
                marker_color="#e74c3c",
                text=lost_revenue_df["lost_revenue"].round(0),
                textposition="outside",
                hovertemplate="<b>%{x}</b><br>Lost Revenue: ₹%{y:,.0f}<extra></extra>",
            )
        )
        fig_lost.update_layout(
            title="Lost Revenue by Category ID (Stage 1)",
            xaxis_title="Category ID",
            yaxis_title="Lost Revenue (₹)",
            height=400,
            showlegend=False,
        )
        st.plotly_chart(fig_lost, use_container_width=True)

        st.subheader("📈 Lost Sales Trend Over Time")
        daily_lost = (
            filtered_stage1.groupby("dt", as_index=False)
            .agg(
                lost_sales=("lost_sales", "sum"),
                sale_amount=("sale_amount", "sum"),
                recovered_demand=("recovered_demand", "sum"),
            )
            .sort_values("dt")
        )
        daily_lost["lost_revenue"] = daily_lost["lost_sales"] * avg_price

        fig_trend = go.Figure()
        fig_trend.add_trace(
            go.Scatter(
                x=daily_lost["dt"],
                y=daily_lost["lost_revenue"],
                mode="lines+markers",
                name="Lost Revenue",
                line=dict(width=2),
                fill="tozeroy",
            )
        )
        fig_trend.update_layout(
            title="Daily Lost Revenue Trend",
            xaxis_title="Date",
            yaxis_title="Lost Revenue (₹)",
            height=400,
            hovermode="x unified",
        )
        st.plotly_chart(fig_trend, use_container_width=True)

        st.subheader("🎯 Top 20 Products by Lost Revenue")
        product_lost = (
            filtered_stage1.groupby(["product_name", "category"], as_index=False)
            .agg(
                lost_sales=("lost_sales", "sum"),
                sale_amount=("sale_amount", "sum"),
                recovered_demand=("recovered_demand", "sum"),
            )
        )
        product_lost["lost_revenue"] = product_lost["lost_sales"] * avg_price
        product_lost["recovery_potential"] = (
            product_lost["recovered_demand"] / (product_lost["sale_amount"] + EPS) - 1
        ) * 100
        top_lost = product_lost.nlargest(20, "lost_revenue")[
            ["product_name", "category", "lost_sales", "lost_revenue", "recovery_potential"]
        ].copy()

        st.dataframe(
            top_lost,
            column_config={
                "product_name": "Product",
                "category": "Category ID",
                "lost_sales": st.column_config.NumberColumn("Lost Sales", format="%d units"),
                "lost_revenue": st.column_config.NumberColumn("Lost Revenue", format="₹%.0f"),
                "recovery_potential": st.column_config.NumberColumn("Recovery %", format="%.1f%%"),
            },
            hide_index=True,
            use_container_width=True,
        )

        st.info(
            "💡 **Manager Insight**: These are the real revenue gaps captured from your Stage 1 output, not simulated values."
        )

    # TAB 4
    with tab4:
        st.header("🎮 Causal Impact Simulator - What-If Analysis")
        st.markdown("**Test scenarios** using real Stage 1 causal columns: weather, promotions, and holidays.")

        col1, col2 = st.columns(2)

        with col1:
            st.subheader("🌧️ Weather Impact")
            rainfall = st.slider("Expected Rainfall (mm)", 0.0, 100.0, float(stage1_df["precpt"].mean()), 5.0, key="sim_rainfall")
            temperature = st.slider("Temperature (°C)", 15.0, 45.0, float(stage1_df["avg_temperature"].mean()), 1.0, key="sim_temp")
            humidity = st.slider("Humidity (%)", 20.0, 100.0, float(stage1_df["avg_humidity"].mean()), 1.0, key="sim_humidity")
            wind_level = st.slider("Wind Level", 0.0, 10.0, float(stage1_df["avg_wind_level"].mean()), 0.5, key="sim_wind")

        with col2:
            st.subheader("🎁 Promotion Impact")
            discount = st.slider("Discount (%)", 0.0, 50.0, float(stage1_df["discount"].median()), 5.0, key="sim_discount")
            is_promotion = st.toggle("Activate Promotion Mode", value=False, key="sim_promo")
            is_holiday = st.toggle("Mark as Holiday", value=False, key="sim_holiday")

        st.markdown("---")
        st.subheader("📊 Simulated Demand Forecast")

        sim_forecast = (
            filtered_forecasts.groupby(["forecast_date", "category"], as_index=False)
            .agg(predicted_demand=("predicted_demand", "sum"))
        )

        scenario_factors = compute_scenario_factors(
            stage1_df=stage1_df,
            category_stats=category_stats,
            rainfall=rainfall,
            temperature=temperature,
            humidity=humidity,
            wind_level=wind_level,
            discount=discount,
            is_promotion=is_promotion,
            is_holiday=is_holiday,
        ).rename(columns={"Category": "category"})

        sim_forecast = sim_forecast.merge(scenario_factors[["category", "factor"]], on="category", how="left")
        sim_forecast["factor"] = sim_forecast["factor"].fillna(1.0)
        sim_forecast["adjusted_demand"] = sim_forecast["predicted_demand"] * sim_forecast["factor"]

        pivot_original = sim_forecast.pivot(index="forecast_date", columns="category", values="predicted_demand")
        pivot_adjusted = sim_forecast.pivot(index="forecast_date", columns="category", values="adjusted_demand")

        fig_sim = go.Figure()
        for cat in pivot_original.columns:
            fig_sim.add_trace(
                go.Scatter(
                    x=pivot_original.index,
                    y=pivot_original[cat],
                    mode="lines",
                    name=f"{cat} (Original)",
                    line=dict(dash="dash", width=1),
                    opacity=0.5,
                )
            )
        for cat in pivot_adjusted.columns:
            fig_sim.add_trace(
                go.Scatter(
                    x=pivot_adjusted.index,
                    y=pivot_adjusted[cat],
                    mode="lines+markers",
                    name=f"{cat} (Simulated)",
                    line=dict(width=3),
                )
            )

        fig_sim.update_layout(
            title="Original vs. Simulated Demand (by Category ID)",
            xaxis_title="Date",
            yaxis_title="Predicted Demand (units)",
            height=500,
            hovermode="x unified",
            legend=dict(orientation="h", yanchor="bottom", y=-0.3, xanchor="center", x=0.5),
        )
        st.plotly_chart(fig_sim, use_container_width=True)

        total_original = sim_forecast["predicted_demand"].sum()
        total_adjusted = sim_forecast["adjusted_demand"].sum()
        delta_demand = total_adjusted - total_original
        delta_pct = (delta_demand / (total_original + EPS)) * 100

        st.success(
            f"""
**📈 Simulation Result**:
- **Original 7-day forecast**: {total_original:,.0f} units
- **Adjusted forecast**: {total_adjusted:,.0f} units
- **Delta**: {delta_demand:+,.0f} units ({delta_pct:+.1f}%)

💡 **Action**: {'Prepare additional warehouse capacity and increase staffing.' if delta_demand > 0 else 'Standard operations should suffice.'}
"""
        )

    # TAB 5
    with tab5:
        st.header("📋 Smart Replenishment List - AI-Powered Ordering")
        st.markdown("**Generate optimal order quantities** from real forecast demand and historical service level.")

        safety_stock = st.slider(
            "Safety Stock Multiplier",
            1.0,
            2.0,
            1.2,
            0.1,
            help="Additional buffer stock (e.g., 1.2 = 20% extra)",
            key="safety_stock"
        )

        replen_df = calculate_stockout_risk(filtered_forecasts)
        replen_df["forecast_7day"] = replen_df["predicted_demand"] * 7

        # Estimated available stock proxy built from real historical service level and baseline demand
        replen_df["required_stock"] = replen_df["forecast_7day"] * safety_stock
        replen_df["available_stock_proxy"] = replen_df["estimated_stock_proxy"]
        replen_df["order_quantity"] = (replen_df["required_stock"] - replen_df["available_stock_proxy"]).clip(lower=0)

        needs_ordering = replen_df[replen_df["order_quantity"] > 0].copy()
        needs_ordering = needs_ordering.sort_values("order_quantity", ascending=False)

        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("📦 Products to Order", len(needs_ordering))
        with col2:
            st.metric("📊 Total Units Needed", f"{needs_ordering['order_quantity'].sum():,.0f}")
        with col3:
            avg_order = needs_ordering["order_quantity"].mean() if len(needs_ordering) > 0 else 0
            st.metric("📈 Avg Order Size", f"{avg_order:.0f} units")

        st.markdown("---")

        display_replen = needs_ordering[
            [
                "product_name",
                "category",
                "available_stock_proxy",
                "forecast_7day",
                "required_stock",
                "order_quantity",
                "days_of_cover",
            ]
        ].copy()

        display_replen["available_stock_proxy"] = display_replen["available_stock_proxy"].round(0)
        display_replen["forecast_7day"] = display_replen["forecast_7day"].round(0)
        display_replen["required_stock"] = display_replen["required_stock"].round(0)
        display_replen["order_quantity"] = display_replen["order_quantity"].round(0)
        display_replen["days_of_cover"] = display_replen["days_of_cover"].round(1)

        st.dataframe(
            display_replen,
            column_config={
                "product_name": "Product",
                "category": "Category ID",
                "available_stock_proxy": st.column_config.NumberColumn("Available Stock Proxy", format="%d"),
                "forecast_7day": st.column_config.NumberColumn("7-Day Forecast", format="%d"),
                "required_stock": st.column_config.NumberColumn("Required Stock", format="%d"),
                "order_quantity": st.column_config.NumberColumn("⚡ ORDER QTY", format="%d"),
                "days_of_cover": st.column_config.NumberColumn("Days Cover", format="%.1f"),
            },
            hide_index=True,
            use_container_width=True,
            height=500,
        )

        col1, col2 = st.columns(2)
        with col1:
            csv_replen = display_replen.to_csv(index=False)
            st.download_button(
                label="📥 Download Full Replenishment List (CSV)",
                data=csv_replen,
                file_name=f"replenishment_order_{datetime.now().strftime('%Y%m%d')}.csv",
                mime="text/csv",
                use_container_width=True,
            )

        with col2:
            simple_order = needs_ordering[["product_name", "order_quantity"]].copy()
            simple_order.columns = ["Product", "Quantity"]
            csv_simple = simple_order.to_csv(index=False)
            st.download_button(
                label="📋 Download Simple Order List (CSV)",
                data=csv_simple,
                file_name=f"order_list_{datetime.now().strftime('%Y%m%d')}.csv",
                mime="text/csv",
                use_container_width=True,
            )

        st.subheader("📊 Top 20 Products by Order Quantity")
        top_20 = needs_ordering.head(20)

        fig_replen = go.Figure()
        fig_replen.add_trace(
            go.Bar(
                x=top_20["product_name"],
                y=top_20["order_quantity"],
                marker_color="#3498db",
                text=top_20["order_quantity"].round(0),
                textposition="outside",
                hovertemplate="<b>%{x}</b><br>Order: %{y:.0f} units<extra></extra>",
            )
        )
        fig_replen.update_layout(
            xaxis_title="Product",
            yaxis_title="Order Quantity (units)",
            height=400,
            showlegend=False,
        )
        st.plotly_chart(fig_replen, use_container_width=True)

    # TAB 6
    with tab6:
        st.header("🌡️ Weather Impact & Demand Drivers")
        st.markdown(
            "**Weather and promotion signals** are taken from your real Stage 1 output. Historical averages are used for the baseline."
        )

        st.subheader("☀️ Historical Weather & Demand Context")
        weather_display = weather_df.copy()
        if not weather_display.empty:
            weather_display["dt"] = pd.to_datetime(weather_display["dt"]).dt.strftime("%Y-%m-%d")
            for c in ["precpt", "avg_temperature", "avg_humidity", "avg_wind_level"]:
                if c in weather_display.columns:
                    weather_display[c] = weather_display[c].round(2)
            st.dataframe(weather_display, hide_index=True, use_container_width=True)

            col1, col2 = st.columns(2)
            with col1:
                fig_temp = go.Figure()
                fig_temp.add_trace(
                    go.Scatter(
                        x=pd.to_datetime(daily_weather_summary(stage1_df)["dt"]),
                        y=daily_weather_summary(stage1_df)["avg_temperature"],
                        mode="lines+markers",
                        name="Temperature",
                        line=dict(width=2),
                    )
                )
                fig_temp.update_layout(
                    title="Historical Temperature",
                    xaxis_title="Date",
                    yaxis_title="Temperature (°C)",
                    height=300,
                    showlegend=False,
                )
                st.plotly_chart(fig_temp, use_container_width=True)

            with col2:
                fig_rain = go.Figure()
                fig_rain.add_trace(
                    go.Bar(
                        x=pd.to_datetime(daily_weather_summary(stage1_df)["dt"]),
                        y=daily_weather_summary(stage1_df)["precpt"],
                        name="Rainfall",
                    )
                )
                fig_rain.update_layout(
                    title="Historical Rainfall",
                    xaxis_title="Date",
                    yaxis_title="Rainfall (mm)",
                    height=300,
                    showlegend=False,
                )
                st.plotly_chart(fig_rain, use_container_width=True)
        else:
            st.info("No weather columns available in the Stage 1 file.")

        st.markdown("---")
        st.subheader("📊 Weather Impact on Demand by Category ID")

        rainfall = st.slider("Scenario Rainfall (mm)", 0.0, 100.0, float(stage1_df["precpt"].mean()), 5.0, key="weather_rain")
        temperature = st.slider("Scenario Temperature (°C)", 15.0, 45.0, float(stage1_df["avg_temperature"].mean()), 1.0, key="weather_temp")
        humidity = st.slider("Scenario Humidity (%)", 20.0, 100.0, float(stage1_df["avg_humidity"].mean()), 1.0, key="weather_humidity")
        wind_level = st.slider("Scenario Wind Level", 0.0, 10.0, float(stage1_df["avg_wind_level"].mean()), 0.5, key="weather_wind")
        discount = st.slider("Scenario Discount (%)", 0.0, 50.0, float(stage1_df["discount"].median()), 5.0, key="weather_discount")
        is_promotion = st.toggle("Promotion Active", value=False, key="weather_promo")
        is_holiday = st.toggle("Holiday Active", value=False, key="weather_holiday")

        impact_df = compute_scenario_factors(
            stage1_df=stage1_df,
            category_stats=category_stats,
            rainfall=rainfall,
            temperature=temperature,
            humidity=humidity,
            wind_level=wind_level,
            discount=discount,
            is_promotion=is_promotion,
            is_holiday=is_holiday,
        )

        impact_df = impact_df.drop(columns=["factor"])

        st.dataframe(impact_df, hide_index=True, use_container_width=True)

        st.info(
            """
**💡 Manager Insights from real data**
- Rain / temperature / humidity / wind are taken from your Stage 1 columns.
- Promotion and holiday effects are based on your Stage 1 history.
- Category rows are shown as numeric `first_category_id` values only.
"""
        )


if __name__ == "__main__":
    main()
