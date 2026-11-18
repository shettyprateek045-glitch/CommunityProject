"""Universal Train & Predict app: upload ANY table, pick the target, train, explain, predict.
Run:  py -m streamlit run automl_app.py
"""
import io, joblib, numpy as np, pandas as pd, streamlit as st
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.metrics import (accuracy_score, f1_score, r2_score, mean_absolute_error,
                             mean_squared_error, ConfusionMatrixDisplay)
from sklearn.inspection import permutation_importance

# ------------------------------------------------------------------ core logic
def guess_task(s: pd.Series) -> str:
    return "regression" if pd.api.types.is_numeric_dtype(s) and s.nunique() > 15 else "classification"

def suggest_features(df, target):
    out = []
    for c in df.columns:
        if c == target: continue
        if c.strip().lower() in ("id", "index", "sr no", "s.no", "unnamed: 0"): continue
        if not pd.api.types.is_float_dtype(df[c]) and df[c].nunique() == len(df) and len(df) > 20:
            continue                                   # looks like an ID column
        out.append(c)
    return out

def make_pipeline(model, num, cat):
    pre = ColumnTransformer([
        ("num", Pipeline([("imp", SimpleImputer(strategy="median")), ("sc", StandardScaler())]), num),
        ("cat", Pipeline([("imp", SimpleImputer(strategy="most_frequent")),
                          ("oh", OneHotEncoder(handle_unknown="ignore"))]), cat)])
    return Pipeline([("pre", pre), ("model", model)])

def train_all(df, target, features, task, test_size=0.2, seed=42):
    d = df.dropna(subset=[target]).drop_duplicates().reset_index(drop=True)
    X, y = d[features], d[target]
    if task == "classification":
        y = y.astype(str).str.strip()
    num = [c for c in features if pd.api.types.is_numeric_dtype(X[c])]
    cat = [c for c in features if c not in num]
    strat = y if task == "classification" and y.value_counts().min() >= 2 else None
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=test_size, random_state=seed, stratify=strat)
    if task == "classification":
        models = {"Random Forest": RandomForestClassifier(n_estimators=200, random_state=seed),
                  "Decision Tree": DecisionTreeClassifier(random_state=seed),
                  "KNN": KNeighborsClassifier(),
                  "Logistic Regression": LogisticRegression(max_iter=2000)}
    else:
        models = {"Random Forest": RandomForestRegressor(n_estimators=200, random_state=seed),
                  "Decision Tree": DecisionTreeRegressor(random_state=seed),
                  "KNN": KNeighborsRegressor(),
                  "Linear Regression": LinearRegression()}
    rows, fitted = [], {}
    for name, m in models.items():
        pipe = make_pipeline(m, num, cat).fit(Xtr, ytr)
        p = pipe.predict(Xte); fitted[name] = pipe
        if task == "classification":
            rows.append({"model": name, "accuracy": accuracy_score(yte, p),
                         "f1 (weighted)": f1_score(yte, p, average="weighted")})
        else:
            rows.append({"model": name, "R2": r2_score(yte, p), "MAE": mean_absolute_error(yte, p),
                         "RMSE": float(np.sqrt(mean_squared_error(yte, p)))})
    res = pd.DataFrame(rows)
    key = "accuracy" if task == "classification" else "R2"
    best_name = res.sort_values(key, ascending=False).iloc[0]["model"]
    best = fitted[best_name]
    sub = Xte.sample(min(500, len(Xte)), random_state=seed)
    imp = permutation_importance(best, sub, yte.loc[sub.index], n_repeats=3, random_state=seed)
    importance = pd.Series(imp.importances_mean, index=features).sort_values()
    defaults = {c: (float(X[c].median()) if c in num else list(X[c].dropna().astype(str).unique()[:200])) for c in features}
    return dict(results=res, best_name=best_name, pipeline=best, importance=importance, task=task,
                target=target, features=features, num=num, cat=cat, defaults=defaults,
                Xte=Xte, yte=yte, n_train=len(Xtr), n_test=len(Xte), key=key,
                score=float(res.set_index("model").loc[best_name, key]))

def predict_one(res, values: dict, top=3):
    row = pd.DataFrame([values], columns=res["features"])
    pipe = res["pipeline"]
    out = pipe.predict(row)[0]
    probs = None
    if res["task"] == "classification" and hasattr(pipe, "predict_proba"):
        pr = pipe.predict_proba(row)[0]; cls = pipe.classes_
        idx = pr.argsort()[::-1][:top]
        probs = [(str(cls[i]), float(pr[i])) for i in idx]
    return out, probs

def bundle_bytes(res):
    keep = {k: res[k] for k in ("pipeline", "features", "target", "task", "best_name", "score", "defaults")}
    buf = io.BytesIO(); joblib.dump(keep, buf); return buf.getvalue()

# ------------------------------------------------------------------ UI
st.set_page_config(page_title="Universal Train & Predict", page_icon="🤖", layout="wide")
st.title("🤖 Universal Train & Predict")
st.caption("Upload any table, choose what to predict, and get a trained, explained model and a prediction form.")

@st.cache_data(show_spinner=False)
def read_any(name, data):
    bio = io.BytesIO(data)
    return pd.read_excel(bio) if name.lower().endswith((".xlsx", ".xls")) else pd.read_csv(bio)

with st.sidebar:
    st.header("1. Your data")
    up = st.file_uploader("Upload CSV or Excel", type=["csv", "xlsx", "xls"])
    path = st.text_input("...or a file path on this computer", placeholder=r"C:\Users\Admin\Downloads\data.csv")

