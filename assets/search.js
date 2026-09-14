/*
 * BiosSearch — buscador de estudios y servicios de Laboratorios BIOS.
 *
 * Qué resuelve:
 *   · Varios términos a la vez ("ultrasonido mama", "perfil tiroides t4").
 *     Todos los términos deben coincidir (AND); si nada coincide con todos,
 *     cae a coincidencia parcial (OR) para no dejar al paciente sin nada.
 *   · Acentos, mayúsculas y plurales: "mastografia" = "Mastografía",
 *     "riñones" = "riñón", "estudios" = "estudio".
 *   · Lenguaje de paciente: "azúcar" encuentra glucosa, "seno" encuentra
 *     mastografía, "sida" encuentra HIV. Ver SYNONYM_GROUPS.
 *   · Errores de dedo: "papanicolau", "colesteról", "ultrasonio".
 *   · Ranking por relevancia: la clave exacta gana, luego el nombre, luego
 *     los sinónimos del catálogo y al final la preparación.
 *
 * API:
 *   const index = BiosSearch.createIndex(items);
 *   const { results, partial, tokens } = BiosSearch.search(query, index);
 *   BiosSearch.highlight(texto, tokens);       // -> HTML con <mark>
 *   BiosSearch.suggest(query, index, 4);       // -> ["Papanicolaou", ...]
 */
