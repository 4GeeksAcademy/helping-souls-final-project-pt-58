"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Event
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity


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
    user = get_jwt_identity()
    data = request.get_json()

    event = Event(
        organizerID=user['id'],
        name=data['name'],
        date=datetime.fromisoformat(data['date']),
        address=data['address'],
        category=data['category'],
        max_volunteers=data['max_volunteers'],
        description=data['description'],
        review=data.get('review', True)
    )

    db.session.add(event)
    db.session.commit()

    return jsonify({
        "message": "Created event",
        "event_id": event.id
    }), 201
