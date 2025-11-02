#!/usr/bin/env python3
"""
Script to convert seed-verbs.json from old structure to new structure with full conjugations.
Adds all tenses and subjects (yo, vos, el/ella, nosotros, vosotros, ellos/ellas).
"""

import json
import re

# Conjugation patterns for regular verbs
def conjugate_regular_ar(stem):
    return {
        "presente": {
            "yo": f"{stem}o",
            "vos": f"{stem}ás",
            "el": f"{stem}a",
            "nosotros": f"{stem}amos",
            "vosotros": f"{stem}áis",
            "ellos": f"{stem}an"
        },
        "preterito": {
            "yo": f"{stem}é",
            "vos": f"{stem}aste",
            "el": f"{stem}ó",
            "nosotros": f"{stem}amos",
            "vosotros": f"{stem}asteis",
            "ellos": f"{stem}aron"
        },
        "imperfecto": {
            "yo": f"{stem}aba",
            "vos": f"{stem}abas",
            "el": f"{stem}aba",
            "nosotros": f"{stem}ábamos",
            "vosotros": f"{stem}abais",
            "ellos": f"{stem}aban"
        },
        "futuro": {
            "yo": f"{stem}aré",
            "vos": f"{stem}arás",
            "el": f"{stem}ará",
            "nosotros": f"{stem}aremos",
            "vosotros": f"{stem}aréis",
            "ellos": f"{stem}arán"
        },
        "condicional": {
            "yo": f"{stem}aría",
            "vos": f"{stem}arías",
            "el": f"{stem}aría",
            "nosotros": f"{stem}aríamos",
            "vosotros": f"{stem}aríais",
            "ellos": f"{stem}arían"
        }
    }

def conjugate_regular_er(stem):
    return {
        "presente": {
            "yo": f"{stem}o",
            "vos": f"{stem}és",
            "el": f"{stem}e",
            "nosotros": f"{stem}emos",
            "vosotros": f"{stem}éis",
            "ellos": f"{stem}en"
        },
        "preterito": {
            "yo": f"{stem}í",
            "vos": f"{stem}iste",
            "el": f"{stem}ió",
            "nosotros": f"{stem}imos",
            "vosotros": f"{stem}isteis",
            "ellos": f"{stem}ieron"
        },
        "imperfecto": {
            "yo": f"{stem}ía",
            "vos": f"{stem}ías",
            "el": f"{stem}ía",
            "nosotros": f"{stem}íamos",
            "vosotros": f"{stem}íais",
            "ellos": f"{stem}ían"
        },
        "futuro": {
            "yo": f"{stem}eré",
            "vos": f"{stem}erás",
            "el": f"{stem}erá",
            "nosotros": f"{stem}eremos",
            "vosotros": f"{stem}eréis",
            "ellos": f"{stem}erán"
        },
        "condicional": {
            "yo": f"{stem}ería",
            "vos": f"{stem}erías",
            "el": f"{stem}ería",
            "nosotros": f"{stem}eríamos",
            "vosotros": f"{stem}eríais",
            "ellos": f"{stem}erían"
        }
    }

def conjugate_regular_ir(stem):
    return {
        "presente": {
            "yo": f"{stem}o",
            "vos": f"{stem}ís",
            "el": f"{stem}e",
            "nosotros": f"{stem}imos",
            "vosotros": f"{stem}ís",
            "ellos": f"{stem}en"
        },
        "preterito": {
            "yo": f"{stem}í",
            "vos": f"{stem}iste",
            "el": f"{stem}ió",
            "nosotros": f"{stem}imos",
            "vosotros": f"{stem}isteis",
            "ellos": f"{stem}ieron"
        },
        "imperfecto": {
            "yo": f"{stem}ía",
            "vos": f"{stem}ías",
            "el": f"{stem}ía",
            "nosotros": f"{stem}íamos",
            "vosotros": f"{stem}íais",
            "ellos": f"{stem}ían"
        },
        "futuro": {
            "yo": f"{stem}iré",
            "vos": f"{stem}irás",
            "el": f"{stem}irá",
            "nosotros": f"{stem}iremos",
            "vosotros": f"{stem}iréis",
            "ellos": f"{stem}irán"
        },
        "condicional": {
            "yo": f"{stem}iría",
            "vos": f"{stem}irías",
            "el": f"{stem}iría",
            "nosotros": f"{stem}iríamos",
            "vosotros": f"{stem}iríais",
            "ellos": f"{stem}irían"
        }
    }

