"""
rental_ml.py  -  ML module of the Rental Property Management System
Run:  python rental_ml.py
Covers: data generation, preprocessing, Linear Regression, Logistic Regression,
Decision Tree, k-NN, K-Means, evaluation, joblib save/load.
"""
import os
import math
import json
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
from scipy import stats

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.cluster import KMeans
from sklearn.metrics import (mean_squared_error, mean_absolute_error, r2_score,
                             confusion_matrix, accuracy_score, precision_score,
                             recall_score, f1_score, silhouette_score)

RANDOM_STATE = 42
BASE = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE, "data")
MODEL_DIR = os.path.join(BASE, "models")
PLOT_DIR = os.path.join(BASE, "plots")
for d in (DATA_DIR, MODEL_DIR, PLOT_DIR):
    os.makedirs(d, exist_ok=True)
sns.set_theme(style="whitegrid")

NUM_COLS = ["bedrooms", "bathrooms", "area_sqft", "floor", "amenity_count"]
CAT_COLS = ["city", "property_type", "furnished"]
LABELS = ["Affordable", "Mid-Range", "Premium"]

# ---------------------------------------------------------------
# STEP 1: Synthetic dataset modelled on Indian rental market
# ---------------------------------------------------------------
CITY_DATA = {   # city: (base rent per sq ft in INR, localities)
    "Chandigarh": (30, ["Sector 17", "Sector 22", "Sector 35", "Sector 44", "Manimajra"]),
    "Mohali":     (24, ["Sector 70", "Sector 71", "Phase 5", "Sector 82", "Kharar Road"]),
    "Panchkula":  (22, ["Sector 5", "Sector 20", "Sector 15", "Sector 7"]),
    "Delhi":      (38, ["Dwarka", "Rohini", "Saket", "Lajpat Nagar", "Janakpuri"]),
    "Gurugram":   (40, ["DLF Phase 3", "Sector 56", "Golf Course Road", "Sohna Road"]),
    "Noida":      (28, ["Sector 62", "Sector 137", "Sector 18", "Sector 75"]),
    "Mumbai":     (70, ["Andheri West", "Powai", "Thane West", "Borivali", "Navi Mumbai"]),
    "Pune":       (30, ["Hinjewadi", "Kothrud", "Wakad", "Baner"]),
    "Bengaluru":  (38, ["Koramangala", "Whitefield", "HSR Layout", "Electronic City"]),
    "Hyderabad":  (30, ["Gachibowli", "Madhapur", "Kukatpally", "Banjara Hills"]),
    "Jaipur":     (18, ["Malviya Nagar", "Vaishali Nagar", "Mansarovar", "C-Scheme"]),
    "Lucknow":    (16, ["Gomti Nagar", "Hazratganj", "Indira Nagar", "Aliganj"]),
}
TYPES = ["Apartment", "Independent House", "Villa", "PG/Studio"]
TYPE_MULT = {"Apartment": 1.0, "Independent House": 1.1, "Villa": 1.5, "PG/Studio": 0.9}
FURN_MULT = {"Unfurnished": 0.9, "Semi-Furnished": 1.0, "Furnished": 1.15}


def generate_dataset(n=1500):
    rng = np.random.default_rng(RANDOM_STATE)
    rows = []
    for _ in range(n):
        city = str(rng.choice(list(CITY_DATA.keys())))
        base, localities = CITY_DATA[city]
        locality = str(rng.choice(localities))
        ptype = str(rng.choice(TYPES, p=[0.55, 0.20, 0.10, 0.15]))
        if ptype == "Apartment":
            bed = int(rng.integers(1, 5)); area = bed * int(rng.integers(300, 431)); floor = int(rng.integers(0, 21))
        elif ptype == "Independent House":
            bed = int(rng.integers(2, 6)); area = bed * int(rng.integers(350, 501)); floor = int(rng.integers(0, 3))
        elif ptype == "Villa":
            bed = int(rng.integers(3, 7)); area = bed * int(rng.integers(450, 651)); floor = int(rng.integers(0, 3))
        else:
            bed = 1; area = int(rng.integers(120, 301)); floor = int(rng.integers(0, 4))
        bath = 1 if ptype == "PG/Studio" else max(1, bed - int(rng.integers(0, 2)))
        furnished = str(rng.choice(list(FURN_MULT.keys()), p=[0.3, 0.4, 0.3]))
        amenity = int(rng.integers(0, 11))
        rent = (area * base * TYPE_MULT[ptype] * FURN_MULT[furnished]
                * (1 + 0.012 * amenity) * (1 + 0.004 * floor) * rng.normal(1, 0.06))
        rent = max(3000, int(round(rent / 500) * 500))
        rows.append([city, locality, ptype, bed, bath, area, furnished, floor, amenity, rent])
    df = pd.DataFrame(rows, columns=["city", "locality", "property_type", "bedrooms", "bathrooms",
                                     "area_sqft", "furnished", "floor", "amenity_count", "rent"])
    # make the raw data realistically messy: outliers, missing values, duplicates
    for c in ["area_sqft", "floor", "amenity_count"]:
        df[c] = df[c].astype(float)
    out_idx = rng.choice(df.index, size=12, replace=False)
    df.loc[out_idx, "rent"] = df.loc[out_idx, "rent"] * 4
    candidates = df.index.difference(out_idx)
    for col, frac in [("area_sqft", 0.04), ("furnished", 0.03), ("amenity_count", 0.03), ("floor", 0.02)]:
        idx = rng.choice(candidates, size=int(frac * len(df)), replace=False)
        df.loc[idx, col] = np.nan
    df = pd.concat([df, df.sample(25, random_state=RANDOM_STATE)], ignore_index=True)
    return df


