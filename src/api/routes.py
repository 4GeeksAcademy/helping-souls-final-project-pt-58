"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""

# =====================
# STANDARD LIB
# =====================
import os
from datetime import datetime

# =====================
# THIRD PARTY
# =====================
import stripe
from dotenv import load_dotenv
from flask import Flask, request, jsonify, url_for, Blueprint
from flask_cors import CORS
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

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

FRONTEND_URL = "https://jubilant-fiesta-jrj7v6gp65r3pjjg-3000.app.github.dev/"

# =====================
# HELPERS
# =====================


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# =====================
# BLUEPRINT
# =====================
api = Blueprint("api", __name__)
CORS(api)

# =====================
# CLOUDINARY
# =====================
cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
    secure=True
)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200


# LOGIN Y SIGNUP

@api.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email", "").lower()
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({"msg": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user.userID))

    # Obtener rol del usuario
    role = None
    organizer = Organizer.query.filter_by(userID=user.userID).first()
    volunteer = Volunteer.query.filter_by(userID=user.userID).first()

    if organizer:
        role = "organizer"
    elif volunteer:
        role = "volunteer"

    # Serializar usuario y agregar rol
    user_data = user.serialize()
    user_data["role"] = role  # agregamos el rol aquí

    return jsonify({
        "msg": "Login successful",
        "token": access_token,
        "user": user_data
    }), 200


@api.route("/signup", methods=["POST"])
def signup():

    data = request.get_json()

    if not data:
        return jsonify({"msg": "No se proporcionaron datos"}), 400

    name = data.get("name")
    email = data.get("email", "").lower()
    password = data.get("password")
    role = data.get("role")

    if not name or not email or not password or not role:
        return jsonify({"msg": "Faltan campos obligatorios"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Ya existe un usuario con ese email"}), 409

    # VALIDAR ROL ANTES DE CREAR USER
    if role == "organizer":
        org_name = data.get("org_name")
        org_link = data.get("org_link")

        if not org_name or not org_link:
            return jsonify({"msg": "Faltan datos del organizador"}), 400

    elif role == "volunteer":
        pass

    else:
        return jsonify({"msg": "Rol inválido"}), 400

    hashed_password = generate_password_hash(password)

    try:
        # Crear usuario
        new_user = User(
            name=name,
            email=email,
            password=hashed_password
        )
        db.session.add(new_user)
        db.session.flush()  # obtiene userID sin commit

        # Crear rol
        if role == "organizer":
            organizer = Organizer(
                userID=new_user.userID,
                name=org_name,
                org_link=org_link
            )
            db.session.add(organizer)

        elif role == "volunteer":
            volunteer = Volunteer(userID=new_user.userID)
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


@api.route("/cloudinary_test", methods=["POST"])
def cloudinary_test():
    file = request.files.get("image")
    result = cloudinary.uploader.upload(file)
    return jsonify({"url": result["secure_url"]}), 200


# POST Y GET DE EVENTOS

@api.route("/new_events", methods=["POST"])
@jwt_required()
def create_event():
    try:
        user_id = get_jwt_identity()

        organizer = Organizer.query.filter_by(userID=user_id).first()
        if not organizer:
            return jsonify({"msg": "Not an organizer"}), 403

        # ===== Detectar tipo de request =====
        if request.content_type and request.content_type.startswith("multipart/form-data"):
            data = request.form
            file = request.files.get("image")
        else:
            data = request.get_json() or {}
            file = None

        # ===== Campos requeridos =====
        required_fields = [
            "name",
            "event_date",
            "event_time",
            "city",
            "location",
            "category",
            "max_volunteers",
            "description"
        ]

        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    "msg": f"Missing or empty field: {field}"
                }), 400

        # ===== Parse fecha =====
        try:
            event_date = datetime.fromisoformat(
                str(data["event_date"])
            ).date()
        except ValueError:
            return jsonify({
                "msg": "Invalid event_date format. Use YYYY-MM-DD"
            }), 400

        # ===== Parse hora =====
        try:
            event_time = datetime.strptime(
                data["event_time"],
                "%H:%M"
            ).time()
        except ValueError:
            return jsonify({
                "msg": "Invalid event_time format. Use HH:MM"
            }), 400

        # ===== Imagen (Cloudinary) =====
        image_url = None
        if file and file.filename:
            if not allowed_file(file.filename):
                return jsonify({
                    "msg": "Invalid image format"
                }), 400

            upload_result = cloudinary.uploader.upload(
                file,
                folder="events"
            )
            image_url = upload_result.get("secure_url")

        # ===== Crear evento =====
        event = Events(
            organizerID=organizer.organizerID,
            name=data["name"],
            event_date=event_date,
            event_time=event_time,
            city=data["city"],
            location=data["location"],
            category=data["category"],
            max_volunteers=int(data["max_volunteers"]),
            description=data["description"],
            image=image_url
        )

        db.session.add(event)
        db.session.commit()

        return jsonify({
            "msg": "Event created successfully",
            "event": event.serialize()
        }), 201

    except Exception as e:
        db.session.rollback()
        print(" ERROR EN /new_events ")
        print(e)
        import traceback
        traceback.print_exc()

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
    if "name" in data:
        event.name = data["name"]
    if "event_date" in data:
        try:
            event.event_date = datetime.fromisoformat(
                data["event_date"]).date()
        except ValueError:
            return jsonify({"msg": "Invalid date format. Use YYYY-MM-DD"}), 400
    if "location" in data:
        event.location = data["location"]
    if "category" in data:
        event.category = data["category"]
    if "max_volunteers" in data:
        event.max_volunteers = int(
            data["max_volunteers"]) if data["max_volunteers"] is not None else None
    if "description" in data:
        event.description = data["description"]

    db.session.commit()

    return jsonify({
        "msg": "Event updated successfully",
        "event": event.serialize()
    }), 200

