from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
from datetime import datetime, timedelta

app = FastAPI(title="AMPC POS AI Forecasting Microservice")

class TransactionItemInput(BaseModel):
    sku: str
    productName: str
    quantity: int
    unitPrice: float
    createdAt: str
    currentStock: int
    expiryDate: Optional[str] = None

class ForecastRequest(BaseModel):
    daysToForecast: int = 30
    transactions: List[TransactionItemInput]

@app.get("/health")
def health_check():
    return {"status": "online", "service": "AI Forecasting Engine"}

@app.post("/api/v1/forecast")
def generate_forecast(payload: ForecastRequest):
    if not payload.transactions:
        return {"error": "No transaction data provided"}

    # Load transactions into Pandas DataFrame
    data = []
    for t in payload.transactions:
        data.append({
            "sku": t.sku,
            "productName": t.productName,
            "quantity": t.quantity,
            "unitPrice": t.unitPrice,
            "revenue": t.quantity * t.unitPrice,
            "createdAt": t.createdAt,
            "currentStock": t.currentStock,
            "expiryDate": t.expiryDate
        })

    df = pd.DataFrame(data)

    # Make dates timezone-naive to avoid sub-type mismatch errors
    df['createdAt'] = pd.to_datetime(df['createdAt']).dt.tz_localize(None)
    df['expiryDate'] = pd.to_datetime(df['expiryDate']).dt.tz_localize(None)

    # 1. Gross & Net Revenue Forecast
    daily_sales = df.groupby(df['createdAt'].dt.date).agg(
        total_revenue=('revenue', 'sum')
    ).reset_index()

    avg_daily_revenue = daily_sales['total_revenue'].tail(7).mean() if len(daily_sales) > 0 else 0
    actual_revenue_mtd = float(daily_sales['total_revenue'].sum())
    
    projected_additional_rev = avg_daily_revenue * payload.daysToForecast
    projected_gross = round(actual_revenue_mtd + projected_additional_rev, 2)
    estimated_discounts = round(projected_gross * 0.045, 2)
    projected_net = round(projected_gross - estimated_discounts, 2)

    # 2. Revenue Trajectory
    trajectory = []
    today = datetime.now()
    
    for _, row in daily_sales.iterrows():
        trajectory.append({
            "day": row['createdAt'].strftime("%b %d"),
            "actual": float(round(row['total_revenue'], 2)),
            "forecast": None
        })

    last_val = trajectory[-1]['actual'] if trajectory else 0
    if trajectory:
        trajectory[-1]['forecast'] = last_val

    for i in range(1, payload.daysToForecast + 1):
        future_date = today + timedelta(days=i)
        last_val += avg_daily_revenue
        trajectory.append({
            "day": future_date.strftime("%b %d"),
            "actual": None,
            "forecast": float(round(last_val, 2))
        })

    # 3. Category Breakdown
    category_sales = df.groupby('sku').agg(
        total_rev=('revenue', 'sum')
    ).reset_index()

    total_rev_sum = category_sales['total_rev'].sum() or 1.0
    category_breakdown = [
        {
            "category": row['sku'],
            "projectedRevenue": float(round(row['total_rev'], 2)),
            "percentShare": float(round((row['total_rev'] / total_rev_sum) * 100, 1))
        }
        for _, row in category_sales.iterrows()
    ]

    # 4. Item-Level Demand
    sku_summary = df.groupby(['sku', 'productName']).agg(
        total_qty=('quantity', 'sum'),
        current_stock=('currentStock', 'first'),
        expiry_date=('expiryDate', 'first'),
        days_active=('createdAt', lambda x: max((x.max() - x.min()).days, 1))
    ).reset_index()

    sku_demand_list = []
    high_risk_count = 0

    # Ensure reference timestamp for calculations is timezone-naive
    today_ts = pd.Timestamp(today).tz_localize(None)

    for idx, row in sku_summary.iterrows():
        daily_demand = max(1, round(row['total_qty'] / row['days_active']))
        forecast_7day = daily_demand * 7
        stock = row['current_stock']
        reorder_qty = max(0, forecast_7day - stock)

        status = "STABLE"
        if stock <= forecast_7day:
            status = "REORDER NOW"
            high_risk_count += 1
        elif pd.notnull(row['expiry_date']):
            days_to_expiry = (row['expiry_date'] - today_ts).days
            if days_to_expiry > 0 and stock > (daily_demand * days_to_expiry):
                status = "EXPIRY RISK"
                high_risk_count += 1

        sku_demand_list.append({
            "id": str(idx + 1),
            "sku": row['sku'],
            "name": row['productName'],
            "stock": int(stock),
            "dailyDemand": int(daily_demand),
            "forecast7Day": int(forecast_7day),
            "reorderQty": int(reorder_qty),
            "status": status
        })

    return {
        "kpis": {
            "projectedGross": projected_gross,
            "projectedNet": projected_net,
            "projectedDiscounts": estimated_discounts,
            "grossGrowth": "+8.5%",
            "highRiskSKUs": high_risk_count
        },
        "revenueTrajectory": trajectory,
        "categoryBreakdown": category_breakdown,
        "skuDemandList": sku_demand_list
    }