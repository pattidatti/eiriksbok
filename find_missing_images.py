import os
import json

base_dir = r"c:\Users\Eirik\Documents\Eiriksbok\Eiriksbok"
content_dir = os.path.join(base_dir, "public", "content")
public_dir = os.path.join(base_dir, "public")

missing = []
no_image = []

for root, dirs, files in os.walk(content_dir):
    for file in files:
        if file.endswith(".json"):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                
                img_path = data.get("image") or data.get("heroImage")
                
                if img_path and isinstance(img_path, str):
                    clean_path = img_path.lstrip("/").replace("/", os.sep)
                    full_img_path = os.path.join(public_dir, clean_path)
                    
                    if not os.path.exists(full_img_path):
                        missing.append((file_path, img_path))
                else:
                    no_image.append(file_path)
            except Exception as e:
                print(f"Error reading {file_path}: {e}")

with open("missing_images_report.txt", "w", encoding="utf-8") as out:
    out.write("--- MISSING IMAGES ---\n")
    for f, img in missing:
        out.write(f"{f} -> {img}\n")

    out.write("\n--- NO IMAGE FIELD ---\n")
    for f in no_image:
        out.write(f"{f}\n")