df = None
try:
    if up is not None:
        df = read_any(up.name, up.getvalue())
    elif path.strip():
        p = path.strip().strip('"')
        with open(p, "rb") as f:
            df = read_any(p, f.read())
except Exception as e:
    st.error(f"Could not read the file: {e}")
if df is None:
    st.info("Upload a CSV/Excel file (or type its path) in the sidebar to begin.")
    st.stop()
df.columns = [str(c).strip() for c in df.columns]

tab1, tab2, tab3, tab4 = st.tabs(["① Check data", "② Train", "③ Predict", "④ Batch predict"])

with tab1:
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Rows", f"{len(df):,}"); c2.metric("Columns", df.shape[1])
    c3.metric("Missing cells", int(df.isna().sum().sum())); c4.metric("Duplicate rows", int(df.duplicated().sum()))
    st.dataframe(df.head(20), width="stretch")
    info = pd.DataFrame({"type": df.dtypes.astype(str), "missing": df.isna().sum(),
                         "unique values": df.nunique()})
    st.write("Column summary"); st.dataframe(info, width="stretch")

with tab2:
    cols = list(df.columns)
    target = st.selectbox("Column to predict (target)", cols, index=len(cols) - 1)
    task_guess = guess_task(df[target])
    task = st.radio("Task", ["classification", "regression"], index=0 if task_guess == "classification" else 1,
                    horizontal=True, help="Classification = categories (crop, disease). Regression = a number (price, yield).")
    feats = st.multiselect("Input columns (features)", [c for c in cols if c != target],
                           default=suggest_features(df, target))
    test_size = st.slider("Share of data kept for testing", 0.1, 0.4, 0.2, 0.05)
    if st.button("Train models", type="primary"):
        if not feats:
            st.warning("Pick at least one input column.")
        elif task == "regression" and not pd.api.types.is_numeric_dtype(df[target]):
            st.warning("Regression needs a numeric target column.")
        else:
            with st.spinner("Training and comparing models..."):
                st.session_state["res"] = train_all(df, target, feats, task, test_size)
    res = st.session_state.get("res")
    if res:
        st.success(f"Best model: **{res['best_name']}**  |  {res['key']}: **{res['score']:.4f}**  "
                   f"(trained on {res['n_train']:,} rows, tested on {res['n_test']:,})")
        st.write("Model comparison"); st.dataframe(res["results"].round(4), hide_index=True, width="stretch")
        a, b = st.columns(2)
        with a:
            st.write("Which inputs matter most")
            fig, ax = plt.subplots(figsize=(5, max(2.5, 0.35 * len(res["importance"]))))
            res["importance"].plot(kind="barh", ax=ax, color="#13275F"); ax.set_xlabel("importance")
            st.pyplot(fig)
        with b:
            if res["task"] == "classification":
                st.write("Confusion matrix (test data)")
                fig, ax = plt.subplots(figsize=(6, 5))
                ConfusionMatrixDisplay.from_predictions(res["yte"], res["pipeline"].predict(res["Xte"]), ax=ax,
                                                        xticks_rotation=90, colorbar=False)
                st.pyplot(fig)
            else:
                st.write("Actual vs predicted (test data)")
                fig, ax = plt.subplots(figsize=(5, 5))
                pr = res["pipeline"].predict(res["Xte"]); ax.scatter(res["yte"], pr, s=12, alpha=.6)
                lim = [min(res["yte"].min(), pr.min()), max(res["yte"].max(), pr.max())]
                ax.plot(lim, lim, "r--"); ax.set_xlabel("actual"); ax.set_ylabel("predicted")
                st.pyplot(fig)
        st.download_button("⬇ Download trained model (.pkl)", bundle_bytes(res), "trained_model.pkl")

with tab3:
    res = st.session_state.get("res")
    if not res:
        st.info("Train a model in tab ② first.")
    else:
        st.write(f"Predict **{res['target']}** from these inputs:")
        vals, cols_ui = {}, st.columns(3)
        for i, f in enumerate(res["features"]):
            with cols_ui[i % 3]:
                d = res["defaults"][f]
                if f in res["num"]:
                    vals[f] = st.number_input(f, value=float(d), key=f"in_{f}")
                else:
                    vals[f] = st.selectbox(f, d, key=f"in_{f}")
        out, probs = predict_one(res, vals)
        st.success(f"Prediction: **{out if res['task']=='classification' else round(float(out), 4)}**")
        if probs:
            st.bar_chart(pd.DataFrame({"confidence %": [p * 100 for _, p in probs]}, index=[c for c, _ in probs]))

with tab4:
    res = st.session_state.get("res")
    if not res:
        st.info("Train a model in tab ② first.")
    else:
        st.write("Upload a file with the same input columns to predict many rows at once.")
        bf = st.file_uploader("Batch file (CSV/Excel)", type=["csv", "xlsx", "xls"], key="batch")
        if bf is not None:
            bd = read_any(bf.name, bf.getvalue()); bd.columns = [str(c).strip() for c in bd.columns]
            miss = [c for c in res["features"] if c not in bd.columns]
            if miss:
                st.error(f"Missing columns: {miss}")
            else:
                bd[f"predicted_{res['target']}"] = res["pipeline"].predict(bd[res["features"]])
                st.dataframe(bd.head(50), width="stretch")
                st.download_button("⬇ Download predictions (CSV)", bd.to_csv(index=False).encode(), "predictions.csv")
