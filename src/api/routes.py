"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Events, Organizer, Volunteer
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from werkzeug.utils import secure_filename
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


from flask_jwt_extended import create_access_token, get_jwt_identity,  jwt_required
from werkzeug.security import generate_password_hash, check_password_hash

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

@api.route('/new_events', methods=['POST'])
@jwt_required()
def new_event():
    user_id = get_jwt_identity()
    organizer = Organizer.query.filter_by(userID=user_id).first()
    
    file = request.files.get('image')
    image_filename = None
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        file.save(os.path.join(UPLOAD_FOLDER, filename))
        image_filename = filename

    data = request.form
    if not data:
        return jsonify({"msg": "No data provided"}), 400

    required_fields = ['name', 'event_date', 'location', 'category', 'max_volunteers', 'description']
    for field in required_fields:
        if field not in data:
            return jsonify({"msg": f"Missing field: {field}"}), 400

    organizer = Organizer.query.filter_by(userID=user_id).first()
    if not organizer:
            return jsonify({"msg": "User is not an organizer"}), 403

    try:
        event_date = datetime.fromisoformat(data['event_date']).date()
    except ValueError:
        return jsonify({"msg": "Invalid date format"}), 400

    event = Events(
        organizerID=organizer.organizerID,
        name=data['name'],
        event_date=event_date,
        location=data['location'],
        category=data['category'],
        max_volunteers=int(data['max_volunteers']),
        description=data['description'],
        #review=data['review'],
        image=image_filename

    )

    db.session.add(event)
    db.session.commit()

    return jsonify({
        "message": "Event created",
        "event_id": event.eventID
    }), 201

@api.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email", "").lower()
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Faltan credenciales"}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"msg": "Email o contraseña inválidos"}), 401

    if not check_password_hash(user.password, password):
        return jsonify({"msg": "Email o contraseña inválidos"}), 401

    return jsonify({
        "msg": "Login exitoso",
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