# ////////////////


@api.route("/events", methods=["GET"])
@jwt_required()
def get_all_events():

    user_id = get_jwt_identity()  # solo valida token

    events = Events.query.all()

    return jsonify({
        "total": len(events),
        "events": [
            {
                "eventID": event.eventID,
                "name": event.name,
                "event_date": event.event_date.isoformat(),
                "location": event.location,
                "city":event.city,
                "category": event.category,
                "max_volunteers": event.max_volunteers,
                "description": event.description,
                "organizerID": event.organizerID,
                "image": event.image
            }
            for event in events
        ]
    }), 200


@api.route("/events/<int:event_id>", methods=["GET"])
@jwt_required()
def get_event_detail(event_id):

    user_id = get_jwt_identity()

    event = Events.query.get(event_id)
    if not event:
        return jsonify({"msg": "Event not found"}), 404

    organizer = Organizer.query.get(
        event.organizerID) if event.organizerID else None

    return jsonify({
        "event": {
            "eventID": event.eventID,
            "name": event.name,
            "event_date": event.event_date.isoformat() if event.event_date else None,
            "event_time": event.event_time.strftime("%H:%M") if event.event_time else None,
            "city": event.city,
            "location": event.location,
            "category": event.category,
            "max_volunteers": event.max_volunteers,
            "description": event.description,
            "organizerID": event.organizerID,
            "organizer_name": organizer.name if organizer else None,
            "image": event.image
        }
    }), 200


@api.route("/events/<int:event_id>", methods=["DELETE"])
@jwt_required()
def delete_event(event_id):
    user_id = get_jwt_identity()

    # Buscar organizer asociado al user
    organizer = Organizer.query.filter_by(userID=user_id).first()

    if not organizer:
        return jsonify({"msg": "Only organizers can delete events"}), 403

    # Buscar evento
    event = Events.query.get(event_id)

    if not event:
        return jsonify({"msg": "Event not found"}), 404

    # Verificar que el organizer sea el dueño del evento
    if event.organizerID != organizer.organizerID:
        return jsonify({"msg": "You are not allowed to delete this event"}), 403

    try:
        db.session.delete(event)
        db.session.commit()
        return jsonify({"msg": "Event deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "msg": "Error deleting event",
            "error": str(e)
        }), 500


# Endpoints para inscripcion a campañas


