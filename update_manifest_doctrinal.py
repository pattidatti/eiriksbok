import json
import os
import datetime

file_path = r"c:\Users\Eirik\Documents\Eiriksbok\Eiriksbok\public\content\manifest.json"
now = datetime.datetime.utcnow().isoformat() + "Z"

# Data for Doctrinal dimension lessons
doctrinal_lessons = {
    "kristendom": [
        {
            "id": "gudsbilde",
            "title": "Treenigheten",
            "description": "Gud som Fader, Sønn og Hellig Ånd.",
            "image": "https://images.unsplash.com/photo-1548625361-9882cf0f410e?auto=format&fit=crop&q=80",
            "tags": ["kristendom", "gudsbilde", "doctrinal"],
            "createdDate": now,
            "lastUpdated": now
        },
        {
            "id": "frelse",
            "title": "Frelse og nåde",
            "description": "Frelse gjennom tro på Jesus.",
            "image": "https://images.unsplash.com/photo-1490902931801-d6f80ca94fe4?auto=format&fit=crop&q=80",
            "tags": ["kristendom", "frelse", "doctrinal"],
            "createdDate": now,
            "lastUpdated": now
        }
    ],
    "islam": [
        {
            "id": "gudsbilde",
            "title": "Tawhid",
            "description": "Troen på Guds enhet.",
            "image": "https://images.unsplash.com/photo-1564121211835-e88c852648ab?auto=format&fit=crop&q=80",
            "tags": ["islam", "gudsbilde", "doctrinal"],
            "createdDate": now,
            "lastUpdated": now
        },
        {
            "id": "frelse",
            "title": "Dommens dag",
            "description": "Regnskapets time og livet etter døden.",
            "image": "https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&q=80",
            "tags": ["islam", "frelse", "doctrinal"],
            "createdDate": now,
            "lastUpdated": now
        }
    ],
    "buddhisme": [
        {
            "id": "gudsbilde",
            "title": "Ingen skapergud",
            "description": "En ikke-teistisk religion.",
            "image": "https://images.unsplash.com/photo-1526716173434-a1b560f2065d?auto=format&fit=crop&q=80",
            "tags": ["buddhisme", "gudsbilde", "doctrinal"],
            "createdDate": now,
            "lastUpdated": now
        },
        {
            "id": "frelse",
            "title": "Nirvana",
            "description": "Frigjøring fra lidelse og gjenfødelse.",
            "image": "https://images.unsplash.com/photo-1606293926075-69a00febf280?auto=format&fit=crop&q=80",
            "tags": ["buddhisme", "frelse", "doctrinal"],
            "createdDate": now,
            "lastUpdated": now
        }
    ],
    "jodedom": [
        {
            "id": "gudsbilde",
            "title": "Monoteisme",
            "description": "Troen på én Gud - Jahve.",
            "image": "https://images.unsplash.com/photo-1590053723707-160d332d2d9c?auto=format&fit=crop&q=80",
            "tags": ["jodedom", "gudsbilde", "doctrinal"],
            "createdDate": now,
            "lastUpdated": now
        },
        {
            "id": "frelse",
            "title": "Livet her og nå",
            "description": "Fokus på å leve et rettferdig liv.",
            "image": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80",
            "tags": ["jodedom", "frelse", "doctrinal"],
            "createdDate": now,
            "lastUpdated": now
        }
    ],
    "hinduisme": [
        {
            "id": "gudsbilde",
            "title": "Brahman og guder",
            "description": "Én guddommelig kraft i mange former.",
            "image": "https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?auto=format&fit=crop&q=80",
            "tags": ["hinduisme", "gudsbilde", "doctrinal"],
            "createdDate": now,
            "lastUpdated": now
        },
        {
            "id": "frelse",
            "title": "Moksha",
            "description": "Frigjøring fra samsara.",
            "image": "https://images.unsplash.com/photo-1621827979802-6d778e170a64?auto=format&fit=crop&q=80",
            "tags": ["hinduisme", "frelse", "doctrinal"],
            "createdDate": now,
            "lastUpdated": now
        }
    ],
    "bahai": [
        {
            "id": "gudsbilde",
            "title": "En ukjennbar Gud",
            "description": "Gud er én og utenfor menneskelig fatteevne.",
            "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Bahai_Gardens_Haifa_2011.jpg/1280px-Bahai_Gardens_Haifa_2011.jpg",
            "tags": ["bahai", "gudsbilde", "doctrinal"],
            "createdDate": now,
            "lastUpdated": now
        },
        {
            "id": "frelse",
            "title": "Åndelig utvikling",
            "description": "Sjelens reise mot Gud.",
            "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Bahai_Gardens_Haifa_2011.jpg/1280px-Bahai_Gardens_Haifa_2011.jpg",
            "tags": ["bahai", "frelse", "doctrinal"],
            "createdDate": now,
            "lastUpdated": now
        }
    ],
    "mormonisme": [
        {
            "id": "gudsbilde",
            "title": "Guddommen",
            "description": "Faderen, Sønnen og Den hellige ånd er tre separate vesener.",
            "image": "https://images.unsplash.com/photo-1565108092241-1a06b0201b14?auto=format&fit=crop&q=80",
            "tags": ["mormonisme", "gudsbilde", "doctrinal"],
            "createdDate": now,
            "lastUpdated": now
        },
        {
            "id": "frelse",
            "title": "Evig progresjon",
            "description": "Muligheten til å bli lik Gud.",
            "image": "https://images.unsplash.com/photo-1565108092241-1a06b0201b14?auto=format&fit=crop&q=80",
            "tags": ["mormonisme", "frelse", "doctrinal"],
            "createdDate": now,
            "lastUpdated": now
        }
    ],
    "jehovas-vitner": [
        {
            "id": "gudsbilde",
            "title": "Jehova",
            "description": "Guds personlige navn.",
            "image": "https://images.unsplash.com/photo-1507692049790-de58293a4697?auto=format&fit=crop&q=80",
            "tags": ["jehovas-vitner", "gudsbilde", "doctrinal"],
            "createdDate": now,
            "lastUpdated": now
        },
        {
            "id": "frelse",
            "title": "Paradis på jord",
            "description": "Håpet om evig liv på en paradisisk jord.",
            "image": "https://images.unsplash.com/photo-1507692049790-de58293a4697?auto=format&fit=crop&q=80",
            "tags": ["jehovas-vitner", "frelse", "doctrinal"],
            "createdDate": now,
            "lastUpdated": now
        }
    ]
}

