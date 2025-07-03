# config/DBSettings.py

import os
from dotenv import load_dotenv

load_dotenv()

TORTOISE_ORM = {
    "connections": {
        "default": f"mysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}",
    },
    "apps": {
        "models": {
            "models": ["models", "aerich.models"],
        }
    },
    "use_tz": True,
    "timezone": "Asia/Shanghai",
    "generate_schemas": True,
    "add_exception_handlers": True,
}
