import json
import os
import datetime

# Base path for content
base_path = r"c:\Users\Eirik\Documents\Eiriksbok\Eiriksbok\public\content\krle\religion"

# Current timestamp
now = datetime.datetime.utcnow().isoformat() + "Z"

# Data for Doctrinal dimension
# Structure: religion_id: { lesson_id: { title, description, content_summary, hero_image } }
doctrinal_data = {
    "kristendom": {
        "gudsbilde": {
            "title": "Treenigheten",
            "description": "Gud som Fader, Sønn og Hellig Ånd.",
            "content": "Kristne tror på én Gud som viser seg i tre personer: Faderen, Sønnen og Den hellige ånd.",
            "image": "https://images.unsplash.com/photo-1548625361-9882cf0f410e?auto=format&fit=crop&q=80"
        },
        "frelse": {
            "title": "Frelse og nåde",
            "description": "Frelse gjennom tro på Jesus.",
            "content": "Frelsen er en gave fra Gud (nåde) som mottas gjennom tro på Jesus Kristus.",
            "image": "https://images.unsplash.com/photo-1490902931801-d6f80ca94fe4?auto=format&fit=crop&q=80"
        }
    },
    "islam": {
        "gudsbilde": {
            "title": "Tawhid",
            "description": "Troen på Guds enhet.",
            "content": "Det viktigste dogmet i islam er Tawhid - at det finnes bare én Gud (Allah) og at han er uten like.",
            "image": "https://images.unsplash.com/photo-1564121211835-e88c852648ab?auto=format&fit=crop&q=80"
        },
        "frelse": {
            "title": "Dommens dag",
            "description": "Regnskapets time og livet etter døden.",
            "content": "På dommens dag vil alle mennesker dømmes etter sine handlinger og sin tro.",
            "image": "https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&q=80"
        }
    },
    "buddhisme": {
        "gudsbilde": {
            "title": "Ingen skapergud",
            "description": "En ikke-teistisk religion.",
            "content": "Buddhismen forholder seg ikke til en skapergud. Fokus er på menneskets eget sinn.",
            "image": "https://images.unsplash.com/photo-1526716173434-a1b560f2065d?auto=format&fit=crop&q=80"
        },
        "frelse": {
            "title": "Nirvana",
            "description": "Frigjøring fra lidelse og gjenfødelse.",
            "content": "Målet i buddhismen er å oppnå Nirvana - en tilstand fri for begjær, hat og uvitenhet.",
            "image": "https://images.unsplash.com/photo-1606293926075-69a00febf280?auto=format&fit=crop&q=80"
        }
    },
    "jodedom": {
        "gudsbilde": {
            "title": "Monoteisme",
            "description": "Troen på én Gud - Jahve.",
            "content": "Jødedommen lærer at det finnes én Gud som er skaperen av alt og som har inngått en pakt med det jødiske folk.",
            "image": "https://images.unsplash.com/photo-1590053723707-160d332d2d9c?auto=format&fit=crop&q=80"
        },
        "frelse": {
            "title": "Livet her og nå",
            "description": "Fokus på å leve et rettferdig liv.",
            "content": "Jødedommen fokuserer mer på å følge Guds bud i dette livet enn på hva som skjer etter døden.",
            "image": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80"
        }
    },
    "hinduisme": {
        "gudsbilde": {
            "title": "Brahman og guder",
            "description": "Én guddommelig kraft i mange former.",
            "content": "Mange hinduer tror på Brahman som den øverste virkelighet, som viser seg gjennom mange guder og gudinner.",
            "image": "https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?auto=format&fit=crop&q=80"
        },
        "frelse": {
            "title": "Moksha",
            "description": "Frigjøring fra samsara.",
            "content": "Målet er å bryte ut av rekken av gjenfødelser (samsara) og oppnå moksha.",
            "image": "https://images.unsplash.com/photo-1621827979802-6d778e170a64?auto=format&fit=crop&q=80"
        }
    },
    "bahai": {
        "gudsbilde": {
            "title": "En ukjennbar Gud",
            "description": "Gud er én og utenfor menneskelig fatteevne.",
            "content": "Bahá'í lærer at Gud er én, men at hans vesen er ukjennbart for mennesker.",
            "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Bahai_Gardens_Haifa_2011.jpg/1280px-Bahai_Gardens_Haifa_2011.jpg"
        },
        "frelse": {
            "title": "Åndelig utvikling",
            "description": "Sjelens reise mot Gud.",
            "content": "Livet er en mulighet for sjelen til å utvikle åndelige egenskaper som kjærlighet og rettferdighet.",
            "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Bahai_Gardens_Haifa_2011.jpg/1280px-Bahai_Gardens_Haifa_2011.jpg"
        }
    },
    "mormonisme": {
        "gudsbilde": {
            "title": "Guddommen",
            "description": "Faderen, Sønnen og Den hellige ånd er tre separate vesener.",
            "content": "Mormonere tror at Gud Faderen og Jesus Kristus har fysiske kropper, mens Den hellige ånd er et åndevesen.",
            "image": "https://images.unsplash.com/photo-1565108092241-1a06b0201b14?auto=format&fit=crop&q=80"
        },
        "frelse": {
            "title": "Evig progresjon",
            "description": "Muligheten til å bli lik Gud.",
            "content": "Gjennom tro, omvendelse og pakter kan mennesker utvikle seg og til slutt bli like Gud.",
            "image": "https://images.unsplash.com/photo-1565108092241-1a06b0201b14?auto=format&fit=crop&q=80"
        }
    },
    "jehovas-vitner": {
        "gudsbilde": {
            "title": "Jehova",
            "description": "Guds personlige navn.",
            "content": "Jehovas vitner bruker Guds navn, Jehova, og tror ikke på treenigheten.",
            "image": "https://images.unsplash.com/photo-1507692049790-de58293a4697?auto=format&fit=crop&q=80"
        },
        "frelse": {
            "title": "Paradis på jord",
            "description": "Håpet om evig liv på en paradisisk jord.",
            "content": "De fleste troende håper på å leve evig på jorden, mens en liten gruppe skal til himmelen.",
            "image": "https://images.unsplash.com/photo-1507692049790-de58293a4697?auto=format&fit=crop&q=80"
        }
    }
}

for religion, lessons in doctrinal_data.items():
    religion_dir = os.path.join(base_path, religion)
    if not os.path.exists(religion_dir):
        print(f"Directory not found: {religion_dir}")
        continue
    
    for lesson_id, data in lessons.items():
        file_path = os.path.join(religion_dir, f"{lesson_id}.json")
        
        article_content = {
            "id": lesson_id,
            "title": data["title"],
            "ingress": data["description"],
            "image": data["image"],
            "content": [
                {
                    "type": "text",
                    "text": data["content"]
                }
            ],
            "tags": [religion, lesson_id, "doctrinal"],
            "religion": religion,
            "comparison_tags": [lesson_id],
            "createdDate": now,
            "lastUpdated": now
        }
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(article_content, f, indent=4)
            
        print(f"Created {file_path}")

print("All doctrinal articles created.")
