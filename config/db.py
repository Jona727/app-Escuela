from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base


engine= create_engine("postgresql://postgres:123@localhost:5432/escuela")

Base = declarative_base()