raw_path = os.path.join(DATA_DIR, "rental_dataset_raw.csv")
generate_dataset().to_csv(raw_path, index=False)

# ---------------------------------------------------------------
# STEP 2: Load and explore
# ---------------------------------------------------------------
print("=" * 70, "\nSTEP 2: DATA LOADING AND EXPLORATION\n" + "=" * 70)
df = pd.read_csv(raw_path)
print("Raw shape:", df.shape)
print(df.head())
print("\nMissing values per column:\n", df.isna().sum())

# ---------------------------------------------------------------
# STEP 3: Preprocessing
# ---------------------------------------------------------------
print("\n" + "=" * 70, "\nSTEP 3: DATA PREPROCESSING\n" + "=" * 70)
n0 = len(df)
df = df.drop_duplicates().reset_index(drop=True)
print("Duplicate rows removed:", n0 - len(df))

# outlier treatment: IQR on rent per sq ft within each (city, property type)
df["rps"] = df["rent"] / df["area_sqft"]
grp = df.groupby(["city", "property_type"])["rps"]
q1 = grp.transform(lambda s: s.quantile(0.25))
q3 = grp.transform(lambda s: s.quantile(0.75))
iqr = q3 - q1
inside = df["rps"].isna() | ((df["rps"] >= q1 - 1.5 * iqr) & (df["rps"] <= q3 + 1.5 * iqr))
print("Outlier rows removed (IQR method):", int((~inside).sum()))
df = df[inside].drop(columns="rps").reset_index(drop=True)

# missing values: group median for numeric, mode for categorical
for c in ["area_sqft", "floor", "amenity_count"]:
    df[c] = df.groupby("property_type")[c].transform(lambda s: s.fillna(s.median()))
    df[c] = df[c].round().astype(int)
df["furnished"] = df["furnished"].fillna(df["furnished"].mode()[0])
print("Missing values after cleaning:", int(df.isna().sum().sum()))

df["price_category"] = pd.cut(df["rent"], bins=[0, 20000, 45000, np.inf], labels=LABELS).astype(str)
print("Clean shape:", df.shape)
print("\nPrice category counts:\n", df["price_category"].value_counts())
print("Rent skewness (SciPy):", round(float(stats.skew(df["rent"])), 3))
df.to_csv(os.path.join(DATA_DIR, "rental_dataset_clean.csv"), index=False)

# ---------------------------------------------------------------
# STEP 4: EDA plots
# ---------------------------------------------------------------
plt.figure(figsize=(8, 5)); sns.histplot(df["rent"], bins=40, kde=True)
plt.title("Distribution of Monthly Rent (INR)"); plt.xlabel("Rent (INR)")
plt.savefig(os.path.join(PLOT_DIR, "1_rent_distribution.png"), dpi=150, bbox_inches="tight"); plt.close()

plt.figure(figsize=(8, 6)); sns.heatmap(df[NUM_COLS + ["rent"]].corr(), annot=True, fmt=".2f", cmap="Blues")
plt.title("Correlation Heatmap")
plt.savefig(os.path.join(PLOT_DIR, "2_correlation_heatmap.png"), dpi=150, bbox_inches="tight"); plt.close()