@api.route("/events/<int:event_id>/apply", methods=["POST"])
@jwt_required()
def apply_to_event(event_id):

    # 🔐 user.id desde JWT
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    full_name = data.get("fullName")
    phone = data.get("phone")
    document_id = data.get("documentId")
    message = data.get("message", "")

    # ===== VALIDACIONES =====
    if not full_name or not phone or not document_id:
        return jsonify({
            "msg": "Missing required fields",
            "required": ["fullName", "phone", "documentId"]
        }), 400

    # ===== VALIDAR VOLUNTEER =====
    volunteer = Volunteer.query.filter_by(userID=user_id).first()
    if not volunteer:
        return jsonify({
            "msg": "User is not registered as volunteer"
        }), 403

    # ===== VALIDAR EVENTO =====
    event = Events.query.get(event_id)
    if not event:
        return jsonify({
            "msg": "Event not found"
        }), 404

    # ===== EVITAR DUPLICADOS =====
    existing = Inscription.query.filter_by(
        volunteerID=volunteer.volunteerID,
        eventID=event_id
    ).first()

    if existing:
        return jsonify({
            "msg": "You are already registered",
            "inscription": existing.serialize()
        }), 400

    # ===== CREAR INSCRIPCIÓN =====
    inscription = Inscription(
        volunteerID=volunteer.volunteerID,
        eventID=event_id,
        full_name=full_name,
        phone=phone,
        document_id=document_id,
        message=message,
        status="pending"
    )

    db.session.add(inscription)
    db.session.commit()

    return jsonify({
        "success": True,
        "msg": "Successfully applied",
        "inscription": inscription.serialize()
    }), 201

# endpoint para que volunteer sepa si ya esta inscrito o no


@api.route("/events/<int:event_id>/inscription", methods=["GET"])
@jwt_required()
def get_inscription(event_id):

    user_id = get_jwt_identity()

    # 🔄 user → volunteer
    volunteer = Volunteer.query.filter_by(userID=user_id).first()
    if not volunteer:
        return jsonify({
            "isInscribed": False,
            "inscription": None
        }), 200

    inscription = Inscription.query.filter_by(
        volunteerID=volunteer.volunteerID,
        eventID=event_id
    ).first()

    if not inscription:
        return jsonify({
            "isInscribed": False,
            "inscription": None
        }), 200

    return jsonify({
        "isInscribed": True,
        "inscription": inscription.serialize()
    }), 200

# endpoint para mostar al organizer la informacion de las personas inscritas


@api.route("/events/<int:event_id>/inscriptions", methods=["GET"])
@jwt_required()
def get_event_inscriptions(event_id):

    user_id = get_jwt_identity()

    # Validar organizer
    organizer = Organizer.query.filter_by(userID=user_id).first()
    if not organizer:
        return jsonify({"msg": "User is not registered as organizer"}), 403

    # Validar evento
    event = Events.query.get(event_id)
    if not event:
        return jsonify({"msg": "Event not found"}), 404

    # Verificar que el evento pertenece al organizer
    if event.organizerID != organizer.organizerID:
        return jsonify({"msg": "Not authorized"}), 403

    # Join Inscription -> Volunteer -> User
    results = (
        db.session.query(Inscription, Volunteer, User)
        .join(Volunteer, Volunteer.volunteerID == Inscription.volunteerID)
        .join(User, User.userID == Volunteer.userID)
        .filter(Inscription.eventID == event_id)
        .all()
    )

    return jsonify({
        "total": len(results),
        "inscriptions": [
            {
                "inscriptionID": inscription.inscriptionID,
                "status": inscription.status,
                "full_name": inscription.full_name,
                "phone": inscription.phone,
                "document_id": inscription.document_id,
                "message": inscription.message,
                "email": user.email,
                "volunteerID": volunteer.volunteerID
            }
            for inscription, volunteer, user in results
        ]
    }), 200

# endpoint para aprovar o rechazar solicitudes de inscripcion


@api.route("/inscriptions/<int:inscription_id>", methods=["PUT"])
@jwt_required()
def update_inscription(inscription_id):
    # Obtiene el userID desde el token JWT
    user_id = get_jwt_identity()

    # Lee el body de la petición
    data = request.get_json()

    # Valida que venga el campo "status"
    if not data or "status" not in data:
        return jsonify({"msg": "Status is required"}), 400

    # Valida que el status sea uno permitido
    if data["status"] not in ["approved", "rejected"]:
        return jsonify({"msg": "Invalid status"}), 400

    # Busca la inscripción por ID
    inscription = Inscription.query.get(inscription_id)
    if not inscription:
        return jsonify({"msg": "Inscription not found"}), 404

    # Busca el evento asociado a la inscripción
    event = Events.query.get(inscription.eventID)
    if not event:
        return jsonify({"msg": "Event not found"}), 404

    # Verifica que el usuario sea un organizador
    organizer = Organizer.query.filter_by(userID=user_id).first()
    if not organizer:
        return jsonify({"msg": "Not an organizer"}), 403

    # Verifica que el organizador sea dueño del evento
    if event.organizerID != organizer.organizerID:
        return jsonify({"msg": "Not authorized to update this inscription"}), 403

    # Actualiza el estado de la inscripción
    inscription.status = data["status"]

    # Guarda los cambios en la base de datos
    db.session.commit()

    # Respuesta exitosa
    return jsonify({
        "msg": "Inscription updated successfully",
        "inscriptionID": inscription.inscriptionID,
        "status": inscription.status
    }), 200

