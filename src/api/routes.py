"""
API Routes
"""
import os
from datetime import datetime

import stripe
from flask import request, jsonify, Blueprint
from flask_cors import CORS
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

from api.models import (
    db,
    User,
    Events,
    Organizer,
    Volunteer,
    Inscription,
    Interest,
    ContactMessage
)

# =====================
# BLUEPRINT + CORS
# =====================

api = Blueprint("api", __name__)

CORS(
    api,
    resources={r"/*": {"origins": "*"}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
)

@api.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response


# =====================
# CONFIG
# =====================

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL")


# =====================
# HELPERS
# =====================

def current_user_id():
    identity = get_jwt_identity()
    if identity is None:
        raise ValueError("Missing JWT identity")
    return int(identity)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# =====================
# BASIC / HELLO
# =====================

@api.route("/hello", methods=["GET"])
def hello():
    return jsonify({"message": "ok"}), 200


# =====================
# AUTH
# =====================

@api.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").lower().strip()
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({"msg": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user.userID))

    organizer = Organizer.query.filter_by(userID=user.userID).first()
    volunteer = Volunteer.query.filter_by(userID=user.userID).first()
    role = "organizer" if organizer else "volunteer" if volunteer else None

    user_data = user.serialize()
    user_data["role"] = role

    return jsonify({"token": access_token, "user": user_data}), 200


@api.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json() or {}

        name = data.get("name")
        email = (data.get("email") or "").lower().strip()
        password = data.get("password")
        role = data.get("role")

        if not name or not email or not password or role not in ("organizer", "volunteer"):
            return jsonify({"msg": "Missing required fields"}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({"msg": "Email already exists"}), 409

        hashed_password = generate_password_hash(password)
        user = User(name=name, email=email, password=hashed_password)

        db.session.add(user)
        db.session.flush()

        if role == "organizer":
            organizer = Organizer(
                userID=user.userID,
                name=data.get("org_name") or name,
                org_link=data.get("org_link")
            )
            db.session.add(organizer)
        elif role == "volunteer":
            volunteer = Volunteer(userID=user.userID)
            db.session.add(volunteer)

        db.session.commit()
        return jsonify({"msg": "User created"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Internal Server Error", "error": str(e)}), 500


# =====================
# EVENTS
# =====================

@api.route("/events", methods=["GET"])
@jwt_required()
def get_events():
    current_user_id()
    events = Events.query.all()
    return jsonify({"events": [e.serialize() for e in events]}), 200


@api.route("/events/<int:event_id>", methods=["GET"])
@jwt_required()
def get_event(event_id):
    current_user_id()

    event = Events.query.get(event_id)
    if not event:
        return jsonify({"msg": "Event not found"}), 404

    return jsonify({"event": event.serialize()}), 200


@api.route("/new_events", methods=["POST"])
@jwt_required()
def create_event():
    try:
        user_id = current_user_id()

        organizer = Organizer.query.filter_by(userID=user_id).first()
        if not organizer:
            return jsonify({"msg": "Not an organizer"}), 403

        if request.content_type and request.content_type.startswith("multipart/form-data"):
            data = request.form
            file = request.files.get("image")
        else:
            data = request.get_json() or {}
            file = None

        required_fields = [
            "name", "event_date", "location",
            "category", "max_volunteers", "description"
        ]

        for field in required_fields:
            if not data.get(field):
                return jsonify({"msg": f"Missing or empty field: {field}"}), 400

        try:
            event_date = datetime.fromisoformat(str(data["event_date"])).date()
        except ValueError:
            return jsonify({"msg": "Invalid date format. Use YYYY-MM-DD"}), 400

        image_filename = None
        if file and file.filename:
            if not allowed_file(file.filename):
                return jsonify({"msg": "Invalid image format"}), 400
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            filename = secure_filename(file.filename)
            file.save(os.path.join(UPLOAD_FOLDER, filename))
            image_filename = filename

        event = Events(
            organizerID=organizer.organizerID,
            name=data["name"],
            event_date=event_date,
            location=data["location"],
            category=data["category"],
            max_volunteers=int(data["max_volunteers"]),
            description=data["description"],
            image=image_filename
        )

        db.session.add(event)
        db.session.commit()
        return jsonify({"msg": "Event created successfully", "event": event.serialize()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Internal server error", "error": str(e)}), 500


@api.route("/events/<int:event_id>", methods=["PUT"])
@jwt_required()
def update_event(event_id):
    user_id = current_user_id()
    data = request.get_json() or {}

    organizer = Organizer.query.filter_by(userID=user_id).first()
    if not organizer:
        return jsonify({"msg": "User is not registered as organizer"}), 403

    event = Events.query.get(event_id)
    if not event:
        return jsonify({"msg": "Event not found"}), 404

    if event.organizerID != organizer.organizerID:
        return jsonify({"msg": "Not authorized to edit this event"}), 403

    if "name" in data:
        event.name = data["name"]

    if "event_date" in data:
        try:
            event.event_date = datetime.fromisoformat(str(data["event_date"])).date()
        except ValueError:
            return jsonify({"msg": "Invalid date format. Use YYYY-MM-DD"}), 400

    if "location" in data:
        event.location = data["location"]

    if "category" in data:
        event.category = data["category"]

    if "max_volunteers" in data:
        event.max_volunteers = int(data["max_volunteers"])

    if "description" in data:
        event.description = data["description"]

    db.session.commit()
    return jsonify({"msg": "Event updated", "event": event.serialize()}), 200


# =====================
# INSCRIPTIONS
# =====================

@api.route("/events/<int:event_id>/apply", methods=["POST"])
@jwt_required()
def apply_event(event_id):
    user_id = current_user_id()
    data = request.get_json() or {}

    volunteer = Volunteer.query.filter_by(userID=user_id).first()
    if not volunteer:
        return jsonify({"msg": "Not a volunteer"}), 403

    existing = Inscription.query.filter_by(
        volunteerID=volunteer.volunteerID,
        eventID=event_id
    ).first()

    if existing:
        return jsonify({"msg": "Already registered"}), 400

    inscription = Inscription(
        volunteerID=volunteer.volunteerID,
        eventID=event_id,
        full_name=data.get("fullName"),
        phone=data.get("phone"),
        document_id=data.get("documentId"),
        message=data.get("message", ""),
        status="pending"
    )

    db.session.add(inscription)
    db.session.commit()

    return jsonify({"inscription": inscription.serialize()}), 201


@api.route("/events/<int:event_id>/inscription", methods=["GET"])
@jwt_required()
def get_inscription(event_id):
    user_id = current_user_id()

    volunteer = Volunteer.query.filter_by(userID=user_id).first()
    if not volunteer:
        return jsonify({"isInscribed": False, "inscription": None}), 200

    insc = Inscription.query.filter_by(
        volunteerID=volunteer.volunteerID,
        eventID=event_id
    ).first()

    if not insc:
        return jsonify({"isInscribed": False, "inscription": None}), 200

    return jsonify({"isInscribed": True, "inscription": insc.serialize()}), 200


# Alias plural (para frontend)
@api.route("/events/<int:event_id>/inscriptions", methods=["GET"])
@jwt_required()
def get_inscriptions_alias(event_id):
    return get_inscription(event_id)


# =====================
# INTERESTS
# =====================

@api.route("/events/<int:event_id>/interest", methods=["POST"])
@jwt_required()
def add_interest(event_id):
    user_id = current_user_id()

    existing = Interest.query.filter_by(
        userID=user_id, fav_event=event_id
    ).first()

    if existing:
        return jsonify({"msg": "Already saved"}), 200

    interest = Interest(userID=user_id, fav_event=event_id)
    db.session.add(interest)
    db.session.commit()

    return jsonify({"interest": interest.serialize()}), 201


@api.route("/events/<int:event_id>/interest", methods=["GET"])
@jwt_required()
def get_interest(event_id):
    user_id = current_user_id()
    interest = Interest.query.filter_by(
        userID=user_id, fav_event=event_id
    ).first()
    return jsonify({"isInterested": interest is not None}), 200


# =====================
# CONTACT
# =====================

@api.route("/contact", methods=["POST"])
def contact():
    data = request.get_json() or {}

    msg = ContactMessage(
        name=data.get("name"),
        email=data.get("email"),
        message=data.get("message")
    )

    db.session.add(msg)
    db.session.commit()

    return jsonify({"msg": "Message sent"}), 201


# =====================
# ORGANIZER PROFILE
# =====================

@api.route("/organizers/<int:organizer_id>", methods=["GET"])
@jwt_required()
def get_organizer_profile(organizer_id):
    current_user_id()

    organizer = Organizer.query.get(organizer_id)
    if not organizer:
        return jsonify({"msg": "Organizer not found"}), 404

    events = Events.query.filter_by(organizerID=organizer.organizerID).all()

    return jsonify({
        "organizer": {
            "organizerID": organizer.organizerID,
            "userID": organizer.userID,
            "name": organizer.name,
            "org_link": organizer.org_link
        },
        "events": [e.serialize() for e in events],
        "total_events": len(events)
    }), 200
