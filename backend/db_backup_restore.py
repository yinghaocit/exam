import json
import asyncio
from tortoise import Tortoise, run_async

DB_URL = "mysql://root:root@127.0.0.1:3306/exam_db"
BACKUP_FILE = "backup_all_models.json"

async def backup():
    await Tortoise.init(db_url=DB_URL, modules={'models': ['models']})  # 这里' models'请替换成你的模型模块路径
    await Tortoise.generate_schemas()

    data = {}
    # 遍历所有模型，models是app名
    for app_name in Tortoise.apps:
        for model_name, model in Tortoise.apps[app_name].items():
            items = await model.all().values()
            data[f"{app_name}.{model_name}"] = items

    with open(BACKUP_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    print(f"✅ 全库备份成功，文件: {BACKUP_FILE}")

    await Tortoise.close_connections()

async def restore():
    with open(BACKUP_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    await Tortoise.init(db_url=DB_URL, modules={'models': ['models']})  # 同上
    await Tortoise.generate_schemas()

    # 先删除所有数据，顺序逆序更安全
    for app_name in reversed(list(Tortoise.apps.keys())):
        for model_name, model in reversed(list(Tortoise.apps[app_name].items())):
            await model.all().delete()

    # 手动定义插入顺序（先插入 question，再插入 answer，再插入其他表）
    restore_order = ["models.Question", "models.Answer"]
    ordered_keys = restore_order + [k for k in data.keys() if k not in restore_order]

    for key in ordered_keys:
        items = data[key]
        app_name, model_name = key.split('.')
        model = Tortoise.apps[app_name][model_name]
        for item in items:
            await model.create(**item)

    print(f"✅ 全库恢复成功")

    await Tortoise.close_connections()

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("用法: python db_backup_restore.py [backup|restore]")
        sys.exit(1)

    action = sys.argv[1].lower()
    if action == "backup":
        run_async(backup())
    elif action == "restore":
        run_async(restore())
    else:
        print("未知操作，请指定 backup 或 restore")
