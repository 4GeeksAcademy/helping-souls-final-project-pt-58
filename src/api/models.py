from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

db = SQLAlchemy()

class User(db.Model):
    userID: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)


    def serialize(self):
        return {
            "userID": self.id,
            "email": self.email,
            "name": self.name
            # do not serialize the password, its a security breach
        }
    
class Organizer(db.Model):
    organizadorID: Mapped[int] = mapped_column(primary_key=True)
    userID: Mapped[str] = mapped_column(String(120), nullable=False)
    events: Mapped[str] = mapped_column(String(120), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    org_link: Mapped[str] = mapped_column(String(120), nullable=False)

    def serialize(self):
        return {
            'organizadorID': self.organizadorID,
            'userID': self.userID,
            'events': self.events,
            'name': self.name,
            'org_link': self.org_link
        }
