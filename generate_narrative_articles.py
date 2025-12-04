import json
import os
import datetime

# Base path for content
base_path = r"c:\Users\Eirik\Documents\Eiriksbok\Eiriksbok\public\content\krle\religion"

# Current timestamp
now = datetime.datetime.utcnow().isoformat() + "Z"

# Data for Narrative dimension
# Structure: religion_id: { lesson_id: { title, description, content_summary, hero_image } }
narrative_data = {
    "kristendom": {
        "grunnleggere": {
            "title": "Jesus",
            "description": "Jesus fra Nasaret - kristendommens grunnlegger.",
            "content": "Jesus er den sentrale skikkelsen i kristendommen. Kristne tror han er Guds sønn og verdens frelser.",
            "image": "https://images.unsplash.com/photo-1548625361-9882cf0f410e?auto=format&fit=crop&q=80"
        },
        "hellige-tekster": {
            "title": "Bibelen",
            "description": "Kristendommens hellige skrift.",
            "content": "Bibelen består av Det gamle og Det nye testamentet.",
            "image": "https://images.unsplash.com/photo-1490902931801-d6f80ca94fe4?auto=format&fit=crop&q=80"
        }
    },
    "islam": {
        "grunnleggere": {
            "title": "Muhammad",
            "description": "Profeten Muhammad - islams siste profet.",
            "content": "Muhammad mottok åpenbaringene fra Gud (Allah) som ble til Koranen.",
            "image": "https://images.unsplash.com/photo-1564121211835-e88c852648ab?auto=format&fit=crop&q=80"
        },
        "hellige-tekster": {
            "title": "Koranen",
            "description": "Islams hellige bok.",
            "content": "Koranen regnes som Guds ord, åpenbart for Muhammad på arabisk.",
            "image": "https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&q=80"
        }
    },
    "buddhisme": {
        "grunnleggere": {
            "title": "Buddha",
            "description": "Siddhartha Gautama - den oppvåknede.",
            "content": "Buddha fant veien til opplysning og underviste om de fire edle sannheter.",
            "image": "https://images.unsplash.com/photo-1526716173434-a1b560f2065d?auto=format&fit=crop&q=80"
        },
        "hellige-tekster": {
            "title": "Tripitaka",
            "description": "De tre kurver - buddhismens hellige skrifter.",
            "content": "Tripitaka inneholder Buddhas lære, regler for munker og filosofiske tekster.",
            "image": "https://images.unsplash.com/photo-1606293926075-69a00febf280?auto=format&fit=crop&q=80"
        }
    },
    "jodedom": {
        "grunnleggere": {
            "title": "Abraham og Moses",
            "description": "Stamfaren og lovgiveren.",
            "content": "Abraham regnes som stamfar, mens Moses mottok Toraen på Sinai-fjellet.",
            "image": "https://images.unsplash.com/photo-1590053723707-160d332d2d9c?auto=format&fit=crop&q=80"
        },
        "hellige-tekster": {
            "title": "Tanakh",
            "description": "Den hebraiske bibelen.",
            "content": "Tanakh består av Toraen (Loven), Profetene og Skriftene.",
            "image": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80"
        }
    },
    "hinduisme": {
        "grunnleggere": {
            "title": "Ingen enkelt grunnlegger",
            "description": "En religion uten en enkelt stifter.",
            "content": "Hinduismen har ingen enkelt grunnlegger, men har utviklet seg over tusenvis av år gjennom vismenn (rishier).",
            "image": "https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?auto=format&fit=crop&q=80"
        },
        "hellige-tekster": {
            "title": "Vedaene og Bhagavad Gita",
            "description": "Hinduismens hellige skrifter.",
            "content": "Vedaene er de eldste skriftene, mens Bhagavad Gita er en sentral tekst om plikt og hengivelse.",
            "image": "https://images.unsplash.com/photo-1621827979802-6d778e170a64?auto=format&fit=crop&q=80"
        }
    },
    "bahai": {
        "grunnleggere": {
            "title": "Bahá'u'lláh",
            "description": "Grunnleggeren av bahá'í-troen.",
            "content": "Bahá'u'lláh forkynte at alle religioner kommer fra samme Gud og at tiden er inne for menneskehetens enhet.",
            "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Bahai_Gardens_Haifa_2011.jpg/1280px-Bahai_Gardens_Haifa_2011.jpg"
        },
        "hellige-tekster": {
            "title": "Kitáb-i-Aqdas",
            "description": "Den helligste boken i bahá'í.",
            "content": "Kitáb-i-Aqdas inneholder lovene og prinsippene for bahá'í-samfunnet.",
            "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Bahai_Gardens_Haifa_2011.jpg/1280px-Bahai_Gardens_Haifa_2011.jpg"
        }
    },
    "mormonisme": {
        "grunnleggere": {
            "title": "Joseph Smith",
            "description": "Profeten som gjenopprettet kirken.",
            "content": "Joseph Smith oversatte Mormons bok og grunnla Jesu Kristi Kirke av Siste Dagers Hellige.",
            "image": "https://images.unsplash.com/photo-1565108092241-1a06b0201b14?auto=format&fit=crop&q=80"
        },
        "hellige-tekster": {
            "title": "Mormons bok",
            "description": "Et annet testamente om Jesus Kristus.",
            "content": "Mormons bok regnes som hellig skrift sammen med Bibelen.",
            "image": "https://images.unsplash.com/photo-1565108092241-1a06b0201b14?auto=format&fit=crop&q=80"
        }
    },
    "jehovas-vitner": {
        "grunnleggere": {
            "title": "Charles Taze Russell",
            "description": "Grunnleggeren av Bibelstudentene.",
            "content": "Charles Taze Russell startet bevegelsen som senere ble kjent som Jehovas vitner.",
            "image": "https://images.unsplash.com/photo-1507692049790-de58293a4697?auto=format&fit=crop&q=80"
        },
        "hellige-tekster": {
            "title": "Ny verden-oversettelsen",
            "description": "Jehovas vitners bibeloversettelse.",
            "content": "De bruker sin egen oversettelse av Bibelen, kalt Ny verden-oversettelsen.",
            "image": "https://images.unsplash.com/photo-1507692049790-de58293a4697?auto=format&fit=crop&q=80"
        }
    }
}

for religion, lessons in narrative_data.items():
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
            "tags": [religion, lesson_id, "narrative"],
            "religion": religion,
            "comparison_tags": [lesson_id],
            "createdDate": now,
            "lastUpdated": now
        }
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(article_content, f, indent=4)
            
        print(f"Created {file_path}")

print("All narrative articles created.")
