# Optimized Full Streamlit Demand Forecast Dashboard

```python
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
# Styling
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
# Constants
# ---------------------------------------------------------------------
FORECAST_HORIZON = 7
EPS = 1e-9

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

# ---------------------------------------------------------------------
# Optimization helpers
# ---------------------------------------------------------------------
def optimize_dtypes(df: pd.DataFrame) -> pd.DataFrame:

    float_cols = df.select_dtypes(include=["float64"]).columns
    int_cols = df.select_dtypes(include=["int64"]).columns

    df[float_cols] = df[float_cols].astype("float32")
    df[int_cols] = df[int_cols].astype("int32")

    category_cols = [
        "store_id",
        "product_id",
        "first_category_id",
    ]

    for col in category_cols:
        if col in df.columns:
            df[col] = df[col].astype("category")

    return df


def safe_corr(a: pd.Series, b: pd.Series) -> float:

    mask = a.notna() & b.notna()

    if mask.sum() < 3:
        return 0.0

    x = a[mask]
    y = b[mask]

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
        return list(pd.read_parquet(path).columns)


# ---------------------------------------------------------------------
# Discover parquet paths
# ---------------------------------------------------------------------
@st.cache_data(show_spinner=False)
def discover_parquet_paths(base_dir: str = "."):

    files = sorted(Path(base_dir).glob("*.parquet"))

    if not files:
        raise FileNotFoundError(
            "No parquet files found. Put Stage 1 and Stage 2 parquet files in the app folder."
        )

    scored = []

    for path in files:

        cols = set(parquet_columns(path))

        stage1_score = len(cols & STAGE1_MARKERS)
        stage2_score = len(cols & STAGE2_MARKERS)

        scored.append((stage1_score, stage2_score, path))

    stage1_path = max(scored, key=lambda x: x[0])[2]
    stage2_path = max(scored, key=lambda x: x[1])[2]

    return str(stage1_path), str(stage2_path)


# ---------------------------------------------------------------------
# Read Stage 1
# ---------------------------------------------------------------------
@st.cache_data(show_spinner=False)
def read_stage1() -> pd.DataFrame:

    stage1_path, _ = discover_parquet_paths()

    needed_cols = [
        "store_id",
        "product_id",
        "first_category_id",
        "sale_amount",
        "recovered_demand",
        "mean_sales_mu",
        "discount",
        "activity_flag",
        "holiday_flag",
        "precpt",
        "avg_temperature",
        "avg_humidity",
        "avg_wind_level",
        "stockout_in_peak",
        "recovery_uplift",
        "dt",
        "in_stock",
    ]

    available_cols = parquet_columns(Path(stage1_path))

    needed_cols = [
        c for c in needed_cols if c in available_cols
    ]

    df = pd.read_parquet(
        stage1_path,
        columns=needed_cols,
    )

    df = optimize_dtypes(df)

    df["category"] = df["first_category_id"]

    df["product_name"] = (
        "Product_" + df["product_id"].astype(str)
    )

    df["lost_sales"] = (
        df["recovered_demand"] - df["sale_amount"]
    ).clip(lower=0)

    return df


# ---------------------------------------------------------------------
# Read Stage 2
# ---------------------------------------------------------------------
@st.cache_data(show_spinner=False)
def read_stage2() -> pd.DataFrame:

    _, stage2_path = discover_parquet_paths()

    available_cols = parquet_columns(Path(stage2_path))

    needed_cols = [
        "store_id",
        "product_id",
        "first_category_id",
        "dt",
    ]

    needed_cols += [
        f"ens_h{i}" for i in range(1, 8)
    ]

    needed_cols += [
        f"lgb_h{i}" for i in range(1, 8)
    ]

    needed_cols = [
        c for c in needed_cols if c in available_cols
    ]

    df = pd.read_parquet(
        stage2_path,
        columns=needed_cols,
    )

    df = optimize_dtypes(df)

    ens_cols = [
        c for c in df.columns if c.startswith("ens_h")
    ]

    lgb_cols = [
        c for c in df.columns if c.startswith("lgb_h")
    ]

    if ens_cols:
        forecast_cols = ens_cols
        source_name = "ensemble"

    elif lgb_cols:
        forecast_cols = lgb_cols
        source_name = "lightgbm"

    else:
        raise KeyError(
            "Stage 2 file must contain forecast columns"
        )

    id_vars = [
        c for c in df.columns if c not in forecast_cols
    ]

    long_df = df.melt(
        id_vars=id_vars,
        value_vars=forecast_cols,
        var_name="horizon",
        value_name="predicted_demand",
    )

    long_df["horizon"] = (
        long_df["horizon"]
        .str.extract(r"(\d+)")
        .astype(int)
    )

    long_df["forecast_date"] = (
        pd.to_datetime(long_df["dt"])
        + pd.to_timedelta(
            long_df["horizon"],
            unit="D",
        )
    )

    long_df["category"] = long_df["first_category_id"]

    long_df["product_name"] = (
        "Product_" + long_df["product_id"].astype(str)
    )

    long_df["forecast_source"] = source_name

    return long_df


# ---------------------------------------------------------------------
# Product stats
# ---------------------------------------------------------------------
@st.cache_data(show_spinner=False)
def build_stage1_product_stats(
    stage1_df: pd.DataFrame,
) -> pd.DataFrame:

    agg = (
        stage1_df
        .groupby(
            "product_id",
            observed=True,
            as_index=False,
        )
        .agg(
            baseline_sales_mu=(
                "mean_sales_mu",
                "mean",
            ),
            service_level=(
                "in_stock",
                "mean",
            ),
            stockout_peak_rate=(
                "stockout_in_peak",
                "mean",
            ),
            avg_recovery_uplift=(
                "recovery_uplift",
                "mean",
            ),
            avg_discount=(
                "discount",
                "mean",
            ),
            avg_activity_flag=(
                "activity_flag",
                "mean",
            ),
            avg_holiday_flag=(
                "holiday_flag",
                "mean",
            ),
            avg_precpt=(
                "precpt",
                "mean",
            ),
            avg_temperature=(
                "avg_temperature",
                "mean",
            ),
            avg_humidity=(
                "avg_humidity",
                "mean",
            ),
            avg_wind_level=(
                "avg_wind_level",
                "mean",
            ),
            avg_sale_amount=(
                "sale_amount",
                "mean",
            ),
            avg_recovered_demand=(
                "recovered_demand",
                "mean",
            ),
            avg_lost_sales=(
                "lost_sales",
                "mean",
            ),
            category=(
                "first_category_id",
                "first",
            ),
        )
    )

    agg["lost_sales_rate"] = (
        agg["avg_lost_sales"]
        / (
            agg["avg_recovered_demand"]
            + EPS
        )
    )

    agg["stock_health_score"] = (
        agg["service_level"].fillna(0)
        * (
            1
            - agg[
                "stockout_peak_rate"
            ].fillna(0)
        )
    ).clip(0, 1)

    return agg


# ---------------------------------------------------------------------
# Category stats
# ---------------------------------------------------------------------
@st.cache_data(show_spinner=False)
def build_stage1_category_stats(
    stage1_df: pd.DataFrame,
) -> pd.DataFrame:

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

    grouped = stage1_df.groupby(
        "first_category_id",
        observed=True,
    )

    for cat, sub in grouped:

        row = {
            "category": cat,
            "avg_recovered_demand": float(
                sub["recovered_demand"].mean()
            ),
            "avg_sale_amount": float(
                sub["sale_amount"].mean()
            ),
            "avg_lost_sales": float(
                sub["lost_sales"].mean()
            ),
        }

        for d in drivers:
            row[f"corr_{d}"] = safe_corr(
                sub["recovered_demand"],
                sub[d],
            )

        rows.append(row)

    return pd.DataFrame(rows)


# ---------------------------------------------------------------------
# Enrich Stage 2
# ---------------------------------------------------------------------
@st.cache_data(show_spinner=False)
def enrich_stage2_with_stage1(
    stage2_long: pd.DataFrame,
    stage1_stats: pd.DataFrame,
):

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

    return stage2_long.merge(
        stage1_stats[keep_cols],
        on="product_id",
        how="left",
    )


# ---------------------------------------------------------------------
# Surge products
# ---------------------------------------------------------------------
def calculate_surge_products(
    forecasts_df: pd.DataFrame,
    threshold: float = 3.0,
):

    baseline = forecasts_df[
        "baseline_sales_mu"
    ].fillna(
        forecasts_df[
            "predicted_demand"
        ].groupby(
            forecasts_df["product_id"]
        ).transform("mean")
    )

    surge = forecasts_df[
        forecasts_df["predicted_demand"]
        > threshold * baseline
    ].copy()

    surge["surge_ratio"] = (
        surge["predicted_demand"]
        / (
            baseline.loc[surge.index]
            + EPS
        )
    )

    return surge.sort_values(
        "surge_ratio",
        ascending=False,
    )


# ---------------------------------------------------------------------
# Stockout risk
# ---------------------------------------------------------------------
@st.cache_data(show_spinner=False)
def calculate_stockout_risk(
    forecasts_df: pd.DataFrame,
):

    product_forecast = (
        forecasts_df
        .groupby(
            [
                "product_id",
                "product_name",
                "category",
            ],
            observed=True,
            as_index=False,
        )
        .agg(
            predicted_demand=(
                "predicted_demand",
                "mean",
            ),
            forecast_7day=(
                "predicted_demand",
                "sum",
            ),
            baseline_sales_mu=(
                "baseline_sales_mu",
                "first",
            ),
            service_level=(
                "service_level",
                "first",
            ),
            stockout_peak_rate=(
                "stockout_peak_rate",
                "first",
            ),
            avg_lost_sales=(
                "avg_lost_sales",
                "first",
            ),
            stock_health_score=(
                "stock_health_score",
                "first",
            ),
        )
    )

    demand_pressure = (
        product_forecast[
            "predicted_demand"
        ]
        / (
            product_forecast[
                "baseline_sales_mu"
            ]
            + EPS
        )
    )

    protection = (
        product_forecast[
            "stock_health_score"
        ].clip(0.05, 1.0)
    )

    product_forecast[
        "days_of_cover"
    ] = np.clip(
        7
        * protection
        / np.clip(
            demand_pressure,
            0.25,
            None,
        ),
        0,
        30,
    )

    product_forecast["risk_level"] = pd.cut(
        product_forecast[
            "days_of_cover"
        ],
        bins=[-np.inf, 1, 3, 7, np.inf],
        labels=[
            "CRITICAL (<24h)",
            "HIGH (1-3 days)",
            "MEDIUM (3-7 days)",
            "LOW (>7 days)",
        ],
    )

    product_forecast[
        "estimated_stock_proxy"
    ] = (
        product_forecast[
            "baseline_sales_mu"
        ]
        * 7
        * protection
    )

    return product_forecast.sort_values(
        "days_of_cover"
    )


# ---------------------------------------------------------------------
# Lost revenue
# ---------------------------------------------------------------------
def calculate_lost_revenue(
    stage1_df: pd.DataFrame,
    avg_price: float = 15.0,
):

    df = stage1_df.copy()

    df["lost_revenue"] = (
        df["lost_sales"] * avg_price
    )

    summary = (
        df.groupby(
            "category",
            observed=True,
            as_index=False,
        )
        .agg(
            lost_sales=(
                "lost_sales",
                "sum",
            ),
            lost_revenue=(
                "lost_revenue",
                "sum",
            ),
        )
    )

    return summary.sort_values(
        "lost_revenue",
        ascending=False,
    )


# ---------------------------------------------------------------------
# Daily weather summary
# ---------------------------------------------------------------------
@st.cache_data(show_spinner=False)
def daily_weather_summary(
    stage1_df: pd.DataFrame,
):

    cols = [
        "precpt",
        "avg_temperature",
        "avg_humidity",
        "avg_wind_level",
    ]

    available = [
        c for c in cols if c in stage1_df.columns
    ]

    daily = (
        stage1_df
        .groupby(
            "dt",
            observed=True,
            as_index=False,
        )[available]
        .mean()
    )

    return daily.sort_values("dt")


# ---------------------------------------------------------------------
# Scenario factors
# ---------------------------------------------------------------------
def compute_scenario_factors(
    stage1_df,
    category_stats,
    rainfall,
    temperature,
    humidity,
    wind_level,
    discount,
    is_promotion,
    is_holiday,
):

    baselines = stage1_df[
        [
            "precpt",
            "avg_temperature",
            "avg_humidity",
            "avg_wind_level",
            "discount",
            "holiday_flag",
            "activity_flag",
        ]
    ].mean(numeric_only=True)

    rows = []

    for _, r in category_stats.iterrows():

        w_precpt = r.get("corr_precpt", 0.0)
        w_temp = r.get(
            "corr_avg_temperature",
            0.0,
        )
        w_hum = r.get(
            "corr_avg_humidity",
            0.0,
        )
        w_wind = r.get(
            "corr_avg_wind_level",
            0.0,
        )
        w_disc = r.get(
            "corr_discount",
            0.0,
        )
        w_act = r.get(
            "corr_activity_flag",
            0.0,
        )
        w_hol = r.get(
            "corr_holiday_flag",
            0.0,
        )

        delta_precpt = (
            rainfall - baselines["precpt"]
        ) / (
            abs(baselines["precpt"])
            + 1.0
        )

        delta_temp = (
            temperature
            - baselines[
                "avg_temperature"
            ]
        ) / 10.0

        delta_hum = (
            humidity
            - baselines[
                "avg_humidity"
            ]
        ) / 10.0

        delta_wind = (
            wind_level
            - baselines[
                "avg_wind_level"
            ]
        ) / 2.0

        delta_disc = (
            discount
            - baselines["discount"]
        ) / 100.0

        delta_promo = (
            1.0 if is_promotion else 0.0
        )

        delta_holiday = (
            float(is_holiday)
            - float(
                baselines[
                    "holiday_flag"
                ]
            )
        )

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

        rows.append(
            {
                "Category": int(r["category"]),
                "Impact Factor": f"{factor:.2f}x",
                "Change": f"{(factor - 1) * 100:+.1f}%",
                "factor": factor,
            }
        )

    return pd.DataFrame(rows).sort_values(
        "factor",
        ascending=False,
    )


# ---------------------------------------------------------------------
# Main app
# ---------------------------------------------------------------------
def main():

    st.markdown(
        '<h1 class="main-header">🚀 AI-Powered Demand Forecasting Dashboard</h1>',
        unsafe_allow_html=True,
    )

    st.markdown(
        "**Hyperlocal Quick Commerce** | Optimized Version"
    )

    # -------------------------------------------------------------
    # Load once
    # -------------------------------------------------------------
    with st.spinner("Loading optimized parquet data..."):

        stage1_df = read_stage1()

        stage2_df = read_stage2()

        stage1_stats = build_stage1_product_stats(
            stage1_df
        )

        category_stats = build_stage1_category_stats(
            stage1_df
        )

        stage2_df = enrich_stage2_with_stage1(
            stage2_df,
            stage1_stats,
        )

        weather_df = daily_weather_summary(
            stage1_df
        )

    # -------------------------------------------------------------
    # Sidebar filters
    # -------------------------------------------------------------
    st.sidebar.title("🎛️ Control Panel")

    stores = sorted(
        stage2_df["store_id"]
        .unique()
        .tolist()
    )

    selected_store = st.sidebar.selectbox(
        "🏪 Store",
        stores,
    )

    filtered_forecasts = stage2_df[
        stage2_df["store_id"]
        == selected_store
    ]

    filtered_stage1 = stage1_df[
        stage1_df["store_id"]
        == selected_store
    ]

    categories = [
        "All Categories"
    ] + sorted(
        filtered_forecasts[
            "category"
        ].unique().tolist()
    )

    selected_category = st.sidebar.selectbox(
        "📦 Category Filter",
        categories,
    )

    if selected_category != "All Categories":

        filtered_forecasts = filtered_forecasts[
            filtered_forecasts["category"]
            == selected_category
        ]

        filtered_stage1 = filtered_stage1[
            filtered_stage1["category"]
            == selected_category
        ]

    # -------------------------------------------------------------
    # Precompute once
    # -------------------------------------------------------------
    risk_df = calculate_stockout_risk(
        filtered_forecasts
    )

    daily_demand = (
        filtered_forecasts
        .groupby(
            "forecast_date",
            observed=True,
            as_index=False,
        )
        .agg(
            predicted_demand=(
                "predicted_demand",
                "sum",
            )
        )
        .sort_values("forecast_date")
    )

    category_demand = (
        filtered_forecasts
        .groupby(
            "category",
            observed=True,
            as_index=False,
        )
        .agg(
            predicted_demand=(
                "predicted_demand",
                "sum",
            )
        )
        .sort_values(
            "predicted_demand",
            ascending=False,
        )
    )

    # -------------------------------------------------------------
    # Tabs
    # -------------------------------------------------------------
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

    # =============================================================
    # TAB 1
    # =============================================================
    with tab1:

        st.header("📊 Next 7-Day Demand Forecast")

        col1, col2, col3, col4 = st.columns(4)

        total_forecast = filtered_forecasts[
            "predicted_demand"
        ].sum()

        avg_daily = daily_demand[
            "predicted_demand"
        ].mean()

        surge_count = len(
            calculate_surge_products(
                filtered_forecasts,
                threshold=2.5,
            )
        )

        critical_count = len(
            risk_df[
                risk_df["risk_level"]
                == "CRITICAL (<24h)"
            ]
        )

        with col1:
            st.metric(
                "📦 Total Forecasted Demand",
                f"{total_forecast:,.0f} units",
            )

        with col2:
            st.metric(
                "📈 Avg Daily Demand",
                f"{avg_daily:,.0f} units/day",
            )

        with col3:
            st.metric(
                "🔥 Surge Alerts",
                surge_count,
            )

        with col4:
            st.metric(
                "⚠️ Critical Stock Items",
                critical_count,
            )

        fig_daily = go.Figure()

        fig_daily.add_trace(
            go.Bar(
                x=daily_demand[
                    "forecast_date"
                ],
                y=daily_demand[
                    "predicted_demand"
                ],
            )
        )

        fig_daily.update_layout(
            title="Daily Demand Forecast",
            height=400,
        )

        st.plotly_chart(
            fig_daily,
            use_container_width=True,
        )

        fig_cat = px.pie(
            category_demand,
            values="predicted_demand",
            names="category",
            hole=0.4,
        )

        st.plotly_chart(
            fig_cat,
            use_container_width=True,
        )

    # =============================================================
    # TAB 2
    # =============================================================
    with tab2:

        st.header(
            "⚠️ Stockout Countdown"
        )

        display_df = risk_df[
            [
                "product_name",
                "category",
                "estimated_stock_proxy",
                "predicted_demand",
                "days_of_cover",
                "risk_level",
            ]
        ]

        st.dataframe(
            display_df,
            hide_index=True,
            use_container_width=True,
        )

        fig_risk = px.bar(
            risk_df.head(20),
            x="product_name",
            y="days_of_cover",
            color="risk_level",
        )

        st.plotly_chart(
            fig_risk,
            use_container_width=True,
        )

    # =============================================================
    # TAB 3
    # =============================================================
    with tab3:

        st.header(
            "💰 Lost Sales Audit"
        )

        avg_price = st.number_input(
            "💵 Average Product Price (₹)",
            min_value=1.0,
            value=15.0,
            step=1.0,
        )

        lost_revenue_df = calculate_lost_revenue(
            filtered_stage1,
            avg_price=avg_price,
        )

        st.dataframe(
            lost_revenue_df,
            hide_index=True,
            use_container_width=True,
        )

        fig_lost = px.bar(
            lost_revenue_df,
            x="category",
            y="lost_revenue",
        )

        st.plotly_chart(
            fig_lost,
            use_container_width=True,
        )

    # =============================================================
    # TAB 4
    # =============================================================
    with tab4:

        st.header(
            "🎮 What-If Simulator"
        )

        rainfall = st.slider(
            "Rainfall",
            0.0,
            100.0,
            10.0,
        )

        temperature = st.slider(
            "Temperature",
            15.0,
            45.0,
            30.0,
        )

        humidity = st.slider(
            "Humidity",
            20.0,
            100.0,
            60.0,
        )

        wind_level = st.slider(
            "Wind",
            0.0,
            10.0,
            2.0,
        )

        discount = st.slider(
            "Discount",
            0.0,
            50.0,
            10.0,
        )

        is_promotion = st.toggle(
            "Promotion",
            value=False,
        )

        is_holiday = st.toggle(
            "Holiday",
            value=False,
        )

        impact_df = compute_scenario_factors(
            stage1_df,
            category_stats,
            rainfall,
            temperature,
            humidity,
            wind_level,
            discount,
            is_promotion,
            is_holiday,
        )

        st.dataframe(
            impact_df,
            hide_index=True,
            use_container_width=True,
        )

    # =============================================================
    # TAB 5
    # =============================================================
    with tab5:

        st.header(
            "📋 Smart Replenishment List"
        )

        replen_df = risk_df.copy()

        replen_df[
            "required_stock"
        ] = (
            replen_df[
                "forecast_7day"
            ] * 1.2
        )

        replen_df[
            "order_quantity"
        ] = (
            replen_df[
                "required_stock"
            ]
            - replen_df[
                "estimated_stock_proxy"
            ]
        ).clip(lower=0)

        st.dataframe(
            replen_df,
            hide_index=True,
            use_container_width=True,
        )

    # =============================================================
    # TAB 6
    # =============================================================
    with tab6:

        st.header(
            "🌡️ Weather Impact"
        )

        st.dataframe(
            weather_df,
            hide_index=True,
            use_container_width=True,
        )

        if not weather_df.empty:

            fig_temp = px.line(
                weather_df,
                x="dt",
                y="avg_temperature",
            )

            st.plotly_chart(
                fig_temp,
                use_container_width=True,
            )

            fig_rain = px.bar(
                weather_df,
                x="dt",
                y="precpt",
            )

            st.plotly_chart(
                fig_rain,
                use_container_width=True,
            )


if __name__ == "__main__":
    main()
```

# Main Optimizations Added

* Added `@st.cache_data` to expensive functions
* Reduced repeated `groupby()` calls
* Reduced repeated calculations inside tabs
* Added `optimize_dtypes()` for lower RAM usage
* Added categorical dtypes for faster filtering/groupby
* Used `observed=True` in groupby
* Removed unnecessary `.copy()` calls
* Read only required parquet columns
* Reduced repeated weather computations
* Precomputed risk/demand summaries once
* Replaced recursive `rglob()` with faster `glob()`
* Reduced memory footprint significantly
