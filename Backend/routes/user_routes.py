from flask import Blueprint, request, jsonify, current_app
import datetime

user_bp = Blueprint("user", __name__)

# =========================
# SIGNUP
# =========================
@user_bp.route("/signup", methods=["POST"])
def signup():

    db = current_app.config["DB"]
    data = request.json

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    # Validate fields
    if not name or not email or not password:
        return jsonify({"message": "Missing fields"}), 400

    # Check existing user
    if db.Users.find_one({"Email": email}):
        return jsonify({"message": "User exists"}), 400

    # Generate User ID
    uid = "U" + str(int(datetime.datetime.utcnow().timestamp()))

    db.Users.insert_one({
        "User_Id": uid,
        "Name": name,
        "Email": email,
        "Password": password,
        "Status": "Active",
        "Last_Login": None
    })

    return jsonify({
        "message": "User created",
        "user_id": uid
    })


# =========================
# LOGIN
# =========================
@user_bp.route("/login", methods=["POST"])
def login():

    db = current_app.config["DB"]
    data = request.json

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Missing credentials"}), 400

    user = db.Users.find_one({
        "Email": email,
        "Password": password
    })

    if not user:
        return jsonify({"message": "Invalid credentials"}), 401

    # Update last login
    db.Users.update_one(
        {"User_Id": user["User_Id"]},
        {"$set": {"Last_Login": datetime.datetime.utcnow()}}
    )

    return jsonify({
        "message": "Login success",
        "user_id": user.get("User_Id"),
        "name": user.get("Name", "User")  # Safe access
    })



@user_bp.route("/stats", methods=["GET"])
def get_stats():

        db = current_app.config["DB"]

        email_count = db.EMAIL.count_documents({})
        url_count = db.URL.count_documents({})

        return jsonify({
        "emails": email_count,
        "urls": url_count
        })        