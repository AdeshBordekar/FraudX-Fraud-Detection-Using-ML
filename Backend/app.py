
from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient

from routes.email_routes import email_bp
from routes.url_routes import url_bp
from routes.admin_routes import admin_bp
from routes.user_routes import user_bp
from routes.history_routes import history_bp

app = Flask(__name__)
CORS(app)

client = MongoClient("mongodb://localhost:27017/")
db = client["FraudX_DB"]

app.config["DB"] = db

app.register_blueprint(email_bp)
app.register_blueprint(url_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(user_bp)
app.register_blueprint(history_bp)

if __name__ == "__main__":
    app.run(debug=True)
