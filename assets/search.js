/*
 * BiosSearch — buscador de estudios de Laboratorios BIOS.
 *
 * Implementa el "Diccionario maestro de búsqueda" (estudios/diccionario-busqueda.md).
 * Los datos por estudio (alias directos `kw`, grupos semánticos `tags`,
 * erratas `typos`) y la tabla global de erratas `window.BIOS_TYPOS` los
 * genera tools/build_estudios.py; aquí vive el motor.
 *
 * Qué hace, por sección del diccionario:
 *
 *  §2 Normalización: minúsculas, sin acentos, ñ→n, puntuación unificada,
 *     equivalencias de modalidad (rx/usg/tac), claves cortas por token
 *     exacto (nunca substring: la clave PIE de embarazo no se activa con la
 *     palabra "pie"), fuzzy desde 5 caracteres y prefijos desde 4.
 *  §3 Ranking por niveles: clave exacta > nombre > alias directo > frase
 *     coloquial > término relacionado > modalidad genérica.
 *  §4 Erratas frecuentes, corregidas en la consulta antes de puntuar.
 *  §5 Grupos semánticos, que puntúan bajo para no tapar a los alias.
 *  §7 Reglas especiales: modalidad + anatomía, y desambiguaciones concretas
 *     (PSA libre vs total, EKG de esfuerzo, TAC con/sin contraste…).
 *
 * API:
 *   const index = BiosSearch.createIndex(items);
 *   const { results, partial, tokens } = BiosSearch.search(query, index);
 *   BiosSearch.highlight(texto, tokens);    // -> HTML con <mark>
 *   BiosSearch.suggest(query, index, 4);    // -> ["papanicolaou", ...]
 */
