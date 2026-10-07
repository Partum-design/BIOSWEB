// Buscador difuso BIOS: tolera faltas de ortografía, acentos, errores de dedo
// y palabras coloquiales ("azucar" → glucosa, "placa de pulmon" → tele de tórax).
(() => {
    const STOPWORDS = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'en', 'y', 'o', 'a', 'para', 'por', 'con', 'un', 'una', 'unos', 'unas', 'al', 'mi', 'me', 'quiero', 'busco', 'necesito', 'hacer', 'hacerme', 'estudio', 'estudios', 'prueba', 'pruebas', 'analisis', 'examen', 'que', 'cuanto', 'cuesta', 'precio']);

    // Cada regla agrega palabras clave a los estudios cuyo código/nombre coincida.
    const SYNONYM_RULES = [
        [/orina|\bego\b|urocul|albumina/, 'orina ego urinario urianalisis pipi pis'],
        [/\bbhc|biometria/, 'biometria hematica bhc sangre hemograma citometria plaquetas leucocitos globulos anemia hemoglobina'],
        [/glucosa|quimica sanguinea|bioquimico|check/, 'glucosa azucar diabetes glicemia glucemia'],
        [/glucosa en suero/, 'azucar glucemia glicemia diabetes', 0.95],
        [/glucosilada/, 'glucosilada hba1c a1c diabetes azucar glucosa hemoglobina'],
        [/insulina|homa/, 'insulina resistencia diabetes prediabetes azucar'],
        [/quimica sanguinea|bioquimico|check/, 'quimica sanguinea colesterol trigliceridos lipidos grasas urea creatinina acido urico'],
        [/check/, 'chequeo checkup general completo paquete rutina anual preventivo'],
        [/tiroid|\btsh\b|\bt3\b|\bt4\b|tiroxina|triyodo/, 'tiroides tiroideo tsh t3 t4 hipotiroidismo hipertiroidismo'],
        [/prostat|\bag p\b|\bpsa\b/, 'prostata psa antigeno prostatico'],
        [/embarazo|fraccion beta|hgc|obstetric|prenatal/, 'embarazo embarazada gestacion beta hcg hgc'],
        [/torax/, 'torax pecho pulmon pulmones placa radiografia'],
        [/ultrasonido|\busg\b/, 'ultrasonido eco ecografia usg sonografia'],
        [/tomografia|\btac\b/, 'tomografia tac scanner tc'],
        [/mastograf|mamari/, 'mama mamas senos seno pecho mastografia mamografia'],
        [/colpo|papanicolaou|vaginal|\bpaps\b/, 'papanicolaou papa pap citologia ginecologico ginecologia vaginal cervix mujer'],
        [/vph/, 'vph virus papiloma humano'],
        [/\bhiv\b/, 'vih hiv sida'],
        [/hepatitis/, 'hepatitis higado'],
        [/higado/, 'higado hepatico vesicula biliar'],
        [/renal|creatinina|nitrogeno|\bbun\b|albumina/, 'rinon rinones renal'],
        [/cardio|\bekg\b/, 'corazon cardiaco cardiologia ecg ekg electro'],
        [/ecocardio/, 'eco corazon cardiaco'],
        [/densitometria/, 'huesos hueso osteoporosis densidad osea'],
        [/coprolog|heces/, 'heces popo excremento fecal materia coproparasitoscopico parasitos'],
        [/cultivo|urocul/, 'cultivo infeccion bacterias'],
        [/faringeo/, 'garganta faringe anginas'],
        [/sars|influenza|\bcov\b/, 'covid coronavirus gripa gripe influenza'],
        [/drogas/, 'antidoping doping drogas toxicologico'],
        [/hormon|\bfsh\b|\blh\b|testosterona|foliculo|luteinizante/, 'hormonas hormonal fertilidad'],
        [/testosterona|masculino|prostat|testicular/, 'hombre hombres masculino varon'],
        [/femenino|ginecolog|vaginal|transvaginal|mastograf|mamari|papanicolaou|colpo|obstetric|prenatal/, 'mujer mujeres femenino dama'],
        [/vitamina/, 'vitamina vitaminas'],
        [/febriles/, 'tifoidea salmonela brucela fiebre febriles'],
        [/vdrl/, 'sifilis venereas ets vdrl'],
        [/prenupcial/, 'boda matrimonio casarse prenupcial'],
        [/grupo y factor/, 'tipo de sangre grupo sanguineo rh'],
        [/protrombina|tromboplastina/, 'coagulacion tiempos tp tpt'],
        [/\bcpk\b/, 'musculo cpk'],
        [/rodilla|tobillo|hombro|mano|\bpie\b|pierna|pelvis|columna|abdomen simple/, 'radiografia placa rx rayos x hueso fractura'],
        [/salud visual/, 'vista ojos lentes optometria'],
        [/pelvico|transvaginal/, 'utero ovarios matriz'],
        [/testicular/, 'testiculos'],
        [/abdom/, 'abdomen panza estomago barriga'],
        [/columna/, 'espalda'],
    ];

    function normalize(text) {
        return String(text || '')
            .toLowerCase()
            .normalize('NFD').replace(/[̀-ͯ]/g, '')
            .replace(/ñ/g, 'n')
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();
    }

    function tokenize(text) {
        return normalize(text).split(' ').filter(Boolean);
    }

    // Clave fonética en español: une letras que suenan igual (b/v, s/z/c, ll/y, h muda...).
    function phonetic(word) {
        return word
            .replace(/ch/g, '#')
            .replace(/h/g, '')
            .replace(/#/g, 'ch')
            .replace(/qu([ei])/g, 'k$1')
            .replace(/c([ei])/g, 's$1')
            .replace(/g([ei])/g, 'j$1')
            .replace(/gu([ei])/g, 'g$1')
            .replace(/c/g, 'k')
            .replace(/q/g, 'k')
            .replace(/v/g, 'b')
            .replace(/z/g, 's')
            .replace(/x/g, 'ks')
            .replace(/ll/g, 'y')
            .replace(/y$/g, 'i')
            .replace(/w/g, 'u')
            .replace(/(.)\1+/g, '$1');
    }

    // Distancia Damerau-Levenshtein (transposiciones cuentan como 1 error).
    function editDistance(a, b, max) {
        if (Math.abs(a.length - b.length) > max) return max + 1;
        const rows = a.length + 1;
        const cols = b.length + 1;
        const d = [];
        for (let i = 0; i < rows; i++) { d[i] = [i]; }
        for (let j = 1; j < cols; j++) d[0][j] = j;
        for (let i = 1; i < rows; i++) {
            let rowMin = Infinity;
            for (let j = 1; j < cols; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
                if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
                    d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
                }
                rowMin = Math.min(rowMin, d[i][j]);
            }
            if (rowMin > max) return max + 1;
        }
        return d[a.length][b.length];
    }

    function allowedErrors(length) {
        if (length <= 3) return 0;
        if (length <= 5) return 1;
        if (length <= 8) return 2;
        return 3;
    }

    function tokenScore(q, qPhon, entry) {
        const t = entry.token;
        if (t === q) return 1;
        const isNumber = /^\d+$/.test(q);
        if (isNumber) return t.startsWith(q) && q.length >= 2 ? 0.8 : 0;
        if (q.length === 1) return 0;
        if (t.startsWith(q)) return q.length >= 3 ? 0.92 : 0.7;
        if (entry.phon === qPhon) return 0.9;
        if (qPhon.length >= 3 && entry.phon.startsWith(qPhon)) return 0.82;
        const max = allowedErrors(q.length);
        if (max > 0) {
            const full = editDistance(q, t, max);
            if (full <= max) return 0.85 - full * 0.12;
            // Palabra a medio escribir con error: compara contra el inicio del término.
            if (t.length > q.length) {
                const partial = editDistance(q, t.slice(0, q.length), max);
                if (partial <= max) return 0.74 - partial * 0.12;
            }
            const phonDist = editDistance(qPhon, entry.phon, max);
            if (phonDist <= max) return 0.78 - phonDist * 0.12;
        }
        if (q.length >= 4 && t.includes(q)) return 0.65;
        return 0;
    }

    function createIndex(items, getFields) {
        return items.map(item => {
            const fields = getFields(item);
            const base = normalize(fields.filter(f => (f.weight ?? 1) >= 0.7).map(f => f.text).join(' '));
            const tokens = new Map();
            const addTokens = (text, weight) => {
                tokenize(text).forEach(token => {
                    if (STOPWORDS.has(token) && token.length > 1) return;
                    const prev = tokens.get(token);
                    if (!prev || prev.weight < weight) tokens.set(token, { token, phon: phonetic(token), weight });
                });
            };
            fields.forEach(f => addTokens(f.text, f.weight ?? 1));
            SYNONYM_RULES.forEach(([pattern, words, weight]) => {
                if (pattern.test(base)) addTokens(words, weight ?? 0.88);
            });
            const primary = normalize(fields.filter(f => (f.weight ?? 1) >= 1).map(f => f.text).join(' '));
            return { item, entries: [...tokens.values()], primary, size: (fields[0]?.text || '').length };
        });
    }

    function search(index, query, options = {}) {
        const minScore = options.minScore ?? 0.5;
        const allTerms = tokenize(query);
        let terms = allTerms.filter(t => !STOPWORDS.has(t));
        if (!terms.length) terms = allTerms;
        if (!terms.length) return [];
        const phons = terms.map(phonetic);
        const phrase = normalize(query);

        const results = [];
        index.forEach(doc => {
            let total = 0;
            let matched = 0;
            let exactHits = 0;
            terms.forEach((q, i) => {
                let best = 0;
                for (const entry of doc.entries) {
                    const s = tokenScore(q, phons[i], entry) * entry.weight;
                    if (s > best) best = s;
                    if (best >= 1) break;
                }
                if (best >= 0.45) matched++;
                if (best >= 0.88) exactHits++;
                total += best;
            });
            let score = total / terms.length;
            // Penaliza si no coinciden todas las palabras de la búsqueda.
            if (matched < terms.length) score *= matched / terms.length;
            if (phrase.length >= 3 && doc.primary.includes(phrase)) score += 0.35;
            else if (phrase.length >= 3 && doc.primary.startsWith(phrase.slice(0, 3))) score += 0.05;
            if (score >= minScore) {
                results.push({ item: doc.item, score, exact: exactHits === terms.length, size: doc.size });
            }
        });
        if (!results.length) return results;
        // Con coincidencias fuertes, descarta las que quedan muy por debajo (ruido).
        const top = Math.max(...results.map(r => r.score));
        return results
            .filter(r => r.score >= top * 0.6)
            .sort((a, b) => (Math.abs(b.score - a.score) > 0.02 ? b.score - a.score : a.size - b.size));
    }

    // Sugerencia "¿Quisiste decir...?": el término del índice más parecido a cada palabra.
    function suggest(index, query) {
        const terms = tokenize(query).filter(t => !STOPWORDS.has(t) && t.length >= 3);
        if (!terms.length) return '';
        const words = terms.map(q => {
            const qPhon = phonetic(q);
            let best = { token: q, score: 0 };
            index.forEach(doc => doc.entries.forEach(entry => {
                if (entry.weight < 0.88 || entry.token.length < 3) return;
                const s = tokenScore(q, qPhon, entry);
                if (s > best.score) best = { token: entry.token, score: s };
            }));
            return best.score >= 0.5 ? best.token : q;
        });
        const suggestion = words.join(' ');
        return suggestion !== terms.join(' ') ? suggestion : '';
    }

    // Índice listo para el catálogo BIOS (window.BIOS_ESTUDIOS).
    let catalogIndex = null;
    let catalogSource = null;
    function catalog() {
        const data = window.BIOS_ESTUDIOS || [];
        if (catalogIndex && catalogSource === data) return catalogIndex;
        catalogSource = data;
        catalogIndex = createIndex(data, item => [
            { text: item.n, weight: 1 },
            { text: item.c, weight: 0.97 },
            { text: item.catLabel, weight: 0.9 },
            { text: item.prep, weight: 0.6 },
        ]);
        return catalogIndex;
    }

    window.BiosSearch = {
        normalize,
        createIndex,
        search,
        suggest,
        searchCatalog: (query, options) => search(catalog(), query, options),
        suggestCatalog: query => suggest(catalog(), query),
    };
})();
