from flask import Blueprint, request, jsonify, current_app
import pickle
import datetime
import re

url_bp = Blueprint("url", __name__)

# Load ML model and TFIDF
model = pickle.load(open("models/url_model.pkl", "rb"))
tfidf = pickle.load(open("models/url_tfidf.pkl", "rb"))


# -----------------------------
# URL Preprocessing (same as training)
# -----------------------------
def clean_url(url):
    url = str(url).lower()
    url = re.sub(r"http[s]?://", "", url)
    url = re.sub(r"www\.", "", url)
    return url


# -----------------------------
# Convert score to label
# -----------------------------
def label(score):
    if score >= 70:
        return "Fraud","red"
    elif score >= 40:
        return "Moderate","orange"
    else:
        return "Safe","green"


# -----------------------------
# URL Risk Factor Analysis
# -----------------------------
def url_risk_factors(url):

    url = url.lower()

    suspicious_tld = [".ru",".tk",".xyz",".top",".gq",".cn"]

    # URL length risk
    length_score = min(len(url),100)

    # Subdomain risk
    subdomain_score = min(url.count(".") * 15,100)

    # Detect IP address URLs
    ip_score = 100 if re.search(r"\d+\.\d+\.\d+\.\d+", url) else 0

    # Suspicious domain extension
    tld_score = 80 if any(tld in url for tld in suspicious_tld) else 20

    return {
        "keywords": length_score,
        "domain": tld_score,
        "urgency": subdomain_score,
        "links": ip_score
    }


# -----------------------------
# URL ANALYSIS API
# -----------------------------
@url_bp.route("/analyze/url", methods=["POST"])
def analyze_url():

    try:

        db = current_app.config["DB"]
        data = request.json

        url_text = data["url_text"]
        user = data.get("user_id", "U001")

        # Clean URL
        clean = clean_url(url_text)

        # TF-IDF transformation
        vec = tfidf.transform([clean])

        # Model probability
        prob = model.predict_proba(vec)[0]

        # Model classes ['bad','good']
        fraud_probability = prob[0]

        score = round(fraud_probability * 100, 2)

        # Convert score to label
        title, color = label(score)

        # -----------------------------
        # Risk Factor Calculation
        # -----------------------------
        factors = url_risk_factors(url_text)

        # Generate unique URL ID
        uid = "URL" + str(int(datetime.datetime.utcnow().timestamp()))

        # -------------------------
        # STORE URL
        # -------------------------
        db.URL.insert_one({
            "URL_Id": uid,
            "User_Id": user,
            "URL_Text": url_text,
            "Time": datetime.datetime.utcnow()
        })

        # -------------------------
        # STORE RESULT
        # -------------------------
        db.RESULT.insert_one({
            "URL_Id": uid,
            "Prediction": title,
            "Score": score
        })

        # -------------------------
        # STORE HISTORY
        # -------------------------
        db.HISTORY_LOG.insert_one({
            "User_Id": user,
            "Type": "URL",
            "Result": title,
            "Reference_Id": uid,
            "Time": datetime.datetime.utcnow()
        })

        # -------------------------
        # RETURN RESPONSE
        # -------------------------
        return jsonify({
            "result": title,
            "score": score,
            "color": color,
            "factors": factors
        })

    except Exception as e:

        print("URL Analysis Error:", e)

        return jsonify({
            "result": "Error",
            "score": 0,
            "color": "red"
        }), 500