(function (global) {
    'use strict';

    var STOP_WORDS = {
        de: 1, del: 1, la: 1, el: 1, los: 1, las: 1, un: 1, una: 1, unos: 1, unas: 1,
        y: 1, o: 1, en: 1, para: 1, con: 1, sin: 1, al: 1, por: 1, mi: 1, me: 1,
        se: 1, que: 1, es: 1, a: 1, su: 1, sus: 1, lo: 1, le: 1, tu: 1
    };

    // Cada grupo es un conjunto de términos equivalentes: escribir cualquiera
    // de ellos también busca los demás (con menor peso que la coincidencia
    // directa, para que el orden de resultados siga teniendo sentido).
    var SYNONYM_GROUPS = [
        ['tiroides', 'tiroideo', 'tsh', 't3', 't4', 'tiroxina', 'triyodotironina'],
        ['azucar', 'glucosa', 'diabetes', 'glucemia', 'glucosilada', 'hba1c', 'diabetico'],
        ['colesterol', 'trigliceridos', 'lipidos', 'lipidico', 'grasa'],
        ['embarazo', 'embarazada', 'gestacion', 'prenatal', 'obstetrico', 'hcg', 'hgc', 'gravidez'],
        ['prostata', 'prostatico', 'psa', 'antigeno'],
        ['ultrasonido', 'usg', 'eco', 'ecografia', 'sonograma', 'ecosonograma'],
        ['radiografia', 'rayos', 'rx', 'placa', 'tele'],
        ['tomografia', 'tac', 'ct', 'escaner'],
        ['mama', 'mamas', 'seno', 'senos', 'busto', 'mastografia', 'mamografia', 'mamario'],
        ['pecho', 'costillas'],
        ['corazon', 'cardiaco', 'cardiologico', 'ekg', 'ecg', 'electrocardiograma', 'ecocardiograma', 'electro'],
        ['riñon', 'renal', 'creatinina', 'urea', 'nitrogeno', 'nefro'],
        ['higado', 'hepatico', 'hepatitis', 'biliar', 'biliares'],
        ['sangre', 'sanguinea', 'hematica', 'hemograma', 'biometria', 'bhc', 'hematologia'],
        ['orina', 'urinario', 'urinarias', 'ego', 'urocultivo', 'uro', 'miccion'],
        ['heces', 'excremento', 'popo', 'fecal', 'coprologico', 'coproparasitoscopico', 'parasitos'],
        ['papanicolaou', 'papanicolau', 'pap', 'paps', 'citologia', 'cervical'],
        ['colposcopia', 'colposcopía', 'colpo', 'cuello', 'uterino', 'matriz'],
        ['vih', 'hiv', 'sida'],
        ['covid', 'coronavirus', 'sarscov2', 'sars', 'influenza', 'gripe'],
        ['vph', 'hpv', 'papiloma', 'verrugas'],
        ['anemia', 'hierro', 'ferritina', 'hemoglobina'],
        ['niño', 'niña', 'niños', 'bebe', 'pediatrico', 'infantil', 'escolar'],
        ['hueso', 'huesos', 'oseo', 'osea', 'osteoporosis', 'densitometria', 'dexa'],
        ['vista', 'visual', 'ojo', 'ojos', 'lentes', 'vision', 'optometria'],
        ['drogas', 'antidoping', 'doping', 'toxicologico', 'abuso'],
        ['hormonas', 'hormonal', 'fsh', 'lh', 'estradiol', 'progesterona', 'prolactina', 'testosterona'],
        ['fertilidad', 'ovulacion', 'menopausia', 'ginecologico'],
        ['chequeo', 'checkup', 'check', 'paquete', 'integral'],
        ['coagulacion', 'protrombina', 'tromboplastina', 'anticoagulante'],
        ['tiempo', 'entrega', 'urgente'],
        ['pulmon', 'pulmones', 'torax', 'respiratorio', 'tos'],
        ['espalda', 'columna', 'vertebras', 'vertebral'],
        ['lumbar', 'lumbosacra', 'lumbo', 'cintura'],
        ['cuello', 'cervical', 'nuca'],
        ['cabeza', 'craneo', 'cerebral', 'cerebro', 'migraña'],
        ['articulacion', 'articulaciones', 'coyuntura'],
        ['musculo', 'muscular', 'esqueletico', 'tendon', 'blandas'],
        ['testiculo', 'testiculos', 'testicular', 'escrotal'],
        ['tiroiditis', 'bocio', 'nodulo'],
        ['infeccion', 'infeccioso', 'bacterias', 'cultivo'],
        ['garganta', 'faringeo', 'faringe', 'anginas', 'amigdalas'],
        ['vitamina', 'vitaminas', 'deficiencia'],
        ['insulina', 'resistencia', 'homa', 'prediabetes'],
        ['boda', 'matrimonio', 'prenupcial'],
        ['hombre', 'masculino', 'varon'],
        ['mujer', 'femenino', 'femenina', 'dama'],
        ['abdomen', 'abdominal', 'panza', 'estomago', 'vientre'],
        ['pelvis', 'pelvico', 'pelvica', 'transvaginal', 'vaginal', 'utero', 'ovarios']
    ];

    var SYNONYMS = (function () {
        var map = {};
        SYNONYM_GROUPS.forEach(function (group) {
            group.forEach(function (term) {
                var key = fold(term);
                map[key] = (map[key] || []).concat(group.map(fold).filter(function (other) {
                    return other !== key;
                }));
            });
        });
        return map;
    }());

    /* ------------------------------------------------------------------ */
    /* Normalización                                                       */
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

    // Quita el plural más común del español para que "estudios" y "estudio",
    // o "riñones" y "riñon", se traten igual.
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

    /* ------------------------------------------------------------------ */
    /* Tokens de la consulta                                               */
    /* ------------------------------------------------------------------ */

    function tokenize(query) {
        var raw = wordSpans(query);
        var useful = raw.filter(function (span) { return !STOP_WORDS[span.term]; });
        // Una letra suelta ("rayos x", "vitamina d") es ruido y volvería
        // imposible el modo estricto; un dígito suelto sí importa
        // ("perfil tiroideo 3", "química de 6").
        var solid = useful.filter(function (span) { return span.term.length > 1 || /[0-9]/.test(span.term); });
        var list = (solid.length ? solid : useful.length ? useful : raw).slice(0, 8);
        return list.map(function (span) {
            var term = span.term;
            var root = stem(term);
            var variants = {};
            variants[term] = 1;
            variants[root] = 1;
            (SYNONYMS[term] || SYNONYMS[root] || []).forEach(function (synonym) {
                // Sin el guard, la raíz de un sinónimo ("mamas" -> "mama")
                // degradaría el término que el paciente sí escribió.
                if (!variants[synonym]) variants[synonym] = 2;   // 2 = por sinónimo
                if (!variants[stem(synonym)]) variants[stem(synonym)] = 2;
            });
            return {
                term: term,
                raw: span.raw,          // como lo escribió el paciente
                root: root,
                variants: Object.keys(variants).map(function (value) {
                    return { value: value, weight: variants[value] === 2 ? 0.55 : 1 };
                }),
                // Tolerancia a errores de dedo según qué tan larga sea la palabra.
                fuzzy: term.length >= 7 ? 2 : term.length >= 4 ? 1 : 0
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
            keywords: item.kw || item.keywords || item.includes || [],
            category: item.catLabel || item.category || '',
            prep: item.prep || '',
            branches: item.branches || [],
            boost: (item.top ? 12 : 0) + (item.alta ? 6 : 0) + (item.pack ? 4 : 0)
        };
    }

    function createIndex(items, adapter) {
        var read = adapter || defaultAdapter;
        var docs = (items || []).map(function (item) {
            var fields = read(item);
            var name = fold(fields.name);
            var key = fold(fields.key);
            var keywords = fold((fields.keywords || []).join(' · '));
            var category = fold(fields.category);
            var prep = fold(fields.prep);
            var branches = fold((fields.branches || []).join(' '));
            return {
                item: item,
                boost: fields.boost || 0,
                nameLength: name.length,
                name: name,
                key: key,
                keywords: keywords,
                category: category,
                prep: prep,
                branches: branches,
                // Vocabulario del documento: sirve para el modo tolerante a
                // errores y para las sugerencias "¿quisiste decir...?".
                // Se separa el del nombre para que "ultrasonio" pese más en
                // "Ultrasonido Renal" que en un estudio que solo lo menciona.
                nameVocabulary: unique(words(fields.name).concat(words(fields.key))),
                keywordVocabulary: unique(
                    words((fields.keywords || []).join(' ')).concat(words(fields.category))
                )
            };
        });
        return { docs: docs, items: items || [] };
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

    /* ------------------------------------------------------------------ */
    /* Puntuación                                                          */
    /* ------------------------------------------------------------------ */

    // Coincidencia al inicio de una palabra ("mama" dentro de "mamario"),
    // que vale más que una coincidencia a media palabra.
    function hasWordStart(haystack, needle) {
        var at = haystack.indexOf(needle);
        while (at !== -1) {
            if (at === 0 || !/[a-z0-9ñ]/.test(haystack[at - 1])) return true;
            at = haystack.indexOf(needle, at + 1);
        }
        return false;
    }

    // minLength evita el ruido a media palabra: sin él "sida" encontraría
    // "den(sida)d" y "bebe" saldría en todo estudio cuyo ayuno dice "beber".
    function scoreField(haystack, needle, exactScore, startScore, containsScore, minLength) {
        if (!haystack || !needle) return 0;
        if (exactScore && haystack === needle) return exactScore;
        if (haystack.indexOf(needle) === -1) return 0;
        if (hasWordStart(haystack, needle)) return startScore;
        return needle.length >= (minLength || 0) ? containsScore : 0;
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
                scoreField(doc.key, value, 130, 72, 40, 4),
                scoreField(doc.name, value, 115, 70, 42, 5),
                scoreField(doc.keywords, value, 0, 38, 24, 5),
                scoreField(doc.category, value, 0, 22, 14, 5),
                scoreField(doc.branches, value, 0, 16, 0, 99),
                // La preparación es el campo más ruidoso: solo cuenta para
                // términos largos, pegados al inicio de palabra ("ayuno") y
                // escritos tal cual — nunca por sinónimo.
                variant.weight === 1 && value.length >= 5 ? scoreField(doc.prep, value, 0, 9, 0, 99) : 0
            );
            best = Math.max(best, score * variant.weight);
        });
        if (best > 0 || !token.fuzzy) return best;

        // Nada coincidió literalmente: probamos tolerando errores de dedo.
        return Math.max(
            fuzzyScore(doc.nameVocabulary, token, 58),
            fuzzyScore(doc.keywordVocabulary, token, 30)
        );
    }

    function search(query, index, options) {
        var settings = options || {};
        var tokens = tokenize(query);
        var docs = (index && index.docs) || [];

        if (!tokens.length) {
            var all = docs.map(function (doc) { return { item: doc.item, score: doc.boost, matched: 0 }; });
            return { results: sortResults(all, docs), partial: false, tokens: [], total: all.length };
        }

        var phrase = fold(String(query || '').trim()).replace(/\s+/g, ' ');
        var strict = [];
        var loose = [];

        docs.forEach(function (doc) {
            var total = 0;
            var matched = 0;
            tokens.forEach(function (token) {
                var score = scoreToken(doc, token);
                if (score > 0) {
                    matched++;
                    total += score;
                }
            });
            if (!matched) return;

            var score = total / tokens.length + doc.boost;
            if (phrase.length > 2 && hasWordStart(doc.name, phrase)) score += 55;
            if (phrase.length > 2 && doc.name.indexOf(phrase) === 0) score += 25;
            // Entre dos nombres que coinciden, gana el más corto y directo.
            score += Math.max(0, 24 - doc.nameLength / 3);

            var entry = { item: doc.item, score: score, matched: matched, doc: doc };
            if (matched === tokens.length) strict.push(entry);
            else loose.push(entry);
        });

        var partial = strict.length === 0 && loose.length > 0;
        var chosen = partial ? loose : strict;
        // Con varios términos, mostramos primero los que cumplen todos y
        // debajo los parciales, para no esconder resultados útiles.
        if (!partial && settings.includePartial && loose.length) {
            chosen = chosen.concat(sortResults(loose, docs).map(function (result) {
                return { item: result.item, score: result.score - 1000, matched: result.matched };
            }));
        }

        return {
            results: sortResults(chosen, docs, partial),
            partial: partial,
            tokens: tokens,
            total: chosen.length
        };
    }

    function sortResults(entries, docs, byMatchCount) {
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
                doc.nameVocabulary.concat(doc.keywordVocabulary).forEach(function (word) {
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