(function (global) {
    'use strict';

    /* ------------------------------------------------------------------ */
    /* §3 Niveles de puntuación                                            */
    /* ------------------------------------------------------------------ */

    var SCORE = {
        keyExact: 120,      // clave exacta completa
        keyToken: 90,       // un token de una clave compuesta
        nameExact: 110,     // nombre oficial exacto
        namePrefix: 105,    // el término abre el nombre ("papan" -> Papanicolaou)
        nameStart: 92,      // el término empieza una palabra del nombre
        nameInside: 55,     // aparece a media palabra del nombre
        alias: 95,          // alias directo / abreviatura inequívoca
        aliasInside: 55,
        typo: 88,           // errata documentada para ese estudio
        fuzzyName: 78,      // fuzzy sobre el nombre
        fuzzyAlias: 62,     // fuzzy sobre los alias
        tagExact: 35,       // término relacionado (grupo semántico)
        tagStart: 30,
        category: 20,
        branch: 16,
        prep: 9,
        modalityFloor: 10   // "sólo modalidad genérica"
    };

    var BONUS = {
        phraseAlias: 95,    // la consulta completa es un alias directo
        phraseName: 110,    // la consulta completa es el nombre oficial
        phraseInAlias: 70,  // frase coloquial contenida en un alias
        phraseInName: 55,
        multiToken: 45,     // 2+ tokens directos
        modalityMatch: 45,
        modalitySoft: 25,   // "eco" es señal débil (§7.1)
        modalityClash: -70
    };

    var STOP_WORDS = {
        de: 1, del: 1, la: 1, el: 1, los: 1, las: 1, un: 1, una: 1, unos: 1, unas: 1,
        y: 1, o: 1, en: 1, para: 1, con: 1, al: 1, por: 1, mi: 1, me: 1,
        se: 1, que: 1, es: 1, a: 1, su: 1, sus: 1, lo: 1, le: 1, tu: 1
    };

    /* ------------------------------------------------------------------ */
    /* §2.6 y §7.3 Modalidades                                             */
    /* ------------------------------------------------------------------ */

    // Token de la consulta -> modalidad. Sirve para subir el estudio de la
    // modalidad pedida y bajar el de otra modalidad de la misma zona:
    // "rodilla rx" no debe devolver el ultrasonido de rodilla.
    var MODALITY_WORDS = {
        rx: ['rx', 'rayos', 'rayosx', 'radiografia', 'radiografias', 'placa', 'placas', 'tele'],
        usg: ['usg', 'ultrasonido', 'ultrasonidos', 'ecografia', 'sonografia', 'sonograma', 'ultrason'],
        tac: ['tac', 'tc', 'ct', 'tomografia', 'tomografias'],
        lab: ['laboratorio', 'analisis']
    };

    // §7.1 "eco" sola es ambigua (ecocardiograma vs ecografía): empuja hacia
    // ultrasonido, pero nunca penaliza a otra modalidad.
    var SOFT_USG = { eco: 1, echo: 1 };

    var DOC_MODALITY = {
        'Rayos X': 'rx',
        'Ultrasonido': 'usg',
        'Tomografía': 'tac',
        'Laboratorio clínico': 'lab'
        // "Estudios especiales" queda sin modalidad: ahí viven mastografía,
        // electrocardiograma y densitometría, que se piden con vocabulario
        // de varias modalidades.
    };

    var MODALITY_OF_WORD = (function () {
        var map = {};
        Object.keys(MODALITY_WORDS).forEach(function (modality) {
            MODALITY_WORDS[modality].forEach(function (word) { map[word] = modality; });
        });
        return map;
    }());

    /* ------------------------------------------------------------------ */
    /* §5 y §7.4 Sinónimos y coloquialismos                                */
    /* ------------------------------------------------------------------ */

    // Complementan a los alias del diccionario con el habla del paciente.
    // Cada grupo es simétrico: escribir cualquiera busca también los demás,
    // con menos peso que una coincidencia directa.
    var SYNONYM_GROUPS = [
        ['azucar', 'glucosa', 'glucemia', 'diabetes'],
        ['colesterol', 'trigliceridos', 'lipidos', 'lipidico'],
        ['riñon', 'rinon', 'renal', 'rinones'],
        ['higado', 'hepatico', 'biliar', 'biliares'],
        ['sangre', 'sanguinea', 'hematica', 'hemograma', 'biometria'],
        ['orina', 'urinario', 'urinarias', 'miccion', 'pipi'],
        ['heces', 'excremento', 'popo', 'fecal', 'evacuacion'],
        ['mama', 'mamas', 'seno', 'senos', 'busto', 'mamario'],
        ['pecho', 'costillas'],
        ['corazon', 'cardiaco', 'cardiaca', 'cardiologico', 'cardio'],
        ['garganta', 'faringeo', 'faringe', 'anginas', 'amigdalas'],
        ['hueso', 'huesos', 'oseo', 'osea', 'osteoporosis'],
        ['vista', 'visual', 'ojo', 'ojos', 'lentes', 'vision'],
        ['niño', 'nino', 'niña', 'nina', 'niños', 'ninos', 'bebe', 'pediatrico', 'infantil'],
        ['hombre', 'masculino', 'varon'],
        ['mujer', 'femenino', 'femenina', 'dama'],
        ['embarazo', 'embarazada', 'gestacion', 'prenatal'],
        ['prostata', 'prostatico'],
        ['tiroides', 'tiroideo', 'tiroidea', 'tiroide'],
        ['abdomen', 'abdominal', 'panza', 'estomago', 'vientre'],
        ['cabeza', 'craneo', 'cerebral', 'cerebro'],
        ['espalda', 'columna', 'vertebras', 'vertebral'],
        ['lumbar', 'lumbosacra', 'lumbo', 'cintura'],
        ['cuello', 'cervical', 'nuca'],
        ['drogas', 'antidoping', 'doping', 'toxicologico'],
        ['chequeo', 'checkup', 'check', 'paquete', 'integral'],
        ['infeccion', 'infeccioso', 'bacterias', 'cultivo'],
        ['sida', 'vih', 'hiv'],
        ['papiloma', 'vph', 'hpv'],
        ['covid', 'coronavirus', 'sarscov2', 'influenza', 'gripe'],
        ['anemia', 'hierro', 'hemoglobina'],
        ['boda', 'matrimonio', 'prenupcial'],
        ['testiculo', 'testiculos', 'testicular', 'escrotal'],
        ['musculo', 'muscular', 'esqueletico', 'tendon', 'blandas'],
        ['ergometria', 'esfuerzo', 'ejercicio', 'caminadora']
    ];

    /* ------------------------------------------------------------------ */
    /* §7.1 Desambiguaciones                                               */
    /* ------------------------------------------------------------------ */

    // Cada regla: si la consulta cumple TODOS los grupos de `when` (basta un
    // token de cada grupo) y ninguno de `unless`, se ajusta la puntuación de
    // las claves listadas. Los números negativos empujan hacia abajo.
    var DISAMBIGUATION = [
        {
            note: 'PSA: sin "libre" manda el total; con "libre", el libre.',
            when: [['psa', 'antigeno', 'prostatico', 'prostata'], ['libre', 'fpsa', 'free']],
            keys: { 'PSA-LIBRE': 85, 'AG.P.': -35 }
        },
        {
            note: 'PSA a secas prioriza el total.',
            when: [['psa', 'ape']],
            unless: ['libre', 'fpsa', 'free'],
            keys: { 'AG.P.': 45 }
        },
        {
            note: 'Electro con esfuerzo/ergometría gana al electro simple.',
            when: [['esfuerzo', 'ejercicio', 'caminadora', 'ergometria', 'stress']],
            keys: { 'EKG-ESF': 85, 'EKG': -30 }
        },
        {
            note: 'Electro en reposo con lectura del cardiólogo.',
            when: [['reposo', 'interpretacion', 'cardiologo', 'cardiologica']],
            keys: { 'EKG/CARDIOLO': 85 }
        },
        {
            note: '"eco" + corazón es ecocardiograma, no ecografía.',
            when: [['eco', 'echo', 'ecografia', 'ultrasonido', 'usg'], ['corazon', 'cardiaco', 'cardiaca', 'cardio']],
            keys: { 'ECO': 90 }
        },
        {
            note: 'Rodillas comparativas requieren ambas/bilateral.',
            when: [['rodilla', 'rodillas'], ['ambas', 'bilateral', 'comparativas', 'comparativa', 'dos']],
            keys: { 'RODILLA-2': 85, 'RODILLA': -35 }
        },
        {
            note: 'Tórax y pelvis en dos proyecciones.',
            when: [['proyecciones', 'proyeccion', 'vistas', 'lat', 'lateral', 'pa'], ['2', 'dos', 'ambas']],
            keys: { 'TX-2ADUL': 70, 'PELV-2A': 70 }
        },
        {
            note: 'TAC con contraste vs simple.',
            when: [['contraste', 'contrastada', 'contrastado']],
            unless: ['sin', 'simple'],
            keys: { 'TAC-ABDSC': 85, 'TAC-ABDIC': -30 }
        },
        {
            note: 'TAC sin contraste / simple.',
            when: [['simple', 'sin']],
            unless: [],
            requiresModality: 'tac',
            keys: { 'TAC-ABDIC': 60, 'TAC.CRANS': 60, 'TAC-ABDSC': -40 }
        },
        {
            note: 'HbA1c es el azúcar de 3 meses, no la glucosa simple.',
            when: [['a1c', 'hba1c', 'glicosilada', 'glucosilada', 'glicada', 'glicohemoglobina', 'promedio', 'meses']],
            keys: { 'HD-G': 85, 'GLU.S': -25 }
        },
        {
            note: 'Embarazo cuantitativo = fracción beta.',
            when: [['cuantitativa', 'cuantitativo', 'niveles', 'beta', 'bhcg']],
            keys: { 'F.B.': 85, 'PIE': -25 }
        },
        {
            note: 'Embarazo en sangre/suero cualitativo.',
            when: [['embarazo', 'hcg', 'gch'], ['sangre', 'suero', 'cualitativa', 'cualitativo']],
            unless: ['cuantitativa', 'cuantitativo', 'niveles', 'orina'],
            keys: { 'PIE': 70 }
        },
        {
            note: 'Embarazo en orina / prueba casera.',
            when: [['embarazo', 'hcg', 'gch'], ['orina', 'casera', 'tira', 'farmacia']],
            keys: { 'PIE-O': 80, 'PIE': -25 }
        },
        {
            note: 'La clave PIE es embarazo; con rayos X se habla del pie.',
            when: [['pie', 'pies'], ['rx', 'rayos', 'rayosx', 'radiografia', 'placa']],
            keys: { 'PIE-ADULTO': 85, 'PIE': -100 }
        },
        {
            note: 'Resistencia a la insulina vs insulina sola.',
            when: [['resistencia', 'homa']],
            keys: { 'IR-HOMA': 85, 'INSULI': -25 }
        },
        {
            note: 'Tipo/grupo sanguíneo y factor Rh.',
            when: [['tipo', 'grupo', 'factor', 'rh'], ['sangre', 'sanguineo', 'sanguinea', 'rh', 'positivo', 'negativo']],
            keys: { 'GPORH': 90 }
        },
        {
            note: 'Mama: mamografía es rayos X; USG mamario es ultrasonido.',
            when: [['mama', 'mamas', 'seno', 'senos', 'mamario'], ['ultrasonido', 'usg', 'eco', 'ecografia']],
            keys: { 'USG-GM': 80, 'MASTO': -25 }
        },
        {
            note: 'Mama con mamografía/rayos X.',
            when: [['mamografia', 'mastografia', 'mamograma']],
            keys: { 'MASTO': 80 }
        },
        {
            note: 'Tiroides por imagen gana a las pruebas de sangre.',
            when: [['tiroides', 'tiroideo', 'tiroide'], ['ultrasonido', 'usg', 'eco', 'ecografia', 'nodulo', 'nodulos']],
            keys: { 'USG-TIRO': 85 }
        },
        {
            note: 'Perfil tiroideo completo.',
            when: [['tiroideo', 'tiroides', 'tiroide'], ['completo', 'amplio']],
            keys: { 'PTIR-3': 45 }
        },
        {
            note: 'Glucosa simple cuando no se pide el promedio de 3 meses.',
            when: [['glucosa', 'glucemia', 'azucar']],
            unless: ['a1c', 'hba1c', 'glicosilada', 'glucosilada', 'meses', 'promedio'],
            keys: { 'GLU.S': 45 }
        },
        {
            note: 'Coagulación genérica muestra TP y TPT.',
            when: [['coagulacion', 'coagular']],
            keys: { 'TP': 45, 'TPT': 45 }
        }
    ];

    /* ------------------------------------------------------------------ */
    /* §2 Normalización                                                    */
    /* ------------------------------------------------------------------ */

    // Minúsculas sin acentos conservando la longitud, para poder mapear
    // posiciones de vuelta al texto original al resaltar coincidencias.
    function fold(text) {
        var source = String(text == null ? '' : text).toLowerCase();
        var out = '';
        for (var i = 0; i < source.length; i++) {
            var folded = source[i].normalize('NFD')[0];
            out += folded === undefined ? source[i] : folded;
        }
        return out;
    }

    // §7.4 Plural del español, para tratar igual "riñón"/"riñones" y
    // "estudio"/"estudios".
    function stem(word) {
        if (word.length > 5 && /(es)$/.test(word)) return word.slice(0, -2);
        if (word.length > 3 && /[^s]s$/.test(word)) return word.slice(0, -1);
        return word;
    }

    function words(text) {
        return fold(text).split(/[^a-z0-9ñ+]+/).filter(Boolean);
    }

    // Palabras con su forma original y su forma plegada. fold() conserva la
    // longitud, así que los índices del texto plegado sirven en el original.
    function wordSpans(text) {
        var source = String(text == null ? '' : text);
        var folded = fold(source);
        var spans = [];
        var pattern = /[a-z0-9ñ+]+/g;
        var match;
        while ((match = pattern.exec(folded)) !== null) {
            spans.push({
                raw: source.slice(match.index, match.index + match[0].length),
                term: match[0]
            });
        }
        return spans;
    }

    function phraseOf(text) {
        return words(text).join(' ');
    }

    function levenshtein(a, b, max) {
        if (Math.abs(a.length - b.length) > max) return max + 1;
        var previous = [];
        var i;
        for (i = 0; i <= b.length; i++) previous[i] = i;
        for (i = 1; i <= a.length; i++) {
            var current = [i];
            var best = i;
            for (var j = 1; j <= b.length; j++) {
                current[j] = Math.min(
                    previous[j] + 1,
                    current[j - 1] + 1,
                    previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
                );
                if (current[j] < best) best = current[j];
            }
            if (best > max) return max + 1;
            previous = current;
        }
        return previous[b.length];
    }

    var SYNONYMS = (function () {
        var map = {};
        SYNONYM_GROUPS.forEach(function (group) {
            var folded = group.map(fold);
            folded.forEach(function (term) {
                map[term] = (map[term] || []).concat(folded.filter(function (other) {
                    return other !== term;
                }));
            });
        });
        return map;
    }());

    /* ------------------------------------------------------------------ */
    /* Tokens de la consulta                                               */
    /* ------------------------------------------------------------------ */

    function typoTable() {
        return global.BIOS_TYPOS || {};
    }

    function tokenize(query) {
        var raw = wordSpans(query);
        var useful = raw.filter(function (span) { return !STOP_WORDS[span.term]; });
        // Una letra suelta ("rayos x", "vitamina d") es ruido y volvería
        // imposible el modo estricto; un dígito suelto sí importa
        // ("perfil tiroideo 3", "química de 6").
        var solid = useful.filter(function (span) { return span.term.length > 1 || /[0-9]/.test(span.term); });
        var list = (solid.length ? solid : useful.length ? useful : raw).slice(0, 8);
        var typos = typoTable();

        return list.map(function (span) {
            var term = span.term;
            var root = stem(term);
            var variants = {};
            variants[term] = 1;
            variants[root] = 1;

            // §4 Erratas frecuentes: la forma correcta se busca igual que si
            // el paciente la hubiera escrito bien.
            var corrected = typos[term] || typos[root];
            if (corrected) {
                variants[corrected] = 1;
                variants[stem(corrected)] = 1;
            }

            var base = corrected || term;
            (SYNONYMS[base] || SYNONYMS[stem(base)] || SYNONYMS[term] || SYNONYMS[root] || []).forEach(function (synonym) {
                // Sin el guard, la raíz de un sinónimo ("mamas" -> "mama")
                // degradaría el término que el paciente sí escribió.
                if (!variants[synonym]) variants[synonym] = 2;
                if (!variants[stem(synonym)]) variants[stem(synonym)] = 2;
            });

            return {
                term: term,
                raw: span.raw,              // como lo escribió el paciente
                root: root,
                corrected: corrected || '',
                modality: MODALITY_OF_WORD[base] || MODALITY_OF_WORD[term] || '',
                soft: Boolean(SOFT_USG[term]),
                variants: Object.keys(variants).map(function (value) {
                    return { value: value, weight: variants[value] === 2 ? 0.55 : 1 };
                }),
                // §2.8 fuzzy: distancia 1 desde 5 caracteres, distancia 2
                // sólo desde 8. Nunca para T3, T4, TP, LH, RH, PSA, EGO…
                fuzzy: term.length >= 8 ? 2 : term.length >= 5 ? 1 : 0
            };
        });
    }

    /* ------------------------------------------------------------------ */
    /* Índice                                                              */
    /* ------------------------------------------------------------------ */

    function defaultAdapter(item) {
        return {
            key: item.c != null ? item.c : (item.key || ''),
            name: item.n != null ? item.n : (item.name || ''),
            aliases: item.kw || item.keywords || item.includes || [],
            tags: item.tags || [],
            typos: item.typos || [],
            category: item.catLabel || item.category || '',
            prep: item.prep || '',
            branches: item.branches || [],
            // Prioridad comercial. Va en rango corto a propósito: la posición
            // en el catálogo (`demand`) ya carga la popularidad, y un empujón
            // grande aquí haría que un paquete muy pedido le ganara al
            // estudio que el paciente nombró ("papan" -> Papanicolaou).
            boost: (item.top ? 6 : 0) + (item.alta ? 3 : 0) + (item.pack ? 2 : 0)
        };
    }

    function unique(list) {
        var seen = {};
        var out = [];
        list.forEach(function (value) {
            if (value.length < 2 || seen[value]) return;
            seen[value] = 1;
            out.push(value);
        });
        return out;
    }

    function createIndex(items, adapter) {
        var read = adapter || defaultAdapter;
        var total = (items || []).length;
        var docs = (items || []).map(function (item, position) {
            var fields = read(item);
            var aliases = (fields.aliases || []).map(phraseOf).filter(Boolean);
            var keyTokens = words(fields.key);
            var keyFull = keyTokens.join(' ');
            var name = phraseOf(fields.name);

            return {
                item: item,
                boost: fields.boost || 0,
                // El Excel "Top 100 estudios" viene ordenado por demanda, así
                // que la posición en el catálogo es un buen desempate cuando
                // varios estudios coinciden igual de bien ("tiroide" empata
                // perfiles, TSH, T3 y T4).
                demand: total ? 1 - position / total : 0,
                nameLength: name.length,
                name: name,
                key: fold(fields.key),
                keyFull: keyFull,
                keyTokens: keyTokens,
                // §7.1 Una clave de 2–4 caracteres sólo puede coincidir por
                // igualdad exacta, nunca por substring.
                shortKey: keyFull.replace(/\s/g, '').length <= 4,
                aliases: aliases,
                aliasText: aliases.join(' · '),
                tagSet: (fields.tags || []).map(fold),
                tagText: (fields.tags || []).map(fold).join(' · '),
                typoText: (fields.typos || []).map(fold).join(' · '),
                category: fold(fields.category),
                modality: DOC_MODALITY[fields.category] || '',
                prep: fold(fields.prep),
                branches: fold((fields.branches || []).join(' ')),
                // Vocabulario para el modo tolerante a errores y para las
                // sugerencias "¿quisiste decir...?". Separado porque un error
                // sobre el nombre pesa más que sobre un alias.
                nameVocabulary: unique(words(fields.name).concat(keyTokens)),
                aliasVocabulary: unique(
                    words(aliases.join(' '))
                        .concat(words((fields.typos || []).join(' ')))
                        .concat(words(fields.category))
                )
            };
        });
        return { docs: docs, items: items || [] };
    }

    /* ------------------------------------------------------------------ */
    /* Puntuación                                                          */
    /* ------------------------------------------------------------------ */

    // Coincidencia al inicio de una palabra: cubre también los prefijos de
    // §2.9 ("papan" encuentra "papanicolaou").
    function hasWordStart(haystack, needle) {
        var at = haystack.indexOf(needle);
        while (at !== -1) {
            if (at === 0 || !/[a-z0-9ñ]/.test(haystack[at - 1])) return true;
            at = haystack.indexOf(needle, at + 1);
        }
        return false;
    }

    // minLength evita el ruido a media palabra: sin él "sida" encontraría
    // "den(sida)d" y "nino" saldría en todo estudio "feme(nino)".
    function scoreField(haystack, needle, exactScore, startScore, insideScore, minLength) {
        if (!haystack || !needle) return 0;
        if (exactScore && haystack === needle) return exactScore;
        if (haystack.indexOf(needle) === -1) return 0;
        if (hasWordStart(haystack, needle)) return startScore;
        return needle.length >= (minLength || 0) ? insideScore : 0;
    }

    function scoreKey(doc, value) {
        if (!doc.keyFull) return 0;
        if (value === doc.keyFull || (doc.keyTokens.length === 1 && value === doc.keyTokens[0])) {
            return SCORE.keyExact;
        }
        if (doc.shortKey) return 0;              // §7.1 nada de substrings
        return doc.keyTokens.indexOf(value) !== -1 ? SCORE.keyToken : 0;
    }

    function fuzzyScore(vocabulary, token, ceiling) {
        var closest = 0;
        for (var i = 0; i < vocabulary.length; i++) {
            var word = vocabulary[i];
            if (Math.abs(word.length - token.term.length) > token.fuzzy) continue;
            var distance = levenshtein(token.term, word, token.fuzzy);
            if (distance <= token.fuzzy) {
                closest = Math.max(closest, ceiling * (1 - distance / (token.fuzzy + 1)));
                if (distance === 1) break;
            }
        }
        return closest;
    }

    function scoreToken(doc, token) {
        var best = 0;
        token.variants.forEach(function (variant) {
            var value = variant.value;
            if (value.length < 2 && !/[0-9]/.test(value)) return;
            var score = Math.max(
                scoreKey(doc, value),
                // El estudio cuyo nombre ABRE con lo escrito es mejor respuesta
                // que aquel que sólo lo menciona: "papan" es Papanicolaou
                // antes que "Colposcopia, Papanicolaou y C. Vaginal".
                doc.name.indexOf(value) === 0 && doc.name !== value
                    ? SCORE.namePrefix
                    : scoreField(doc.name, value, SCORE.nameExact, SCORE.nameStart, SCORE.nameInside, 5),
                scoreField(doc.aliasText, value, 0, SCORE.alias, SCORE.aliasInside, 5),
                scoreField(doc.typoText, value, 0, SCORE.typo, 0, 99),
                doc.tagSet.indexOf(value) !== -1 ? SCORE.tagExact
                    : scoreField(doc.tagText, value, 0, SCORE.tagStart, 0, 99),
                scoreField(doc.category, value, 0, SCORE.category, 0, 99),
                scoreField(doc.branches, value, 0, SCORE.branch, 0, 99),
                // La preparación es el campo más ruidoso: sólo cuenta para
                // términos largos, al inicio de palabra y escritos tal cual.
                variant.weight === 1 && value.length >= 5
                    ? scoreField(doc.prep, value, 0, SCORE.prep, 0, 99) : 0
            );
            best = Math.max(best, score * variant.weight);
        });

        // §3 "sólo modalidad genérica": que `ultrasonido` a secas siga
        // recuperando los ultrasonidos aunque no toque nombre ni alias.
        if (token.modality && doc.modality === token.modality) {
            best = Math.max(best, SCORE.modalityFloor);
        }

        if (best > 0 || !token.fuzzy) return best;

        // Nada coincidió literalmente: probamos tolerando errores de dedo.
        return Math.max(
            fuzzyScore(doc.nameVocabulary, token, SCORE.fuzzyName),
            fuzzyScore(doc.aliasVocabulary, token, SCORE.fuzzyAlias)
        );
    }

    /* ------------------------------------------------------------------ */
    /* §7.1 y §7.3 Contexto: modalidad y desambiguación                    */
    /* ------------------------------------------------------------------ */

    function queryContext(tokens, query) {
        var present = {};
        tokens.forEach(function (token) {
            present[token.term] = 1;
            present[token.root] = 1;
            if (token.corrected) present[token.corrected] = 1;
        });
        // Los números y palabras que tokenize descarta siguen importando para
        // las reglas ("2 proyecciones", "sin contraste").
        words(query).forEach(function (word) { present[word] = 1; });

        var modalities = {};
        var soft = false;
        tokens.forEach(function (token) {
            if (token.modality) modalities[token.modality] = 1;
            if (token.soft) soft = true;
        });

        return { has: present, modalities: modalities, soft: soft };
    }

    function contextScore(doc, context) {
        var score = 0;
        var asked = Object.keys(context.modalities);

        if (asked.length && doc.modality) {
            if (context.modalities[doc.modality]) score += BONUS.modalityMatch;
            // Conflicto de modalidad (§3): la misma zona en otra técnica.
            else score += BONUS.modalityClash;
        }
        if (context.soft && doc.modality === 'usg') score += BONUS.modalitySoft;

        var key = doc.item && (doc.item.c || doc.item.key);
        DISAMBIGUATION.forEach(function (rule) {
            if (rule.keys[key] === undefined) return;
            if (rule.requiresModality && !context.modalities[rule.requiresModality]) return;
            var satisfied = rule.when.every(function (group) {
                return group.some(function (word) { return context.has[word]; });
            });
            if (!satisfied) return;
            if (rule.unless && rule.unless.some(function (word) { return context.has[word]; })) return;
            score += rule.keys[key];
        });
        return score;
    }

    /* ------------------------------------------------------------------ */
    /* Búsqueda                                                            */
    /* ------------------------------------------------------------------ */

    function search(query, index, options) {
        var settings = options || {};
        var tokens = tokenize(query);
        var docs = (index && index.docs) || [];

        if (!tokens.length) {
            var all = docs.map(function (doc) { return { item: doc.item, score: doc.boost, matched: 0, doc: doc }; });
            return { results: sortResults(all), partial: false, tokens: [], total: all.length };
        }

        var context = queryContext(tokens, query);
        var phrase = phraseOf(query);
        var strict = [];
        var loose = [];

        docs.forEach(function (doc) {
            var total = 0;
            var matched = 0;
            var direct = 0;
            tokens.forEach(function (token) {
                var score = scoreToken(doc, token);
                if (score <= 0) return;
                matched++;
                total += score;
                if (score >= SCORE.alias) direct++;
            });

            var score = matched ? total / tokens.length : 0;
            var bonus = contextScore(doc, context);
            // Sin ninguna coincidencia propia, el contexto por sí solo no
            // debe inventar un resultado.
            if (!matched && bonus <= 0) return;

            score += bonus + doc.boost;

            // §3 frase completa: nombre oficial, alias directo o coloquial.
            if (phrase.length > 2) {
                if (doc.name === phrase) score += BONUS.phraseName;
                else if (doc.aliases.indexOf(phrase) !== -1) score += BONUS.phraseAlias;
                else if (hasWordStart(doc.aliasText, phrase)) score += BONUS.phraseInAlias;
                else if (hasWordStart(doc.name, phrase)) score += BONUS.phraseInName;
            }
            if (direct >= 2) score += BONUS.multiToken;
            // Desempates, en rangos pequeños para no tapar ninguna señal
            // real: primero el estudio más pedido, luego el nombre más corto
            // y directo.
            score += doc.demand * 14;
            score += Math.max(0, 6 - doc.nameLength / 12);

            if (score <= 0) return;

            var entry = { item: doc.item, score: score, matched: matched, doc: doc };
            if (matched === tokens.length) strict.push(entry);
            else if (matched > 0) loose.push(entry);
        });

        var partial = strict.length === 0 && loose.length > 0;
        var chosen = partial ? loose : strict;
        // Con varios términos, mostramos primero los que cumplen todos y
        // debajo los parciales, para no esconder resultados útiles.
        if (!partial && settings.includePartial && loose.length) {
            chosen = chosen.concat(sortResults(loose).map(function (result) {
                return { item: result.item, score: result.score - 1000, matched: result.matched };
            }));
        }

        return {
            results: sortResults(chosen, partial),
            partial: partial,
            tokens: tokens,
            total: chosen.length
        };
    }

    function sortResults(entries, byMatchCount) {
        return entries.slice().sort(function (a, b) {
            if (byMatchCount && b.matched !== a.matched) return b.matched - a.matched;
            if (b.score !== a.score) return b.score - a.score;
            var nameA = (a.doc && a.doc.name) || '';
            var nameB = (b.doc && b.doc.name) || '';
            return nameA.localeCompare(nameB, 'es');
        }).map(function (entry) {
            return { item: entry.item, score: entry.score, matched: entry.matched };
        });
    }

    /* ------------------------------------------------------------------ */
    /* Sugerencias y resaltado                                             */
    /* ------------------------------------------------------------------ */

    // "¿Quisiste decir…?" cuando la búsqueda no devuelve nada: buscamos las
    // palabras del catálogo más parecidas a lo que el paciente escribió.
    function suggest(query, index, limit) {
        var tokens = tokenize(query);
        var docs = (index && index.docs) || [];
        if (!tokens.length) return [];
        var scored = {};
        tokens.forEach(function (token) {
            var tolerance = Math.max(2, Math.ceil(token.term.length / 3));
            docs.forEach(function (doc) {
                doc.nameVocabulary.concat(doc.aliasVocabulary).forEach(function (word) {
                    if (Math.abs(word.length - token.term.length) > tolerance) return;
                    var distance = levenshtein(token.term, word, tolerance);
                    if (distance > tolerance) return;
                    var value = 1 / (1 + distance);
                    if (!scored[word] || scored[word] < value) scored[word] = value;
                });
            });
        });
        return Object.keys(scored)
            .sort(function (a, b) { return scored[b] - scored[a] || a.length - b.length; })
            .slice(0, limit || 4);
    }

    function escapeHtml(text) {
        return String(text == null ? '' : text).replace(/[&<>"']/g, function (character) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
        });
    }

    // Envuelve en <mark> los tramos que coinciden con la consulta. Trabaja
    // sobre el texto plegado (misma longitud que el original) para conservar
    // acentos y mayúsculas en pantalla.
    function highlight(text, tokens) {
        var source = String(text == null ? '' : text);
        if (!tokens || !tokens.length) return escapeHtml(source);
        var folded = fold(source);
        var ranges = [];

        tokens.forEach(function (token) {
            token.variants.forEach(function (variant) {
                if (variant.weight < 1 || variant.value.length < 3) return;
                var at = folded.indexOf(variant.value);
                while (at !== -1) {
                    ranges.push([at, at + variant.value.length]);
                    at = folded.indexOf(variant.value, at + variant.value.length);
                }
            });
        });
        if (!ranges.length) return escapeHtml(source);

        ranges.sort(function (a, b) { return a[0] - b[0]; });
        var merged = [ranges[0]];
        for (var i = 1; i < ranges.length; i++) {
            var last = merged[merged.length - 1];
            if (ranges[i][0] <= last[1]) last[1] = Math.max(last[1], ranges[i][1]);
            else merged.push(ranges[i]);
        }

        var html = '';
        var cursor = 0;
        merged.forEach(function (range) {
            html += escapeHtml(source.slice(cursor, range[0]));
            html += '<mark class="search-hit">' + escapeHtml(source.slice(range[0], range[1])) + '</mark>';
            cursor = range[1];
        });
        return html + escapeHtml(source.slice(cursor));
    }

    global.BiosSearch = {
        createIndex: createIndex,
        search: search,
        suggest: suggest,
        highlight: highlight,
        tokenize: tokenize,
        escapeHtml: escapeHtml,
        fold: fold
    };
}(window));
