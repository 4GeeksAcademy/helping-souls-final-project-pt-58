"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Events, Organizer, Volunteer
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_jwt_extended import create_access_token, get_jwt_identity,  jwt_required
from werkzeug.security import generate_password_hash, check_password_hash
import os
import stripe

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

FRONTEND_URL = "https://potential-guide-g4w4679gpr953r-3000.app.github.dev/"

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


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

    return jsonify({
        "msg": "Login successful",
        "token": access_token,
        "user": user.serialize()
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

# POST Y GET DE EVENTOS


@api.route('/new_events', methods=['POST'])
@jwt_required()
def new_event():
    # El identity del JWT es directamente el userID
    user_id = get_jwt_identity()

    data = request.get_json()

    if not data:
        return jsonify({"msg": "No data provided"}), 400

    required_fields = [
        'name',
        'event_date',
        'location',
        'category',
        'max_volunteers',
        'description'
    ]

    for field in required_fields:
        if field not in data:
            return jsonify({"msg": f"Missing field: {field}"}), 400

    # Verificar que el usuario sea organizador
    organizer = Organizer.query.filter_by(userID=user_id).first()
    if not organizer:
        return jsonify({"msg": "User is not an organizer"}), 403

    # Validar formato de fecha
    try:
        event_date = datetime.fromisoformat(data['event_date']).date()
    except ValueError:
        return jsonify({"msg": "Invalid date format. Use YYYY-MM-DD"}), 400

    # Crear evento
    event = Events(
        organizerID=organizer.organizerID,
        name=data['name'],
        event_date=event_date,
        location=data['location'],
        category=data['category'],
        max_volunteers=data['max_volunteers'],
        description=data['description'],
        review=data.get('review')
    )

    try:
        db.session.add(event)
        db.session.commit()

        return jsonify({
            "msg": "Event created successfully",
            "event": event.serialize()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "msg": "Error creating event",
            "error": str(e)
        }), 500


@api.route("/events", methods=["GET"])
@jwt_required()
def get_all_events():

    user_id = get_jwt_identity()  # por ahora no se filtra, solo valida el token

    events = Events.query.all()

    return jsonify({
        "total": len(events),
        "events": [
            {
                "eventID": event.eventID,
                "name": event.name,
                "event_date": event.event_date.isoformat(),
                "location": event.location,
                "category": event.category,
                "max_volunteers": event.max_volunteers,
                "description": event.description,
                "review": event.review,
                "organizerID": event.organizerID
            }
            for event in events
        ]
    }), 200

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

            success_url=f"{FRONTEND_URL}/success",
            cancel_url=f"{FRONTEND_URL}/cancel",
        )

        return jsonify({"url": session.url})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
