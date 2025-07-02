from fastapi import FastAPI
from tortoise.contrib.fastapi import register_tortoise
from tortoise import Tortoise
from api import app
from config.DBSettings import TORTOISE_ORM

# 注册 Tortoise ORM
register_tortoise(
    app,
    config=TORTOISE_ORM,
    generate_schemas=True,
    add_exception_handlers=True
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