order = df.groupby("city")["rent"].median().sort_values().index
plt.figure(figsize=(10, 5)); sns.boxplot(data=df, x="city", y="rent", order=order)
plt.xticks(rotation=45); plt.title("Rent by City"); plt.ylabel("Rent (INR)")
plt.savefig(os.path.join(PLOT_DIR, "3_rent_by_city.png"), dpi=150, bbox_inches="tight"); plt.close()

# ---------------------------------------------------------------
# STEP 5: Encoding, scaling, train-test split
# ---------------------------------------------------------------
X = df[NUM_COLS + CAT_COLS]
y_reg = df["rent"]
y_cls = df["price_category"]
X_tr, X_te, yr_tr, yr_te, yc_tr, yc_te = train_test_split(
    X, y_reg, y_cls, test_size=0.2, random_state=RANDOM_STATE, stratify=y_cls)
print("\nTrain size:", len(X_tr), "| Test size:", len(X_te))


def make_preprocessor():   # StandardScaler on numeric, One-Hot on categorical
    return ColumnTransformer([("num", StandardScaler(), NUM_COLS),
                              ("cat", OneHotEncoder(handle_unknown="ignore"), CAT_COLS)])


# ---------------------------------------------------------------
# STEP 6: Linear Regression (rent prediction)
# ---------------------------------------------------------------
print("\n" + "=" * 70, "\nSTEP 6: LINEAR REGRESSION\n" + "=" * 70)
reg_model = Pipeline([("prep", make_preprocessor()), ("model", LinearRegression())])
reg_model.fit(X_tr, yr_tr)
pred = reg_model.predict(X_te)
mse = mean_squared_error(yr_te, pred)
mae = mean_absolute_error(yr_te, pred)
r2 = r2_score(yr_te, pred)
print(f"MSE  : {mse:,.2f}\nRMSE : {math.sqrt(mse):,.2f}\nMAE  : {mae:,.2f}\nR2   : {r2:.4f}")

plt.figure(figsize=(6, 6)); plt.scatter(yr_te, pred, alpha=0.4)
lim = [yr_te.min(), yr_te.max()]; plt.plot(lim, lim, "r--")
plt.xlabel("Actual Rent"); plt.ylabel("Predicted Rent"); plt.title("Actual vs Predicted Rent")
plt.savefig(os.path.join(PLOT_DIR, "4_actual_vs_predicted.png"), dpi=150, bbox_inches="tight"); plt.close()

# ---------------------------------------------------------------
# STEP 7: Classification models
# ---------------------------------------------------------------
print("\n" + "=" * 70, "\nSTEP 7: CLASSIFICATION MODELS\n" + "=" * 70)
classifiers = {
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Decision Tree": DecisionTreeClassifier(max_depth=6, random_state=RANDOM_STATE),
    "k-NN": KNeighborsClassifier(n_neighbors=5),
}
results, fitted = {}, {}
fig, axes = plt.subplots(1, 3, figsize=(16, 4.5))
for ax, (name, clf) in zip(axes, classifiers.items()):
    pipe = Pipeline([("prep", make_preprocessor()), ("model", clf)])
    pipe.fit(X_tr, yc_tr)
    p = pipe.predict(X_te)
    cm = confusion_matrix(yc_te, p, labels=LABELS)
    results[name] = {
        "accuracy": accuracy_score(yc_te, p),
        "precision": precision_score(yc_te, p, average="weighted", zero_division=0),
        "recall": recall_score(yc_te, p, average="weighted", zero_division=0),
        "f1": f1_score(yc_te, p, average="weighted", zero_division=0),
    }
    fitted[name] = pipe
    print(f"\n{name}\nConfusion matrix (rows=actual, cols=predicted; order {LABELS}):\n{cm}")
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=LABELS, yticklabels=LABELS, ax=ax)
    ax.set_title(name); ax.set_xlabel("Predicted"); ax.set_ylabel("Actual")
plt.tight_layout()
plt.savefig(os.path.join(PLOT_DIR, "5_confusion_matrices.png"), dpi=150, bbox_inches="tight"); plt.close()

best_name = max(results, key=lambda k: results[k]["f1"])
print("\nBest classifier (highest weighted F1):", best_name)

# ---------------------------------------------------------------
# STEP 8: K-Means clustering
# ---------------------------------------------------------------
print("\n" + "=" * 70, "\nSTEP 8: K-MEANS CLUSTERING\n" + "=" * 70)
KM_FEATURES = ["rent", "area_sqft", "bedrooms", "bathrooms"]
km_scaler = StandardScaler()
Xk = km_scaler.fit_transform(df[KM_FEATURES])
inertias, sil = [], {}
for k in range(1, 9):
    m = KMeans(n_clusters=k, n_init=10, random_state=RANDOM_STATE).fit(Xk)
    inertias.append(m.inertia_)
    if k >= 2:
        sil[k] = silhouette_score(Xk, m.labels_)
