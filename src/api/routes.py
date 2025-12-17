"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Organizer, Volunteer
from api.utils import generate_sitemap, APIException
from flask_cors import CORS

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
