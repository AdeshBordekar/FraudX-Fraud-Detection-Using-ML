
from flask import Blueprint, request, jsonify, current_app

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/admin/login", methods=["POST"])
def login():
    db = current_app.config["DB"]
    data = request.json

    admin = db.ADMIN.find_one({
        "Email":data["email"],
        "Password":data["password"]
    })

    if not admin:
        return jsonify({"message":"Invalid credentials"}),401

    return jsonify({"message":"Admin login success"})


@admin_bp.route("/admin/users", methods=["GET"])
def users():
    db = current_app.config["DB"]
    users = list(db.Users.find({},{"_id":0}))
    return jsonify(users)


@admin_bp.route("/admin/update-status", methods=["POST"])
def update():
    db = current_app.config["DB"]
    data = request.json

    db.Users.update_one(
        {"User_Id":data["user_id"]},
        {"$set":{"Status":data["status"]}}
    )

    return jsonify({"message":"Status updated"})


@admin_bp.route("/admin/stats", methods=["GET"])
def stats():
    db = current_app.config["DB"]

    users = db.Users.count_documents({})
    emails = db.EMAIL.count_documents({})
    urls = db.URL.count_documents({})
    fraud = db.RESULT.count_documents({"Prediction":"Fraud"})

    return jsonify({
        "total_users":users,
        "emails_scanned":emails,
        "urls_scanned":urls,
        "fraud_detected":fraud
    })