print("Silhouette score by K:", {k: round(v, 3) for k, v in sil.items()})

plt.figure(figsize=(7, 4.5)); plt.plot(range(1, 9), inertias, marker="o")
plt.xlabel("Number of clusters (K)"); plt.ylabel("Inertia"); plt.title("Elbow Method")
plt.savefig(os.path.join(PLOT_DIR, "6_elbow_method.png"), dpi=150, bbox_inches="tight"); plt.close()

K = 3
kmeans = KMeans(n_clusters=K, n_init=10, random_state=RANDOM_STATE).fit(Xk)
df["cluster"] = kmeans.labels_
summary = df.groupby("cluster").agg(properties=("rent", "size"), avg_rent=("rent", "mean"),
                                    avg_area=("area_sqft", "mean"), avg_bedrooms=("bedrooms", "mean")).round(1)
rank = summary["avg_rent"].sort_values().index.tolist()
names = {rank[0]: "Budget / Compact", rank[1]: "Mid-Range / Standard", rank[2]: "Premium / Spacious"}
summary["interpretation"] = [names[i] for i in summary.index]
print("\nCluster summary (K=3):\n", summary.to_string())
df["cluster_label"] = df["cluster"].map(names)

plt.figure(figsize=(8, 5.5)); sns.scatterplot(data=df, x="area_sqft", y="rent", hue="cluster_label", alpha=0.6)
plt.title("K-Means Clusters (K=3)")
plt.savefig(os.path.join(PLOT_DIR, "7_clusters.png"), dpi=150, bbox_inches="tight"); plt.close()
df.to_csv(os.path.join(DATA_DIR, "rental_dataset_clean.csv"), index=False)

# ---------------------------------------------------------------
# STEP 9: Save and load models (joblib)
# ---------------------------------------------------------------
print("\n" + "=" * 70, "\nSTEP 9: SAVE AND LOAD MODEL (joblib)\n" + "=" * 70)
joblib.dump(reg_model, os.path.join(MODEL_DIR, "rent_model.joblib"))
joblib.dump(fitted[best_name], os.path.join(MODEL_DIR, "category_model.joblib"))
joblib.dump({"scaler": km_scaler, "model": kmeans, "names": names},
            os.path.join(MODEL_DIR, "cluster_model.joblib"))
metrics = {"regression": {"mse": mse, "mae": mae, "r2": r2}, "classification": results,
           "best_classifier": best_name, "rows_used": int(len(df))}
with open(os.path.join(MODEL_DIR, "metrics.json"), "w") as f:
    json.dump(metrics, f, indent=2)

loaded = joblib.load(os.path.join(MODEL_DIR, "rent_model.joblib"))
loaded_cls = joblib.load(os.path.join(MODEL_DIR, "category_model.joblib"))
sample = pd.DataFrame([{"bedrooms": 2, "bathrooms": 2, "area_sqft": 1100, "floor": 3,
                        "amenity_count": 5, "city": "Chandigarh",
                        "property_type": "Apartment", "furnished": "Semi-Furnished"}])
print("Sample: 2 BHK Apartment, Chandigarh, 1100 sq ft, Semi-Furnished")
print("Predicted rent     : Rs", f"{loaded.predict(sample)[0]:,.0f}")
print("Predicted category :", loaded_cls.predict(sample)[0])

# ---------------------------------------------------------------
# FINAL: values for the report tables
# ---------------------------------------------------------------
print("\n" + "=" * 70, "\nVALUES FOR REPORT TABLES\n" + "=" * 70)
print(f"Dataset: synthetic Indian rental data, {n0} raw rows -> {len(df)} clean rows")
print("\nTable 3 (Regression)")
print(f"Linear Regression | MSE {mse:,.2f} | MAE {mae:,.2f} | R2 {r2:.4f}")
print("\nTable 4 (Classification)")
for k, v in results.items():
    print(f"{k:20s} | Acc {v['accuracy']:.4f} | Prec {v['precision']:.4f} | Rec {v['recall']:.4f} | F1 {v['f1']:.4f}")
print("\nTable 5 (Clusters)")
print(summary[["interpretation", "avg_rent", "avg_area"]].to_string())
print("\nDone. Plots saved in /plots, models in /models, data in /data")