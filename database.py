import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

encoded_password = urllib.parse.quote_plus("10WE11.lo28@")

db_url = f"postgresql://postgres:{encoded_password}@127.0.0.1:5432/electronic_store_db"

engine = create_engine(
    db_url, 
    connect_args={"sslmode": "disable"}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)