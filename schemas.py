from pydantic import BaseModel

class Product(BaseModel):

    name: str
    description: str
    price: float
    quantity: int

class ProductResponse(Product):
    id: int

    class Config:
        from_attributes = True
