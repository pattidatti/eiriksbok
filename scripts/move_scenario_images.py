
import os
import subprocess

source_dir = "/home/irik/.gemini/antigravity/brain/520b0595-2954-437a-a37d-3228aa22fc85"
target_dir = "/home/irik/eiriksbok/public/images/chronos/nikolaj-ii"

mappings = {
    "hero_webp_1773323270285.png": "hero.webp",
    "sarajevo_telegram_webp_1773323285826.png": "sarajevo_telegram.webp",
    "tsarskoje_selo_study_webp_1773323304237.png": "tsarskoje_selo_study.webp",
    "tsarskoje_selo_map_webp_1773323319928.png": "tsarskoje_selo_map.webp",
    "nicky_willy_telegram_webp_1773323375955.png": "nicky_willy_telegram.webp",
    "military_map_1914_webp_1773323392139.png": "military_map_1914.webp",
    "mobilisering_webp_1773323409589.png": "mobilisering.webp",
    "krigsutbrudd_petrograd_webp_1773323425492.png": "krigsutbrudd_petrograd.webp",
    "duma_petrograd_webp_1773323450035.png": "duma_petrograd.webp",
    "tannenberg_battlefield_webp_1773323466465.png": "tannenberg_battlefield.webp",
    "ostfront_retreating_webp_1773323484229.png": "ostfront_retreating.webp"
}

os.makedirs(target_dir, exist_ok=True)

for src_name, dst_name in mappings.items():
    src_path = os.path.join(source_dir, src_name)
    dst_path = os.path.join(target_dir, dst_name)
    
    if os.path.exists(src_path):
        print(f"Converting {src_name} to {dst_name}...")
        try:
            # Try using ffmpeg as it's common on linux
            subprocess.run(["ffmpeg", "-y", "-i", src_path, dst_path], check=True, capture_output=True)
            print(f" Successfully converted to {dst_path}")
        except Exception as e:
            print(f" FFMPEG failed, trying convert (ImageMagick): {e}")
            try:
                subprocess.run(["convert", src_path, dst_path], check=True, capture_output=True)
                print(f" Successfully converted to {dst_path} using convert")
            except Exception as e2:
                print(f" Error converting {src_name}: {e2}")
    else:
        print(f"Source file not found: {src_path}")
