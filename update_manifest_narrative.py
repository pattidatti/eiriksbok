import json
import os
import datetime

file_path = r"c:\Users\Eirik\Documents\Eiriksbok\Eiriksbok\public\content\manifest.json"
now = datetime.datetime.utcnow().isoformat() + "Z"

# Data for Narrative dimension lessons
narrative_lessons = {
    "kristendom": [
        {
            "id": "grunnleggere",
            "title": "Jesus",
            "description": "Jesus fra Nasaret - kristendommens grunnlegger.",
            "image": "https://images.unsplash.com/photo-1548625361-9882cf0f410e?auto=format&fit=crop&q=80",
            "tags": ["kristendom", "grunnleggere", "narrative"],
            "createdDate": now,
            "lastUpdated": now
        },
        {
            "id": "hellige-tekster",
            "title": "Bibelen",
            "description": "Kristendommens hellige skrift.",
            "image": "https://images.unsplash.com/photo-1490902931801-d6f80ca94fe4?auto=format&fit=crop&q=80",
            "tags": ["kristendom", "hellige-tekster", "narrative"],
            "createdDate": now,
            "lastUpdated": now
        }
    ],
    "islam": [
        {
            "id": "grunnleggere",
            "title": "Muhammad",
            "description": "Profeten Muhammad - islams siste profet.",
            "image": "https://images.unsplash.com/photo-1564121211835-e88c852648ab?auto=format&fit=crop&q=80",
            "tags": ["islam", "grunnleggere", "narrative"],
            "createdDate": now,
            "lastUpdated": now
        },
        {
            "id": "hellige-tekster",
            "title": "Koranen",
            "description": "Islams hellige bok.",
            "image": "https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&q=80",
            "tags": ["islam", "hellige-tekster", "narrative"],
            "createdDate": now,
            "lastUpdated": now
        }
    ],
    "buddhisme": [
        {
            "id": "grunnleggere",
            "title": "Buddha",
            "description": "Siddhartha Gautama - den oppvåknede.",
            "image": "https://images.unsplash.com/photo-1526716173434-a1b560f2065d?auto=format&fit=crop&q=80",
            "tags": ["buddhisme", "grunnleggere", "narrative"],
            "createdDate": now,
            "lastUpdated": now
        },
        {
            "id": "hellige-tekster",
            "title": "Tripitaka",
            "description": "De tre kurver - buddhismens hellige skrifter.",
            "image": "https://images.unsplash.com/photo-1606293926075-69a00febf280?auto=format&fit=crop&q=80",
            "tags": ["buddhisme", "hellige-tekster", "narrative"],
            "createdDate": now,
            "lastUpdated": now
        }
    ],
    "jodedom": [
        {
            "id": "grunnleggere",
            "title": "Abraham og Moses",
            "description": "Stamfaren og lovgiveren.",
            "image": "https://images.unsplash.com/photo-1590053723707-160d332d2d9c?auto=format&fit=crop&q=80",
            "tags": ["jodedom", "grunnleggere", "narrative"],
            "createdDate": now,
            "lastUpdated": now
        },
        {
            "id": "hellige-tekster",
            "title": "Tanakh",
            "description": "Den hebraiske bibelen.",
            "image": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80",
            "tags": ["jodedom", "hellige-tekster", "narrative"],
            "createdDate": now,
            "lastUpdated": now
        }
    ],
    "hinduisme": [
        {
            "id": "grunnleggere",
            "title": "Ingen enkelt grunnlegger",
            "description": "En religion uten en enkelt stifter.",
            "image": "https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?auto=format&fit=crop&q=80",
            "tags": ["hinduisme", "grunnleggere", "narrative"],
            "createdDate": now,
            "lastUpdated": now
        },
        {
            "id": "hellige-tekster",
            "title": "Vedaene og Bhagavad Gita",
            "description": "Hinduismens hellige skrifter.",
            "image": "https://images.unsplash.com/photo-1621827979802-6d778e170a64?auto=format&fit=crop&q=80",
            "tags": ["hinduisme", "hellige-tekster", "narrative"],
            "createdDate": now,
            "lastUpdated": now
        }
    ],
    "bahai": [
        {
            "id": "grunnleggere",
            "title": "Bahá'u'lláh",
            "description": "Grunnleggeren av bahá'í-troen.",
            "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Bahai_Gardens_Haifa_2011.jpg/1280px-Bahai_Gardens_Haifa_2011.jpg",
            "tags": ["bahai", "grunnleggere", "narrative"],
            "createdDate": now,
            "lastUpdated": now
        },
        {
            "id": "hellige-tekster",
            "title": "Kitáb-i-Aqdas",
            "description": "Den helligste boken i bahá'í.",
            "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Bahai_Gardens_Haifa_2011.jpg/1280px-Bahai_Gardens_Haifa_2011.jpg",
            "tags": ["bahai", "hellige-tekster", "narrative"],
            "createdDate": now,
            "lastUpdated": now
        }
    ],
    "mormonisme": [
        {
            "id": "grunnleggere",
            "title": "Joseph Smith",
            "description": "Profeten som gjenopprettet kirken.",
            "image": "https://images.unsplash.com/photo-1565108092241-1a06b0201b14?auto=format&fit=crop&q=80",
            "tags": ["mormonisme", "grunnleggere", "narrative"],
            "createdDate": now,
            "lastUpdated": now
        },
        {
            "id": "hellige-tekster",
            "title": "Mormons bok",
            "description": "Et annet testamente om Jesus Kristus.",
            "image": "https://images.unsplash.com/photo-1565108092241-1a06b0201b14?auto=format&fit=crop&q=80",
            "tags": ["mormonisme", "hellige-tekster", "narrative"],
            "createdDate": now,
            "lastUpdated": now
        }
    ],
    "jehovas-vitner": [
        {
            "id": "grunnleggere",
            "title": "Charles Taze Russell",
            "description": "Grunnleggeren av Bibelstudentene.",
            "image": "https://images.unsplash.com/photo-1507692049790-de58293a4697?auto=format&fit=crop&q=80",
            "tags": ["jehovas-vitner", "grunnleggere", "narrative"],
            "createdDate": now,
            "lastUpdated": now
        },
        {
            "id": "hellige-tekster",
            "title": "Ny verden-oversettelsen",
            "description": "Jehovas vitners bibeloversettelse.",
            "image": "https://images.unsplash.com/photo-1507692049790-de58293a4697?auto=format&fit=crop&q=80",
            "tags": ["jehovas-vitner", "hellige-tekster", "narrative"],
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
            if r_id in narrative_lessons:
                existing_lessons = religion.get('lessons', [])
                existing_ids = [l['id'] if isinstance(l, dict) else l for l in existing_lessons]
                
                for new_lesson in narrative_lessons[r_id]:
                    if new_lesson['id'] not in existing_ids:
                        # Insert before 'intro' if possible, or just append
                        # Actually, let's keep 'intro' last.
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

print("Successfully updated manifest.json with narrative lessons")
