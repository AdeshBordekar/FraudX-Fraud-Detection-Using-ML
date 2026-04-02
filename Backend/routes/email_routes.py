from flask import Blueprint, request, jsonify, current_app
import pickle
import datetime
import re

email_bp = Blueprint("email", __name__)

# Load ML model
model = pickle.load(open("models/email_model.pkl","rb"))
tfidf = pickle.load(open("models/tfidf.pkl","rb"))


# --------------------------------
# Label based on confidence score
# --------------------------------
def label(score):

    if score >= 70:
        return "Fraud","red"

    elif score >= 40:
        return "Moderate","orange"

    else:
        return "Safe","green"


# --------------------------------
# Risk Factor Analysis
# --------------------------------
def email_risk_factors(text):

    text = text.lower()

    phishing_words = [
        "verify","urgent","password","bank",
        "account","login","click","limited",
        "suspended","update","security"
    ]

    urgency_words = [
        "immediately","now","asap","urgent",
        "today","within 24 hours","act now"
    ]

    # Detect links
    links = re.findall(r"http[s]?://", text)

    # Keyword detection
    keyword_count = sum(word in text for word in phishing_words)
    urgency_count = sum(word in text for word in urgency_words)

    keyword_score = min(keyword_count * 10, 100)
    urgency_score = min(urgency_count * 20, 100)
    link_score = min(len(links) * 25, 100)

    # Spoofed domain detection
    domain_score = 50 if "@" in text else 20

    return {
        "keywords": keyword_score,
        "domain": domain_score,
        "urgency": urgency_score,
        "links": link_score
    }


# --------------------------------
# EMAIL ANALYSIS API
# --------------------------------
@email_bp.route("/analyze/email", methods=["POST"])
def analyze_email():

    db = current_app.config["DB"]
    data = request.json

    text = data.get("email_text","")
    user = data.get("user_id","U001")

    if not text.strip():
        return jsonify({"error":"Empty email"}),400


    # -----------------------------
    # ML Prediction
    # -----------------------------
    vec = tfidf.transform([text])

    prob = model.predict_proba(vec)[0][1]
    score = round(prob * 100, 2)

    title,color = label(score)


    # -----------------------------
    # Risk Factor Calculation
    # -----------------------------
    factors = email_risk_factors(text)


    # -----------------------------
    # Generate Email ID
    # -----------------------------
    eid = "E"+str(int(datetime.datetime.utcnow().timestamp()))


    # -----------------------------
    # Store Email
    # -----------------------------
    db.EMAIL.insert_one({
        "Email_Id":eid,
        "User_Id":user,
        "Email_Text":text,
        "Time":datetime.datetime.utcnow()
    })


    # -----------------------------
    # Store Result
    # -----------------------------
    db.RESULT.insert_one({
        "Email_Id":eid,
        "Prediction":title,
        "Score":score
    })


    # -----------------------------
    # Store History
    # -----------------------------
    db.HISTORY_LOG.insert_one({
        "User_Id":user,
        "Type":"Email",
        "Result":title,
        "Reference_Id":eid,
        "Time":datetime.datetime.utcnow()
    })


    # -----------------------------
    # API Response
    # -----------------------------
    return jsonify({
        "result":title,
        "score":score,
        "color":color,
        "factors":factors
    })