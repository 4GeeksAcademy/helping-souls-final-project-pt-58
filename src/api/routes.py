"""
API Routes
"""

# =====================
# STANDARD LIB
# =====================
import os
import os
import stripe
from datetime import datetime
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

api = Blueprint("api", __name__)
CORS(api)


import cloudinary
import cloudinary.uploader
import cloudinary.api

# =====================
# LOCAL IMPORTS
# =====================
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
from api.utils import generate_sitemap, APIException

# =====================
# ENV
# =====================
load_dotenv()

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
    """Always return JWT identity as int"""
    return int(get_jwt_identity())


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# =====================
# AUTH
# =====================

@api.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email", "").lower()
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({"msg": "Invalid credentials"}), 401

    # 🔥 FIX CLAVE: JWT sub DEBE ser string
    access_token = create_access_token(identity=str(user.userID))

    organizer = Organizer.query.filter_by(userID=user.userID).first()
    volunteer = Volunteer.query.filter_by(userID=user.userID).first()

    role = "organizer" if organizer else "volunteer" if volunteer else None

    user_data = user.serialize()
    user_data["role"] = role

    return jsonify({
        "token": access_token,
        "user": user_data
    }), 200


@api.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()

    name = data.get("name")
    email = data.get("email", "").lower()
    password = data.get("password")
    role = data.get("role")

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email already exists"}), 409

    hashed_password = generate_password_hash(password)
    user = User(name=name, email=email, password=hashed_password)

    db.session.add(user)
    db.session.flush()

    if role == "organizer":
        organizer = Organizer(
            userID=user.userID,
            name=data.get("org_name"),
            org_link=data.get("org_link")
        )
        db.session.add(organizer)

    if role == "volunteer":
        volunteer = Volunteer(userID=user.userID)
        db.session.add(volunteer)

        db.session.commit()

        return jsonify({
            "msg": "Usuario creado con éxito",
            "user": new_user.serialize(),
            "role": role
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "msg": "Internal Server Error",
            "error": str(e)
        }), 500

# POST Y GET DE EVENTOS


@api.route("/new_events", methods=["POST"])
@jwt_required()
def new_event():
    try:
        #  Obtener userID desde el JWT
        user_id = get_jwt_identity()

        #  Verificar que el usuario sea organizador
        organizer = Organizer.query.filter_by(userID=user_id).first()
        if organizer is None:
            return jsonify({
                "msg": "User is not registered as organizer"
            }), 403

        #  Detectar tipo de request
        if request.content_type and request.content_type.startswith("multipart/form-data"):
            data = request.form
            file = request.files.get("image")
        else:
            data = request.get_json()
            file = None

        if not data:
            return jsonify({"msg": "No data provided"}), 400

        #  Validar campos requeridos
        required_fields = [
            "name",
            "event_date",
            "location",
            "category",
            "max_volunteers",
            "description"
        ]

        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({
                    "msg": f"Missing or empty field: {field}"
                }), 400

        #  Validar fecha
        try:
            event_date = datetime.fromisoformat(data["event_date"]).date()
        except ValueError:
            return jsonify({
                "msg": "Invalid date format. Use YYYY-MM-DD"
            }), 400

        #  Manejo de imagen (opcional)
        image_filename = None
        if file:
            if not allowed_file(file.filename):
                return jsonify({
                    "msg": "Invalid image format"
                }), 400

            filename = secure_filename(file.filename)
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            file.save(os.path.join(UPLOAD_FOLDER, filename))
            image_filename = filename

        #  Crear evento
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

        #  Respuesta correcta
        return jsonify({
            "msg": "Event created successfully",
            "event": event.serialize()
        }), 201

    except Exception as e:
        #  Log REAL del error
        print(" CREATE EVENT ERROR:", e)

        return jsonify({
            "msg": "Internal server error",
            "error": str(e)
        }), 500

#  Editar evento