# Irregular verb conjugations
IRREGULAR_VERBS = {
    "ser": {
        "presente": {"yo": "soy", "vos": "sos", "el": "es", "nosotros": "somos", "vosotros": "sois", "ellos": "son"},
        "preterito": {"yo": "fui", "vos": "fuiste", "el": "fue", "nosotros": "fuimos", "vosotros": "fuisteis", "ellos": "fueron"},
        "imperfecto": {"yo": "era", "vos": "eras", "el": "era", "nosotros": "éramos", "vosotros": "erais", "ellos": "eran"},
        "futuro": {"yo": "seré", "vos": "serás", "el": "será", "nosotros": "seremos", "vosotros": "seréis", "ellos": "serán"},
        "condicional": {"yo": "sería", "vos": "serías", "el": "sería", "nosotros": "seríamos", "vosotros": "seríais", "ellos": "serían"}
    },
    "estar": {
        "presente": {"yo": "estoy", "vos": "estás", "el": "está", "nosotros": "estamos", "vosotros": "estáis", "ellos": "están"},
        "preterito": {"yo": "estuve", "vos": "estuviste", "el": "estuvo", "nosotros": "estuvimos", "vosotros": "estuvisteis", "ellos": "estuvieron"},
        "imperfecto": {"yo": "estaba", "vos": "estabas", "el": "estaba", "nosotros": "estábamos", "vosotros": "estabais", "ellos": "estaban"},
        "futuro": {"yo": "estaré", "vos": "estarás", "el": "estará", "nosotros": "estaremos", "vosotros": "estaréis", "ellos": "estarán"},
        "condicional": {"yo": "estaría", "vos": "estarías", "el": "estaría", "nosotros": "estaríamos", "vosotros": "estaríais", "ellos": "estarían"}
    },
    "tener": {
        "presente": {"yo": "tengo", "vos": "tenés", "el": "tiene", "nosotros": "tenemos", "vosotros": "tenéis", "ellos": "tienen"},
        "preterito": {"yo": "tuve", "vos": "tuviste", "el": "tuvo", "nosotros": "tuvimos", "vosotros": "tuvisteis", "ellos": "tuvieron"},
        "imperfecto": {"yo": "tenía", "vos": "tenías", "el": "tenía", "nosotros": "teníamos", "vosotros": "teníais", "ellos": "tenían"},
        "futuro": {"yo": "tendré", "vos": "tendrás", "el": "tendrá", "nosotros": "tendremos", "vosotros": "tendréis", "ellos": "tendrán"},
        "condicional": {"yo": "tendría", "vos": "tendrías", "el": "tendría", "nosotros": "tendríamos", "vosotros": "tendríais", "ellos": "tendrían"}
    },
    "hacer": {
        "presente": {"yo": "hago", "vos": "hacés", "el": "hace", "nosotros": "hacemos", "vosotros": "hacéis", "ellos": "hacen"},
        "preterito": {"yo": "hice", "vos": "hiciste", "el": "hizo", "nosotros": "hicimos", "vosotros": "hicisteis", "ellos": "hicieron"},
        "imperfecto": {"yo": "hacía", "vos": "hacías", "el": "hacía", "nosotros": "hacíamos", "vosotros": "hacíais", "ellos": "hacían"},
        "futuro": {"yo": "haré", "vos": "harás", "el": "hará", "nosotros": "haremos", "vosotros": "haréis", "ellos": "harán"},
        "condicional": {"yo": "haría", "vos": "harías", "el": "haría", "nosotros": "haríamos", "vosotros": "haríais", "ellos": "harían"}
    },
    "decir": {
        "presente": {"yo": "digo", "vos": "decís", "el": "dice", "nosotros": "decimos", "vosotros": "decís", "ellos": "dicen"},
        "preterito": {"yo": "dije", "vos": "dijiste", "el": "dijo", "nosotros": "dijimos", "vosotros": "dijisteis", "ellos": "dijeron"},
        "imperfecto": {"yo": "decía", "vos": "decías", "el": "decía", "nosotros": "decíamos", "vosotros": "decíais", "ellos": "decían"},
        "futuro": {"yo": "diré", "vos": "dirás", "el": "dirá", "nosotros": "diremos", "vosotros": "diréis", "ellos": "dirán"},
        "condicional": {"yo": "diría", "vos": "dirías", "el": "diría", "nosotros": "diríamos", "vosotros": "diríais", "ellos": "dirían"}
    },
    "ir": {
        "presente": {"yo": "voy", "vos": "vas", "el": "va", "nosotros": "vamos", "vosotros": "vais", "ellos": "van"},
        "preterito": {"yo": "fui", "vos": "fuiste", "el": "fue", "nosotros": "fuimos", "vosotros": "fuisteis", "ellos": "fueron"},
        "imperfecto": {"yo": "iba", "vos": "ibas", "el": "iba", "nosotros": "íbamos", "vosotros": "ibais", "ellos": "iban"},
        "futuro": {"yo": "iré", "vos": "irás", "el": "irá", "nosotros": "iremos", "vosotros": "iréis", "ellos": "irán"},
        "condicional": {"yo": "iría", "vos": "irías", "el": "iría", "nosotros": "iríamos", "vosotros": "iríais", "ellos": "irían"}
    },
    "venir": {
        "presente": {"yo": "vengo", "vos": "venís", "el": "viene", "nosotros": "venimos", "vosotros": "venís", "ellos": "vienen"},
        "preterito": {"yo": "vine", "vos": "viniste", "el": "vino", "nosotros": "vinimos", "vosotros": "vinisteis", "ellos": "vinieron"},
        "imperfecto": {"yo": "venía", "vos": "venías", "el": "venía", "nosotros": "veníamos", "vosotros": "veníais", "ellos": "venían"},
        "futuro": {"yo": "vendré", "vos": "vendrás", "el": "vendrá", "nosotros": "vendremos", "vosotros": "vendréis", "ellos": "vendrán"},
        "condicional": {"yo": "vendría", "vos": "vendrías", "el": "vendría", "nosotros": "vendríamos", "vosotros": "vendríais", "ellos": "vendrían"}
    },
    "poder": {
        "presente": {"yo": "puedo", "vos": "podés", "el": "puede", "nosotros": "podemos", "vosotros": "podéis", "ellos": "pueden"},
        "preterito": {"yo": "pude", "vos": "pudiste", "el": "pudo", "nosotros": "pudimos", "vosotros": "pudisteis", "ellos": "pudieron"},
        "imperfecto": {"yo": "podía", "vos": "podías", "el": "podía", "nosotros": "podíamos", "vosotros": "podíais", "ellos": "podían"},
        "futuro": {"yo": "podré", "vos": "podrás", "el": "podrá", "nosotros": "podremos", "vosotros": "podréis", "ellos": "podrán"},
        "condicional": {"yo": "podría", "vos": "podrías", "el": "podría", "nosotros": "podríamos", "vosotros": "podríais", "ellos": "podrían"}
    },
    "querer": {
        "presente": {"yo": "quiero", "vos": "querés", "el": "quiere", "nosotros": "queremos", "vosotros": "queréis", "ellos": "quieren"},
        "preterito": {"yo": "quise", "vos": "quisiste", "el": "quiso", "nosotros": "quisimos", "vosotros": "quisisteis", "ellos": "quisieron"},
        "imperfecto": {"yo": "quería", "vos": "querías", "el": "quería", "nosotros": "queríamos", "vosotros": "queríais", "ellos": "querían"},
        "futuro": {"yo": "querré", "vos": "querrás", "el": "querrá", "nosotros": "querremos", "vosotros": "querréis", "ellos": "querrán"},
        "condicional": {"yo": "querría", "vos": "querrías", "el": "querría", "nosotros": "querríamos", "vosotros": "querríais", "ellos": "querrían"}
    },
    "saber": {
        "presente": {"yo": "sé", "vos": "sabés", "el": "sabe", "nosotros": "sabemos", "vosotros": "sabéis", "ellos": "saben"},
        "preterito": {"yo": "supe", "vos": "supiste", "el": "supo", "nosotros": "supimos", "vosotros": "supisteis", "ellos": "supieron"},
        "imperfecto": {"yo": "sabía", "vos": "sabías", "el": "sabía", "nosotros": "sabíamos", "vosotros": "sabíais", "ellos": "sabían"},
        "futuro": {"yo": "sabré", "vos": "sabrás", "el": "sabrá", "nosotros": "sabremos", "vosotros": "sabréis", "ellos": "sabrán"},
        "condicional": {"yo": "sabría", "vos": "sabrías", "el": "sabría", "nosotros": "sabríamos", "vosotros": "sabríais", "ellos": "sabrían"}
    },
    "dar": {
        "presente": {"yo": "doy", "vos": "das", "el": "da", "nosotros": "damos", "vosotros": "dais", "ellos": "dan"},
        "preterito": {"yo": "di", "vos": "diste", "el": "dio", "nosotros": "dimos", "vosotros": "disteis", "ellos": "dieron"},
        "imperfecto": {"yo": "daba", "vos": "dabas", "el": "daba", "nosotros": "dábamos", "vosotros": "dabais", "ellos": "daban"},
        "futuro": {"yo": "daré", "vos": "darás", "el": "dará", "nosotros": "daremos", "vosotros": "daréis", "ellos": "darán"},
        "condicional": {"yo": "daría", "vos": "darías", "el": "daría", "nosotros": "daríamos", "vosotros": "daríais", "ellos": "darían"}
    },
    "ver": {
        "presente": {"yo": "veo", "vos": "ves", "el": "ve", "nosotros": "vemos", "vosotros": "veis", "ellos": "ven"},
        "preterito": {"yo": "vi", "vos": "viste", "el": "vio", "nosotros": "vimos", "vosotros": "visteis", "ellos": "vieron"},
        "imperfecto": {"yo": "veía", "vos": "veías", "el": "veía", "nosotros": "veíamos", "vosotros": "veíais", "ellos": "veían"},
        "futuro": {"yo": "veré", "vos": "verás", "el": "verá", "nosotros": "veremos", "vosotros": "veréis", "ellos": "verán"},
        "condicional": {"yo": "vería", "vos": "verías", "el": "vería", "nosotros": "veríamos", "vosotros": "veríais", "ellos": "verían"}
    },
    "salir": {
        "presente": {"yo": "salgo", "vos": "salís", "el": "sale", "nosotros": "salimos", "vosotros": "salís", "ellos": "salen"},
        "preterito": {"yo": "salí", "vos": "saliste", "el": "salió", "nosotros": "salimos", "vosotros": "salisteis", "ellos": "salieron"},
        "imperfecto": {"yo": "salía", "vos": "salías", "el": "salía", "nosotros": "salíamos", "vosotros": "salíais", "ellos": "salían"},
        "futuro": {"yo": "saldré", "vos": "saldrás", "el": "saldrá", "nosotros": "saldremos", "vosotros": "saldréis", "ellos": "saldrán"},
        "condicional": {"yo": "saldría", "vos": "saldrías", "el": "saldría", "nosotros": "saldríamos", "vosotros": "saldríais", "ellos": "saldrían"}
    },
    "poner": {
        "presente": {"yo": "pongo", "vos": "ponés", "el": "pone", "nosotros": "ponemos", "vosotros": "ponéis", "ellos": "ponen"},
        "preterito": {"yo": "puse", "vos": "pusiste", "el": "puso", "nosotros": "pusimos", "vosotros": "pusisteis", "ellos": "pusieron"},
        "imperfecto": {"yo": "ponía", "vos": "ponías", "el": "ponía", "nosotros": "poníamos", "vosotros": "poníais", "ellos": "ponían"},
        "futuro": {"yo": "pondré", "vos": "pondrás", "el": "pondrá", "nosotros": "pondremos", "vosotros": "pondréis", "ellos": "pondrán"},
        "condicional": {"yo": "pondría", "vos": "pondrías", "el": "pondría", "nosotros": "pondríamos", "vosotros": "pondríais", "ellos": "pondrían"}
    },
    "traer": {
        "presente": {"yo": "traigo", "vos": "traés", "el": "trae", "nosotros": "traemos", "vosotros": "traéis", "ellos": "traen"},
        "preterito": {"yo": "traje", "vos": "trajiste", "el": "trajo", "nosotros": "trajimos", "vosotros": "trajisteis", "ellos": "trajeron"},
        "imperfecto": {"yo": "traía", "vos": "traías", "el": "traía", "nosotros": "traíamos", "vosotros": "traíais", "ellos": "traían"},
        "futuro": {"yo": "traeré", "vos": "traerás", "el": "traerá", "nosotros": "traeremos", "vosotros": "traeréis", "ellos": "traerán"},
        "condicional": {"yo": "traería", "vos": "traerías", "el": "traería", "nosotros": "traeríamos", "vosotros": "traeríais", "ellos": "traerían"}
    },
    "andar": {
        "presente": {"yo": "ando", "vos": "andás", "el": "anda", "nosotros": "andamos", "vosotros": "andáis", "ellos": "andan"},
        "preterito": {"yo": "anduve", "vos": "anduviste", "el": "anduvo", "nosotros": "anduvimos", "vosotros": "anduvisteis", "ellos": "anduvieron"},
        "imperfecto": {"yo": "andaba", "vos": "andabas", "el": "andaba", "nosotros": "andábamos", "vosotros": "andabais", "ellos": "andaban"},
        "futuro": {"yo": "andaré", "vos": "andarás", "el": "andará", "nosotros": "andaremos", "vosotros": "andaréis", "ellos": "andarán"},
        "condicional": {"yo": "andaría", "vos": "andarías", "el": "andaría", "nosotros": "andaríamos", "vosotros": "andaríais", "ellos": "andarían"}
    },
}

