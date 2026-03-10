import json
import os

base_url = "https://bok.haaland.de"
urls = []

manifest_path = "public/content/manifest.json"

with open(manifest_path, "r", encoding="utf-8") as f:
    data = json.load(f)

for subject in data.get("subjects", []):
    subj_id = subject.get("id", "")
    if not subj_id: continue
    
    for topic in subject.get("topics", []):
        topic_id = topic.get("id", "")
        if not topic_id: continue
        
        # Check if topic has lessons directly
        for lesson in topic.get("lessons", []):
            lesson_id = lesson.get("id", "")
            if not lesson_id: continue
            urls.append(f"{base_url}/{subj_id}/{topic_id}/{lesson_id}")
            
        # Check if topic has subTopics
        for subtopic in topic.get("subTopics", []):
            subtopic_id = subtopic.get("id", "")
            if not subtopic_id: continue
            for lesson in subtopic.get("lessons", []):
                lesson_id = lesson.get("id", "")
                if not lesson_id: continue
                urls.append(f"{base_url}/{subj_id}/{topic_id}/{subtopic_id}/{lesson_id}")

# Let's also add library texts if they exist. Based on App.tsx, they are at /norsk/bibliotek/:textId
# and some other things, but the user specifically asked for "alle artiklene". The lessons are the articles.

output_file = "notebooklm_urls.txt"
with open(output_file, "w", encoding="utf-8") as f:
    for url in urls:
        f.write(url + "\n")
        
print(f"Generated {len(urls)} URLs in {output_file}")
