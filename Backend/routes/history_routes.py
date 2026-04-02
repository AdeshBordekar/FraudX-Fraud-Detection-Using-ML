
from flask import Blueprint, jsonify, current_app

history_bp = Blueprint("history", __name__)

@history_bp.route("/history/<user_id>", methods=["GET"])
def get_history(user_id):
    db = current_app.config["DB"]

    logs = list(
    db.HISTORY_LOG
    .find({"User_Id": user_id}, {"_id": 0})
    .sort("Time", -1)
    .limit(20)
    )

    return jsonify(logs)