# Endpoints para boton de Me interesa.-----------------------------------------


@api.route("/events/<int:event_id>/interest", methods=["POST"])
@jwt_required()
def add_interest(event_id):
    """
    Permite a un usuario marcar un evento como 'me interesa'
    """

    user_id = get_jwt_identity()

    # Verificar que el evento exista
    event = Events.query.get(event_id)
    if not event:
        return jsonify({"msg": "Event not found"}), 404

    # Evitar duplicados
    existing = Interest.query.filter_by(
        userID=user_id,
        fav_event=event_id
    ).first()

    if existing:
        return jsonify({
            "msg": "Event already marked as interested",
            "interest": existing.serialize()
        }), 200

    # Crear interés
    interest = Interest(
        userID=user_id,
        fav_event=event_id
    )

    db.session.add(interest)
    db.session.commit()

    return jsonify({
        "msg": "Event saved as interested",
        "interest": interest.serialize()
    }), 201


@api.route("/events/<int:event_id>/interest", methods=["GET"])
@jwt_required()
def get_interest(event_id):
    """
    Indica si el usuario ya marcó este evento como 'me interesa'
    """

    user_id = get_jwt_identity()

    interest = Interest.query.filter_by(
        userID=user_id,
        fav_event=event_id
    ).first()

    return jsonify({
        "isInterested": interest is not None
    }), 200


@api.route("/my/interests", methods=["GET"])
@jwt_required()
def get_my_interests():
    """
    Devuelve todos los eventos que el usuario marcó como 'me interesa'
    """

    user_id = get_jwt_identity()

    events = (
        db.session.query(Events)
        .join(Interest, Interest.fav_event == Events.eventID)
        .filter(Interest.userID == user_id)
        .all()
    )

    return jsonify({
        "total": len(events),
        "events": [event.serialize() for event in events]
    }), 200


@api.route("/events/<int:event_id>/interest", methods=["DELETE"])
@jwt_required()
def remove_interest(event_id):
    """
    Elimina un evento de la lista 'me interesa'
    """

    user_id = get_jwt_identity()

    interest = Interest.query.filter_by(
        userID=user_id,
        fav_event=event_id
    ).first()

    if not interest:
        return jsonify({"msg": "Interest not found"}), 404

    db.session.delete(interest)
    db.session.commit()

    return jsonify({"msg": "Interest removed"}), 200


# Donations


@api.route("/create-checkout-session", methods=["POST"])
def create_checkout_session():
    data = request.get_json()
    amount = data.get("amount", 10)

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="payment",
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": "Donation",
                        "description": "Thank you for your support ❤️"
                    },
                    "unit_amount": amount * 100,
                },
                "quantity": 1,
            }],

            success_url=f"{FRONTEND_URL}success",
            cancel_url=f"{FRONTEND_URL}cancel",
        )

        return jsonify({"url": session.url})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# FORMULARIO DE CONTACTO


@api.route("/contact", methods=["POST"])
def contact():
    try:
        # verificar data
        if request.content_type and request.content_type.startswith("multipart/form-data"):
            data = request.form
        else:
            data = request.get_json()

        if not data:
            return jsonify({"msg": "No data provided"}), 400
        # campos requeridos
        required_fields = ["name", "email", "message"]
        for field in required_fields:
            if field not in data or not data[field].strip():
                return jsonify({"msg": f"Missing or empty field: {field}"}), 400
        # guardar datos
        contact_message = ContactMessage(
            name=data["name"].strip(),
            email=data["email"].strip(),
            message=data["message"].strip()
        )

        db.session.add(contact_message)
        db.session.commit()

        return jsonify({
            "msg": "Message sent successfully",
            "contact": contact_message.serialize()
        }), 201

    except Exception as e:
        print("🔥 CONTACT FORM ERROR:", e)
        return jsonify({
            "msg": "Internal server error",
            "error": str(e)
        }), 500

# For organizer profile


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
