/*
 * Casos de prueba del buscador — sección 10 del diccionario maestro
 * (estudios/diccionario-busqueda.md), más los casos de §7 y regresiones.
 *
 * Uso:  node tools/test_busqueda.js
 */
const path = require('path');
const root = path.join(__dirname, '..');
global.window = {};
require(path.join(root, 'assets/estudios-data.js'));
require(path.join(root, 'assets/search.js'));

const S = window.BiosSearch;
const index = S.createIndex(window.BIOS_ESTUDIOS);

// first:  nombre que debe quedar en el puesto 1
// top:    debe estar entre los primeros N (por omisión 3)
// has:    debe aparecer en cualquier posición
// absent: no debe aparecer
const CASES = [
    // §10 Casos de prueba mínimos
    { q: 'sangre', has: ['Grupo y Factor Rh'] },
    { q: 'tipo de sangre', first: 'Grupo y Factor Rh' },
    { q: 'que sangre soy', first: 'Grupo y Factor Rh' },
    { q: 'glicosilada', first: 'Hemoglobina Glucosilada' },
    { q: 'azucar 3 meses', first: 'Hemoglobina Glucosilada' },
    { q: 'azucar en sangre', first: 'Glucosa en Suero' },
    { q: 'tiroide', top: ['Perfil Tiroideo 1', '(TSH) Hormona Estimulante de Tiroides'], n: 6 },
    { q: 'eco tiroides', first: 'Ultrasonido Tiroideo' },
    { q: 'psa libre', first: 'Antigeno Prostatico Libre Clave 1473' },
    { q: 'prostata', top: ['Antigeno Especifico de Prostata Clave 1472'], n: 4 },
    { q: 'embaraso sangre', first: 'Prueba Inmuno de Embarazo en Suero' },
    { q: 'papanicolau', first: 'Papanicolaou' },
    { q: 'mamografia', first: 'Mastografia' },
    { q: 'ultrasonido seno', first: 'Ultrasonido Mamario Bilateral' },
    { q: 'eco corazon', first: 'Ecocardiograma' },
    { q: 'electro esfuerzo', first: 'Electrocardiograma con Esfuerzo' },
    { q: 'coagulacion', top: ['Tiempo de Protrombina Clave 2644', 'Tiempo de Tromboplastina Parcial Activada (TTP) Clave 0262'], n: 2 },
    { q: 'riñon', has: ['Creatinina en Suero', 'Nitrogeno Ureico en Suero (BUN)', 'Ultrasonido Renal'] },
    { q: 'uro cultivo', first: 'Urocultivo' },
    { q: 'pie rayos x', first: 'Pie AP. y LAT. (Adulto)', absent: ['Prueba Inmuno de Embarazo en Suero'] },
    { q: 'tac cabeza sin contraste', first: 'Tomografía de Cráneo Simple' },
    { q: 'tac abdomen con contraste', first: 'Tomografía de Abdomen Contrastada' },
    { q: 'rodillas comparativas', first: 'Rodillas Comparativas AP y LAT' },
    { q: 'anti hcv', first: 'Acs. Anti-hepatitis C Clave 1452' },
    { q: 'hbsag', first: 'Ag. de Superficie Hepatitis B (Hbs Ag) Clave 1470' },
    { q: 'hpv pcr', first: 'Vph-pcr Clave 2120' },

    // §7.1 Desambiguaciones
    { q: 'psa', first: 'Antigeno Especifico de Prostata Clave 1472' },
    { q: 'prueba de embarazo en orina', first: 'Prueba Inmuno de Embarazo en Orina' },
    { q: 'beta hcg cuantitativa', first: 'Fraccion Beta (Cuantificacion Hgc)' },
    { q: 'resistencia a la insulina', first: 'Indice de Resistencia Homa' },
    { q: 'insulina', first: 'Insulina' },
    { q: 'electro con interpretacion del cardiologo', first: 'Electrocardiograma en Reposo con Interpretacion Cardiologica' },
    { q: 'mastografia', first: 'Mastografia' },
    { q: 'ultrasonido de mama', first: 'Ultrasonido Mamario Bilateral' },
    { q: 'tele de torax pa y lat', first: 'Tele de Tórax Pa y LAT (Adulto)' },
    { q: 'pelvis 2 proyecciones', first: 'Pelvis 2 Proyecciones (Adulto)' },
    { q: 'rodilla', first: 'Rodilla AP. y LAT.' },

    // §2 Normalización, erratas y prefijos
    { q: 'papan', first: 'Papanicolaou' },
    { q: 'ultraso', top: ['Ultrasonido Renal', 'Ultrasonido Pélvico', 'Ultrasonido Tiroideo'], n: 14 },
    { q: 'kimica sanginea', top: ['Química Sanguínea de 6 Elementos'], n: 5 },
    { q: 'emoglobina', first: 'Hemoglobina Glucosilada' },
    { q: 'urocultibo', first: 'Urocultivo' },
    { q: 'colposopia', top: ['Colposcopia y Cultivo Vaginal', 'Colposcopia, Papanicolaou y C. Vaginal'], n: 2 },
    { q: 'prostota', top: ['Antigeno Especifico de Prostata Clave 1472'], n: 3 },
    { q: 'tovillo', top: ['Tobillo Derecho AP. y LAT. (Adulto)', 'Tobillo Izquierdo AP. y LAT. (Adulto)'], n: 2 },
    { q: 'riñones', has: ['Ultrasonido Renal'] },
    { q: 'ombro', top: ['Hombro AP (Adulto)'], n: 3 },

    // §5 Grupos semánticos
    { q: 'huesos', has: ['Densitometría Osea Columna/cadera', 'Rodilla AP. y LAT.'] },
    { q: 'ets', has: ['Acs. HIV (Sida) Clave 2136', 'Vph-pcr Clave 2120'] },
    { q: 'check up', has: ['Paquete de 38 elementos', 'Química Sanguínea de 6 Elementos'] },
    { q: 'niño', has: ['BHC de 1 a 6 Años.', 'BHC de 6 a 12 años'] },
    { q: 'fertilidad', has: ['(FSH) Hormona Folículo Estimulante', '(LH) Hormona Luteinizante'] },
    { q: 'heces', has: ['Coprologico', 'Sangre Oculta en Heces'] },
    { q: 'vision', first: 'Salud Visual' },
    { q: 'garganta', first: 'Cultivo Faringeo' },
    { q: 'osteoporosis', first: 'Densitometría Osea Columna/cadera' },
    { q: 'vesicula', first: 'Ultrasonido de Higado y Vias Biliares' },

    // Lenguaje coloquial y regresiones previas
    { q: 'ultrasonido mama', first: 'Ultrasonido Mamario Bilateral' },
    { q: 'azucar', top: ['Glucosa en Suero'], n: 3 },
    { q: 'sida', first: 'Acs. HIV (Sida) Clave 2136' },
    { q: 'covid', first: 'DUO SARSCOV2-INFLUENZA A+b' },
    { q: 'antidoping', top: ['Perfil Drogas de Abuso (1)', 'Perfil Drogas de Abuso (2)'], n: 2 },
    { q: 'perfil tiroideo 3', first: 'Perfil Tiroideo 3' },
    { q: 'columna lumbar', first: 'Columna Lumbo Sacra AP. y LAT. Adulto' },
    { q: 'rayos x rodilla', first: 'Rodilla AP. y LAT.' },
    { q: 'examen de la vista', first: 'Salud Visual' },
    { q: 'prenupcial', first: 'Examen Prenupcial (por Persona)' },
    { q: 'zzzqqq', empty: true },
];

