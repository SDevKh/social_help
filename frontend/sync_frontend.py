from pathlib import Path
import shutil

base_dir = Path(__file__).resolve().parent
src_dir = base_dir / "dist"
dst_dir = base_dir.parent / "social_help" / "frontend" / "dist"

# Clean dst assets folder
dst_assets = dst_dir / "assets"
if dst_assets.exists():
    try:
        shutil.rmtree(dst_assets)
        print("Cleaned destination assets directory.")
    except Exception as e:
        print(f"Warning: could not clean assets directory completely: {e}")
dst_assets.mkdir(parents=True, exist_ok=True)

# Copy everything from src_dir to dst_dir
for item in src_dir.iterdir():
    d = dst_dir / item.name
    if item.is_dir():
        if item == "assets":
            d.mkdir(parents=True, exist_ok=True)
            for asset_item in item.iterdir():
                shutil.copy2(asset_item, d / asset_item.name)
        else:
            if d.exists():
                try:
                    shutil.rmtree(d)
                except Exception as e:
                    print(f"Warning: could not remove directory {d}: {e}")
            shutil.copytree(item, d, dirs_exist_ok=True)
    else:
        shutil.copy2(item, d)

print("Sync completed successfully.")
