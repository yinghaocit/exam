# config/DBSettings.py

TORTOISE_ORM = {
    "connections": {
        "default": "mysql://root:root@127.0.0.1:3306/exam_db",
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