with open(file_path, 'r', encoding='utf-8') as f:
    manifest = json.load(f)

# Find KRLE -> religioner
krle_subject = next((s for s in manifest['subjects'] if s['id'] == 'krle'), None)
if krle_subject:
    religioner_topic = next((t for t in krle_subject['topics'] if t['id'] == 'religioner'), None)
    if religioner_topic:
        for religion in religioner_topic['subTopics']:
            r_id = religion['id']
            if r_id in doctrinal_lessons:
                existing_lessons = religion.get('lessons', [])
                existing_ids = [l['id'] if isinstance(l, dict) else l for l in existing_lessons]
                
                for new_lesson in doctrinal_lessons[r_id]:
                    if new_lesson['id'] not in existing_ids:
                        # Insert before 'intro' if possible, or just append
                        intro_index = -1
                        for i, l in enumerate(existing_lessons):
                            lid = l['id'] if isinstance(l, dict) else l
                            if lid == 'intro':
                                intro_index = i
                                break
                        
                        if intro_index != -1:
                            existing_lessons.insert(intro_index, new_lesson)
                        else:
                            existing_lessons.append(new_lesson)
                            
                religion['lessons'] = existing_lessons
                print(f"Updated lessons for {r_id}")

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(manifest, f, indent=4)

print("Successfully updated manifest.json with doctrinal lessons")