def get_conjugations(infinitive, is_irregular):
    if is_irregular and infinitive in IRREGULAR_VERBS:
        return IRREGULAR_VERBS[infinitive]

    # Determine verb type and stem
    if infinitive.endswith('ar'):
        stem = infinitive[:-2]
        return conjugate_regular_ar(stem)
    elif infinitive.endswith('er'):
        stem = infinitive[:-2]
        return conjugate_regular_er(stem)
    elif infinitive.endswith('ir'):
        stem = infinitive[:-2]
        return conjugate_regular_ir(stem)
    else:
        # Reflexive verbs
        if infinitive.endswith('se'):
            base = infinitive[:-2]
            if base.endswith('ar'):
                stem = base[:-2]
                conj = conjugate_regular_ar(stem)
                # Add reflexive pronouns
                for tense in conj:
                    conj[tense]["yo"] = f"me {conj[tense]['yo']}"
                    conj[tense]["vos"] = f"te {conj[tense]['vos']}"
                    conj[tense]["el"] = f"se {conj[tense]['el']}"
                    conj[tense]["nosotros"] = f"nos {conj[tense]['nosotros']}"
                    conj[tense]["vosotros"] = f"os {conj[tense]['vosotros']}"
                    conj[tense]["ellos"] = f"se {conj[tense]['ellos']}"
                return conj
            elif base.endswith('er'):
                stem = base[:-2]
                conj = conjugate_regular_er(stem)
                for tense in conj:
                    conj[tense]["yo"] = f"me {conj[tense]['yo']}"
                    conj[tense]["vos"] = f"te {conj[tense]['vos']}"
                    conj[tense]["el"] = f"se {conj[tense]['el']}"
                    conj[tense]["nosotros"] = f"nos {conj[tense]['nosotros']}"
                    conj[tense]["vosotros"] = f"os {conj[tense]['vosotros']}"
                    conj[tense]["ellos"] = f"se {conj[tense]['ellos']}"
                return conj
            elif base.endswith('ir'):
                stem = base[:-2]
                conj = conjugate_regular_ir(stem)
                for tense in conj:
                    conj[tense]["yo"] = f"me {conj[tense]['yo']}"
                    conj[tense]["vos"] = f"te {conj[tense]['vos']}"
                    conj[tense]["el"] = f"se {conj[tense]['el']}"
                    conj[tense]["nosotros"] = f"nos {conj[tense]['nosotros']}"
                    conj[tense]["vosotros"] = f"os {conj[tense]['vosotros']}"
                    conj[tense]["ellos"] = f"se {conj[tense]['ellos']}"
                return conj

    return {}

def convert_verbs():
    with open('../src/data/seed-verbs.json', 'r') as f:
        old_verbs = json.load(f)

    new_verbs = []
    for verb in old_verbs:
        infinitive = verb['infinitive']
        is_irregular = verb.get('isIrregular', False)

        conjugations = get_conjugations(infinitive, is_irregular)

        new_verb = {
            "infinitive": infinitive,
            "english": verb['english'],
            "conjugations": conjugations,
            "exampleSpanish": verb.get('exampleSpanish'),
            "exampleEnglish": verb.get('exampleEnglish'),
            "isIrregular": is_irregular,
            "category": verb.get('category')
        }
        new_verbs.append(new_verb)
        print(f"✅ Converted: {infinitive}")

    with open('../src/data/seed-verbs.json', 'w') as f:
        json.dump(new_verbs, f, indent=2, ensure_ascii=False)

    print(f"\n🎉 Converted {len(new_verbs)} verbs!")

if __name__ == '__main__':
    convert_verbs()