@api.route("/events/<int:event_id>", methods=["PUT"])
@jwt_required()
def update_event(event_id):
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    # 1) Validar organizer
    organizer = Organizer.query.filter_by(userID=user_id).first()
    if not organizer:
        return jsonify({"msg": "User is not registered as organizer"}), 403

    # 2) Buscar evento
    event = Events.query.get(event_id)
    if not event:
        return jsonify({"msg": "Event not found"}), 404

    # 3) Verificar que sea dueño del evento
    if event.organizerID != organizer.organizerID:
        return jsonify({"msg": "Not authorized to edit this event"}), 403

    # 4) Actualizar campos si vienen en el body
    if "name" in data: event.name = data["name"]
    if "event_date" in data:
        try:
            event.event_date = datetime.fromisoformat(data["event_date"]).date()
        except ValueError:
            return jsonify({"msg": "Invalid date format. Use YYYY-MM-DD"}), 400
    if "location" in data: event.location = data["location"]
    if "category" in data: event.category = data["category"]
    if "max_volunteers" in data:
        event.max_volunteers = int(data["max_volunteers"]) if data["max_volunteers"] is not None else None
    if "description" in data: event.description = data["description"]

    db.session.commit()
    return jsonify({"msg": "User created"}), 201


# =====================
# EVENTS
# =====================

@api.route("/events", methods=["GET"])
@jwt_required()
def get_events():
    current_user_id()

    events = Events.query.all()
    return jsonify({
        "events": [e.serialize() for e in events]
    }), 200


@api.route("/events/<int:event_id>", methods=["GET"])
@jwt_required()
def get_event(event_id):
    current_user_id()

    event = Events.query.get(event_id)
    if not event:
        return jsonify({"msg": "Event not found"}), 404
    organizer = Organizer.query.get(event.organizerID) if event.organizerID else None

    return jsonify({"event": event.serialize()}), 200


@api.route("/new_events", methods=["POST"])
@jwt_required()
def create_event():
    user_id = current_user_id()

    organizer = Organizer.query.filter_by(userID=user_id).first()
    if not organizer:
        return jsonify({"msg": "Not an organizer"}), 403

    data = request.form if request.form else request.get_json()
    file = request.files.get("image")

    image = None
    if file and allowed_file(file.filename):
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        filename = secure_filename(file.filename)
        file.save(os.path.join(UPLOAD_FOLDER, filename))
        image = filename

    event = Events(
        organizerID=organizer.organizerID,
        name=data["name"],
        event_date=datetime.fromisoformat(data["event_date"]).date(),
        location=data["location"],
        category=data["category"],
        max_volunteers=int(data["max_volunteers"]),
        description=data["description"],
        image=image
    )

    db.session.add(event)
    db.session.commit()

    return jsonify({"event": event.serialize()}), 201


# =====================
# INSCRIPTIONS
# =====================

@api.route("/events/<int:event_id>/apply", methods=["POST"])
@jwt_required()
def apply_event(event_id):
    user_id = current_user_id()
    data = request.get_json()

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
        full_name=data["fullName"],
        phone=data["phone"],
        document_id=data["documentId"],
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

    return jsonify({
        "isInscribed": True,
        "inscription": insc.serialize()
    }), 200


# =====================
# INTERESTS
# =====================

@api.route("/events/<int:event_id>/interest", methods=["POST"])
@jwt_required()
def add_interest(event_id):
    user_id = current_user_id()

    existing = Interest.query.filter_by(
        userID=user_id,
        fav_event=event_id
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
        userID=user_id,
        fav_event=event_id
    ).first()

    return jsonify({"isInterested": interest is not None}), 200


# =====================
# CONTACT
# =====================

@api.route("/contact", methods=["POST"])
def contact():
    data = request.get_json()

    msg = ContactMessage(
        name=data["name"],
        email=data["email"],
        message=data["message"]
    )

    db.session.add(msg)
    db.session.commit()

    return jsonify({"msg": "Message sent"}), 201
    
#For organizer profile
@api.route("/organizers/<int:organizer_id>", methods=["GET"])
@jwt_required()
def get_organizer_profile(organizer_id):
    user_id = get_jwt_identity()  # valida token (opcional, pero consistente)

    organizer = Organizer.query.get(organizer_id)
    if not organizer:
        return jsonify({"msg": "Organizer not found"}), 404

    events = Events.query.filter_by(organizerID=organizer_id).all()

    return jsonify({
        "organizer": {
            "organizerID": organizer.organizerID,
            "userID": organizer.userID,
            "name": organizer.name,
            "org_link": organizer.org_link
        },
        "events": [
            {
                "eventID": e.eventID,
                "name": e.name,
                "event_date": e.event_date.isoformat() if e.event_date else None,
                "location": e.location,
                "category": e.category,
                "max_volunteers": e.max_volunteers,
                "description": e.description,
                "organizerID": e.organizerID,
                "image": e.image
            } for e in events
        ],
        "total_events": len(events)
    }), 200

