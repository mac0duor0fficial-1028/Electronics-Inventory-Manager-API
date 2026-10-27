from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from schemas import Product
from database import SessionLocal, engine
import models
from sqlalchemy.orm import Session

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:3000"],
    allow_methods = ["*"]
)

db = models.Base.metadata.create_all(bind = engine)

@app.get("/")
def get_root():
    return {"message": "Hello, World!"}

products = [
    Product(id=1, name="Phone", description="Budget friendly bundurgy phone", price=9999.99, quantity=100),
    Product(id=2, name="Laptop", description="High performance laptop", price=11999.99, quantity=50),
    Product(id=3, name="Tablet", description="Portable tablet device", price=4999.99, quantity=75),
    Product(id=4, name="Headphones", description="Noise-cancelling headphones", price=1999.99, quantity=200),
    Product(id=5, name="Smartwatch", description="Feature-rich smartwatch", price=2999.99, quantity=150),
    Product(id=6, name="Camera", description="High-resolution camera", price=8999.99, quantity=30),
    Product(id=7, name="Printer", description="Wireless printer", price=3999.99, quantity=80),
    Product(id=8, name="Monitor", description="4K Ultra HD monitor", price=5999.99, quantity=60),
    Product(id=9, name="Keyboard", description="Mechanical keyboard", price=1499.99, quantity=120),
    Product(id=10, name="Mouse", description="Ergonomic wireless mouse", price=999.99, quantity=180),
    Product(id=11, name="External Hard Drive", description="Portable external hard drive", price=2499.99, quantity=90),
    Product(id=12, name="Router", description="High-speed Wi-Fi router", price=1999.99, quantity=70),   
    Product(id=13, name="Speakers", description="Bluetooth speakers", price=1499.99, quantity=110),
    Product(id=14, name="Webcam", description="HD webcam for video conferencing", price=1299.99, quantity=95),
    Product(id=15, name="Gaming Console", description="Next-gen gaming console", price=4999.99, quantity=40),
    Product(id=16, name="VR Headset", description="Virtual reality headset", price=3999.99, quantity=25),
    Product(id=17, name="Smart Home Hub", description="Central hub for smart home devices", price=2999.99, quantity=55),
    Product(id=18, name="Fitness Tracker", description="Wearable fitness tracker", price=1999.99, quantity=130),
    Product(id=19, name="E-reader", description="Portable e-reader device", price=2499.99, quantity=85),
    Product(id=20, name="Projector", description="High-definition projector", price=6999.99, quantity=45)
        ]

#----------------------Database session management-----------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def db_init():
    db = SessionLocal()

    count = db.query(models.Product).count

    if count == 0:
        for product in products:
            db.add(models.Product(**product.model_dump()))

        db.commit()

db_init()

# ----------------------Fastapi CRUD operations-----------------------------------------

@app.get("/products")
def get_all_products(db : Session = Depends(get_db)):

    db_products = db.query(models.Product).all()

    return db_products

@app.get("/products/{product_id}")
def get_product_by_id(product_id: int, db : Session = Depends(get_db)):

    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()

    if db_product:
        return db_product
    return {"error": "Product not found"}

@app.post("/products")
def add_product(product: Product,  db : Session = Depends(get_db)):
    db.add(models.Product(**product.model_dump()))
    return product

@app.put("/products/{product_id}")
def update_product(product_id: int, updated_product: Product):
    for index, product in enumerate(products):
        if product.id == product_id:
            products[index] = updated_product
            return updated_product
    return {"error": "Product not found"}

@app.delete("/products/{product_id}")
def delete_product(product_id: int):
    for index, product in enumerate(products):
        if product.id == product_id:
            deleted_product = products.pop(index)
            return deleted_product
    return {"error": "Product not found"}