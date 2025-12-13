from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "user"

    userID: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)




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
    events: Mapped[str] = mapped_column(String(120), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    org_link: Mapped[str] = mapped_column(String(120), nullable=False)

    def serialize(self):
        return {
            'organizerIDID': self.organizerID,
            'userID': self.userID,
            'events': self.events,
            'name': self.name,
            'org_link': self.org_link
        }

class Volunteer(db.Model):
    __tablename__='volunteer'

    volunteerID: Mapped[int] = mapped_column(primary_key=True)
    userID: Mapped[int] = mapped_column(ForeignKey('user.userID'), nullable=False)
    inscriptionID: Mapped[int] = mapped_column(ForeignKey('inscription.inscriptionID'), nullable=False)

    def serialize(self):
        return{
            'volunteerID': self.volunteerID,
            'userID': self.userID,
            'inscriptionID': self.inscriptionID
        }
    
class Inscription(db.Model):
    __tablename__='inscription'

    inscriptionID: Mapped[int]=mapped_column(primary_key=True)
    volunteerID: Mapped[int]=mapped_column(ForeignKey('volunteer.volunteerID'), nullable=False)
    status: Mapped[str]=mapped_column(String(120), nullable=False)

    def serialize(self):
        return{
            'inscriptionID': self.inscriptionID,
            'volunteerID': self.volunteerID,
            'status': self.status
        }
        
class Interest(db.Model):
    __tablename__='interest'

    interestID: Mapped[int]=mapped_column(primary_key=True)
    userID: Mapped[int]=mapped_column(ForeignKey('user.userID'), nullable=False)
    fav_event: Mapped[int]=mapped_column(ForeignKey('event.eventID'), nullable=False)

    def serialize(self):
        return{
            'interestID': self.interestID,
            'userID': self.userID,
            'fav_event': self.fav_event
        }