let passed = 0;
const failures = [];

for (const testCase of CASES) {
    const found = S.search(testCase.q, index);
    const names = found.results.map(r => r.item.n);
    const problems = [];

    if (testCase.empty) {
        if (names.length) problems.push(`esperaba 0 resultados, hubo ${names.length}`);
    }
    if (testCase.first && names[0] !== testCase.first) {
        problems.push(`#1 esperado "${testCase.first}", obtuve "${names[0] || '(nada)'}"`);
    }
    for (const want of testCase.top || []) {
        const at = names.indexOf(want);
        const limit = testCase.n || 3;
        if (at === -1 || at >= limit) {
            problems.push(`"${want}" debía estar en el top ${limit}, está en ${at === -1 ? 'ninguna posición' : '#' + (at + 1)}`);
        }
    }
    for (const want of testCase.has || []) {
        if (!names.includes(want)) problems.push(`falta "${want}"`);
    }
    for (const avoid of testCase.absent || []) {
        if (names.includes(avoid)) problems.push(`no debía aparecer "${avoid}" (está en #${names.indexOf(avoid) + 1})`);
    }

    if (problems.length) {
        failures.push({ q: testCase.q, problems, got: names.slice(0, 5) });
    } else {
        passed++;
    }
}

console.log(`${passed}/${CASES.length} casos correctos\n`);
for (const failure of failures) {
    console.log(`✗ "${failure.q}"`);
    failure.problems.forEach(p => console.log(`    ${p}`));
    console.log(`    top 5: ${failure.got.join(' | ') || '(vacío)'}`);
}
process.exit(failures.length ? 1 : 0);
