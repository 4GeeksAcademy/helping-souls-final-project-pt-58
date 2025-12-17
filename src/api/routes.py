"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Events, Organizer
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

    if not data:
        return jsonify({"msg": "No data provided"}), 400

    required_fields = ['name', 'event_date', 'location', 'category', 'max_volunteers', 'description']
    for field in required_fields:
        if field not in data:
            return jsonify({"msg": f"Missing field: {field}"}), 400

    organizer = Organizer.query.filter_by(userID=user['id']).first()
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
        max_volunteers=data['max_volunteers'],
        description=data['description'],
        review=data.get('review')
    )

    db.session.add(event)
    db.session.commit()

    return jsonify({
        "message": "Event created",
        "event_id": event.eventID
    }), 201
