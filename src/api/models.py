from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, ForeignKey, Date, Time
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
    __tablename__ = "events"

    eventID = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    organizerID = db.Column(db.Integer, db.ForeignKey("organizer.organizerID"), nullable=False)

    event_date = db.Column(db.Date, nullable=False)
    event_time = db.Column(Time, nullable=True)   
    city = db.Column(db.String(120), nullable=True)  

    location = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    max_volunteers = db.Column(db.Integer, nullable=False)
    image = db.Column(db.Text, nullable=True)

    def serialize(self):
        return {
            "eventID": self.eventID,
            "name": self.name,
            "organizerID": self.organizerID,
            "event_date": self.event_date.isoformat(),
            "event_time": self.event_time.strftime("%H:%M") if self.event_time else None,
            "city": self.city,
            "location": self.location,
            "category": self.category,
            "description": self.description,
            "max_volunteers": self.max_volunteers,
            "image": self.image,
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