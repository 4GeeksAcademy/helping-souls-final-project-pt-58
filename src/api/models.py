from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, ForeignKey, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "user"

    userID: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)

    organizer: Mapped['Organizer']=relationship('Organizer', backref='user', lazy=True, uselist=False)
    volunteer: Mapped['Volunteer']=relationship('Volunteer', backref='user', lazy=True, uselist=False)
    interest: Mapped['Interest']=relationship('Interest', backref='user', lazy=True)



    def serialize(self):
        return {
            "userID": self.userID,
            "email": self.email,
            "name": self.name
            # do not serialize the password, its a security breach
        }
    
class Organizer(db.Model):
    __tablename__ = "organizer"

    organizerID: Mapped[int] = mapped_column(primary_key=True)
    userID: Mapped[int] = mapped_column(ForeignKey('user.userID'), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    org_link: Mapped[str] = mapped_column(String(120), nullable=False)

    organized_events: Mapped['Events']=relationship('Events', lazy=True, backref='organizer')

    def serialize(self):
        return {
            'organizerID': self.organizerID,
            'userID': self.userID,
            'events': self.events,
            'name': self.name,
            'org_link': self.org_link
        }

class Volunteer(db.Model):
    __tablename__='volunteer'

    volunteerID: Mapped[int] = mapped_column(primary_key=True)
    userID: Mapped[int] = mapped_column(ForeignKey('user.userID'), nullable=False)

    inscriptions: Mapped['Inscription']=relationship('Inscription', lazy=True, backref='volunteer')
    comments: Mapped['Event_Comments']=relationship('Event_Comments', lazy=True, backref='volunteer')

    def serialize(self):
        return{
            'volunteerID': self.volunteerID,
            'userID': self.userID,
        }
    
class Inscription(db.Model):
    __tablename__ = "inscription"

    inscriptionID = db.Column(db.Integer, primary_key=True)
    volunteerID = db.Column(db.Integer, db.ForeignKey("volunteer.volunteerID"), nullable=False)
    eventID = db.Column(db.Integer, db.ForeignKey("events.eventID"), nullable=False)

    full_name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(50), nullable=False)
    document_id = db.Column(db.String(50), nullable=False)
    message = db.Column(db.Text, nullable=True)

    status = db.Column(db.String(50), default="pending")

    __table_args__ = (
        db.UniqueConstraint("volunteerID", "eventID", name="unique_volunteer_event"),
    )

    def serialize(self):
        return {
            "inscriptionID": self.inscriptionID,
            "eventID": self.eventID,
            "volunteerID": self.volunteerID,
            "fullName": self.full_name,
            "phone": self.phone,
            "documentId": self.document_id,
            "message": self.message,
            "status": self.status
        }
    
class Interest(db.Model):
    __tablename__='interest'

    interestID: Mapped[int]=mapped_column(primary_key=True)
    userID: Mapped[int]=mapped_column(ForeignKey('user.userID'), nullable=False)
    fav_event: Mapped[int]=mapped_column(ForeignKey('events.eventID'), nullable=False)

    def serialize(self):
        return{
            'interestID': self.interestID,
            'userID': self.userID,
            'fav_event': self.fav_event
        }

class Event_Comments(db.Model):
    __tablename__='event_comments'

    commentID: Mapped[int]=mapped_column(primary_key=True)
    volunteerID: Mapped[int]=mapped_column(ForeignKey('volunteer.volunteerID'), nullable=False)
    eventID: Mapped[int]=mapped_column(ForeignKey('events.eventID'))
    comments: Mapped[str]=mapped_column(String(120), nullable=False)

    def serialize(self):
        return{
            'commentID': self.commentID,
            'volunteerID': self.volunteerID,
            'eventID': self.eventID,
            'comments': self.comments
        }
    
class Donations(db.Model):
    __tablename__='donations'

    donationID: Mapped[int]=mapped_column(primary_key=True)
    amount: Mapped[int]=mapped_column(nullable=False)

    def serialize(self):
        return{
           'donationID': self.donationID,
            'amount': self.amount
        }
    
class Events(db.Model):
    __tablename__='events'

    eventID: Mapped[int]=mapped_column(primary_key=True)
    name: Mapped[str]=mapped_column(String(120), nullable=False)
    organizerID: Mapped[int]=mapped_column(ForeignKey('organizer.organizerID'), nullable=False)
    event_date: Mapped[date]=mapped_column(Date, nullable=False)
    category: Mapped[str]=mapped_column(String(120), nullable=False)
    description: Mapped[str]=mapped_column(String(320), nullable=False)
    location: Mapped[str]=mapped_column(String(200), nullable=False)
    max_volunteers: Mapped[int]=mapped_column(nullable=False)
    #review: Mapped[str]=mapped_column(String(200), nullable=True)
    image: Mapped[str]=mapped_column(String(200), nullable=True)

    comments: Mapped['Event_Comments']=relationship('Event_Comments', lazy=True, backref='event')
    inscriptions: Mapped['Inscription']=relationship('Inscription', lazy=True, backref='event')

    def serialize(self):
        return{
           'eventID': self.eventID,
           'name': self.name,
           'organizerID': self.organizerID,
           'event_date': self.event_date,
           'category': self.category,
           'description': self.description,
           'location': self.location,
           'max_volunteers': self.max_volunteers,
           #'review': self.review,
           'image' : self.image,
        }

class ContactMessage(db.Model):
    __tablename__ = "contact_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), nullable=False)
    message: Mapped[str] = mapped_column(String(500), nullable=False)
    created_at: Mapped[date] = mapped_column(Date, default=date.today)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "message": self.message,
            "created_at": self.created_at.isoformat()
        }