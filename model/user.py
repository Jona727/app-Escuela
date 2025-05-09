from config.db import engine, Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel


class User(Base):

    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    username = Column("username", String (50), unique=True)
    password = Column("password", String (50))
    firstName = Column("firstName", String)
    lastName = Column("lastName", String)

    def __init__(self,id,username,password,firstName,lastName):
        self.id = id
        self.username = username
        self.password = password
        self.firstName = firstName
        self.lastName = lastName

Base.metadata.create_all (bind=engine)

Session = sessionmaker(bind=engine)  # creo una clase session


session = Session()

class InputUser(BaseModel):
    id: int
    username: str
    password: str
    firstName: str
    lastName: str

class InputLogin(BaseModel):
    username: str
    password: str



