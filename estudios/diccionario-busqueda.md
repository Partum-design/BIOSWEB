# Diccionario maestro de búsqueda para estudios médicos

> Generado a partir de `Top 100 estudios.xlsx` (103 registros). Diseñado para que Claude implemente un buscador tolerante a sinónimos, lenguaje coloquial, abreviaturas, términos relacionados y errores de escritura, sin alterar los nombres, claves, precios ni contenido clínico del catálogo.

## 1. Objetivo

El buscador debe encontrar un estudio aunque el usuario no escriba el nombre oficial. Ejemplos:

- `tipo de sangre`, `grupo de sangre`, `qué sangre soy`, `RH`, `sangre` → debe poder descubrir **Grupo y Factor Rh**, con mayor puntuación cuando la intención sea claramente tipo/grupo sanguíneo.
- `azúcar 3 meses`, `A1c`, `glicosilada` → **Hemoglobina Glucosilada**.
- `eco de corazón` → **Ecocardiograma**; `eco de abdomen` → **Ultrasonido Abdominal**.
- `papanicolau`, `papanicolao` → **Papanicolaou**.
- `TAC cabeza sin contraste` → **Tomografía de Cráneo Simple**.

La búsqueda debe ser de **recuperación y ranking**, no de igualdad literal.

## 2. Normalización obligatoria antes de buscar

Aplicar a consulta y catálogo:

1. Convertir a minúsculas.
2. Quitar acentos/diacríticos: `próstata` = `prostata`, `química` = `quimica`.
3. Convertir `ñ` a `n` sólo para el índice auxiliar, conservando el texto visible original.
4. Quitar puntuación no significativa y unificar `/`, `-`, `.`, `,` y espacios.
5. Colapsar espacios repetidos.
6. Normalizar equivalencias: `rayos x`=`rx`; `ultrasonido`=`usg`=`ecografia`=`eco` cuando exista contexto anatómico; `tomografia`=`tac`=`tc`=`ct`.
7. No usar substring para claves cortas. Las claves/códigos se comparan por **token o igualdad exacta**. Ejemplo crítico: la clave `PIE` de embarazo no debe activarse por la palabra `pie` de la extremidad.
8. Para tokens de 5+ caracteres, permitir fuzzy matching: distancia de edición 1; distancia 2 sólo para palabras de 8+ caracteres. No aplicar fuzzy a `T3`, `T4`, `TP`, `LH`, `RH`, `PSA`, etc.
9. Opcional pero recomendable: prefijos sólo desde 4 caracteres (`papan` → `papanicolaou`, `ultra` → `ultrasonido`).

## 3. Ranking recomendado

| Regla | Puntos sugeridos |
|---|---:|
| Clave exacta completa | +120 |
| Nombre oficial exacto | +110 |
| Alias directo / abreviatura inequívoca | +95 |
| Coincidencia de 2+ tokens directos | +85 |
| Coincidencia fuzzy de alias directo | +75 |
| Frase coloquial/intención directa | +70 |
| Término relacionado / grupo semántico | +35 |
| Sólo modalidad genérica (`laboratorio`, `ultrasonido`, `rx`) | +10 |
| Conflicto de modalidad o desambiguación | -40 a -100 |

**Regla clave:** un término amplio como `sangre`, `riñón`, `tiroides` o `embarazo` puede devolver varios estudios. Ordenar por especificidad de los demás tokens de la consulta.

## 4. Reglas globales de errores de escritura

Además del fuzzy matching, considerar estas equivalencias frecuentes antes de puntuar:

- `quimica` ⇄ `kimica`, `qimica`, `quimka`
- `sanguinea` ⇄ `sanginea`, `sanguinia`, `sanguina`
- `biometria` ⇄ `biometia`, `biometriaa`, `biometria`
- `hematica` ⇄ `ematica`, `hematika`, `hemática`
- `hemoglobina` ⇄ `emoglobina`, `hemoglovina`
- `glucosilada` ⇄ `glucosilada`, `glicosilada`, `glucosilada`, `glicocilada`
- `ultrasonido` ⇄ `ultra sonido`, `ultrason`, `ultrasonio`, `ultrasonido`
- `radiografia` ⇄ `radiografia`, `radiogrfia`, `radiografiaa`, `rayosx`
- `tomografia` ⇄ `tomografia`, `tomogrfia`, `tomografiaa`
- `tiroides` ⇄ `tiroide`, `tiroides`, `tiroidis`
- `prostata` ⇄ `prostota`, `prostrata`, `prostata`
- `urocultivo` ⇄ `uro cultivo`, `urocultibo`, `urocultivo`
- `papanicolaou` ⇄ `papanicolau`, `papanicolao`, `papanicolou`, `papanicolauo`
- `colposcopia` ⇄ `colposopia`, `colposcopiaa`, `colposcopía`
- `mamografia` ⇄ `mamografia`, `mamografiaa`, `mamografIa`
- `mastografia` ⇄ `mastografia`, `mastografiaa`
- `densitometria` ⇄ `densitometria`, `densitometriaa`
- `electrocardiograma` ⇄ `electro cardiograma`, `electrocardiogrma`, `electrocardiograma`
- `creatinina` ⇄ `creatinina`, `creatnina`, `creatinina`
- `testosterona` ⇄ `testosterna`, `testosteronaa`
- `hepatitis` ⇄ `epatitis`, `hepatits`
- `papiloma` ⇄ `papilomma`, `papiloma humano`
- `embarazo` ⇄ `embaraszo`, `embaraso`
- `rodilla` ⇄ `rodila`, `rodillla`
- `tobillo` ⇄ `tovillo`, `tobilo`
- `hombro` ⇄ `ombro`, `hombrro`
- `columna` ⇄ `columa`, `colunma`
- `pelvis` ⇄ `pelbiz`, `pelvis`
- `rinon` ⇄ `riñon`, `riñón`, `rinones`, `riñones`

## 5. Grupos semánticos

Estos grupos sirven para consultas amplias. **Nunca deben puntuar igual que un alias directo.**

- **sangre**: Paquete de 38 elementos; Paquete de 27 elementos; Paquete de 6 elementos; Química Sanguínea de 6 Elementos; BHC. Adulto Femenino; BHC. Adulto Masculino; Química Sanguínea de 38 Elementos; Hemoglobina Glucosilada; Quimica sanguinea de 27 Elementos; Química Sanguínea de 12 Elementos; Grupo y Factor Rh; Antigeno Especifico de Prostata Clave 1472; Perfil Tiroideo 1; Tiempo de Protrombina Clave 2644; Tiempo de Tromboplastina Parcial Activada (TTP) Clave 0262; Prueba Inmuno de Embarazo en Suero; Vitamina D (25-HIDROXI) Clave 1657; Insulina; (TSH) Hormona Estimulante de Tiroides; Indice de Resistencia Homa; Perfil Tiroideo 3; Creatinina en Suero; Perfil Hormonal Completo Femenino; T4 Libre (Tiroxina Libre).; Glucosa en Suero; T3 Libre (Triyodotironina Libre); Nitrogeno Ureico en Suero (BUN); V.D.R.L. (reacciones seroluéticas) en campo oscuro, 286; Acs. HIV (Sida) Clave 2136; Reacciones Febriles; Perfil Hormonal Basico(ginecologico); Antigeno Prostatico Libre Clave 1473; DUO SARSCOV2-INFLUENZA A+b; BHC de 6 a 12 años; Fraccion Beta (Cuantificacion Hgc); BHC de 1 a 6 Años.; T4 (Total) Tiroxina Sérica Total; Perfil Drogas de Abuso (2); T3 Total; Creatin-fosfokinasa (CPK) Clave 048; Testosterona Total Mas Libre.; Perfil Prenatal 2; Perfil Drogas de Abuso (1); Acs. Anti-hepatitis C Clave 1452; (FSH) Hormona Folículo Estimulante; (LH) Hormona Luteinizante; Ag. de Superficie Hepatitis B (Hbs Ag) Clave 1470; Perfil Hormonal Masculino; Perfil Prenatal 1
- **orina**: Paquete de 38 elementos; Paquete de 27 elementos; Paquete de 6 elementos; Examen General de Orina; Urocultivo; Relacion Microalbumina/creatinina en Orina Ocasional (2622); Prueba Inmuno de Embarazo en Orina
- **tiroides**: Perfil Tiroideo 1; (TSH) Hormona Estimulante de Tiroides; Perfil Tiroideo 3; T4 Libre (Tiroxina Libre).; Ultrasonido Tiroideo; T3 Libre (Triyodotironina Libre); T4 (Total) Tiroxina Sérica Total; T3 Total
- **embarazo**: Prueba Inmuno de Embarazo en Suero; Ultrasonido Obstétrico; Fraccion Beta (Cuantificacion Hgc); Prueba Inmuno de Embarazo en Orina; Perfil Prenatal 2; Perfil Prenatal 1
- **prenatal**: Ultrasonido Obstétrico; Perfil Prenatal 2; Perfil Prenatal 1; Prueba Inmuno de Embarazo en Suero
- **ginecologia**: Ultrasonido Pélvico; Ultrasonido Mamario Bilateral; Ultrasonido Transvaginal; Perfil Hormonal Completo Femenino; Colposcopia, Papanicolaou y C. Vaginal; Perfil Hormonal Basico(ginecologico); Papanicolaou; Cultivo Vaginal; Vph-pcr Clave 2120; Colposcopia y Cultivo Vaginal; Mastografia
- **mama**: Ultrasonido Mamario Bilateral; Mastografia
- **prostata**: Antigeno Especifico de Prostata Clave 1472; Ultrasonido Prostatico; Antigeno Prostatico Libre Clave 1473
- **corazon**: Electrocardiograma en Reposo con Interpretacion Cardiologica; Ecocardiograma; Electrocardiograma; Electrocardiograma con Esfuerzo
- **coagulacion**: Tiempo de Protrombina Clave 2644; Tiempo de Tromboplastina Parcial Activada (TTP) Clave 0262
- **diabetes**: Química Sanguínea de 6 Elementos; Hemoglobina Glucosilada; Insulina; Indice de Resistencia Homa; Glucosa en Suero; Química Sanguínea de 12 Elementos; Quimica sanguinea de 27 Elementos; Química Sanguínea de 38 Elementos
- **glucosa**: Química Sanguínea de 6 Elementos; Hemoglobina Glucosilada; Insulina; Indice de Resistencia Homa; Glucosa en Suero; Química Sanguínea de 12 Elementos; Quimica sanguinea de 27 Elementos; Química Sanguínea de 38 Elementos
- **rinon**: Creatinina en Suero; Nitrogeno Ureico en Suero (BUN); Relacion Microalbumina/creatinina en Orina Ocasional (2622); Ultrasonido Renal; USG Renal y Vias Urinarias; Examen General de Orina
- **vias urinarias**: Examen General de Orina; Urocultivo; Ultrasonido Renal; USG Renal y Vias Urinarias; Relacion Microalbumina/creatinina en Orina Ocasional (2622)
- **infeccion urinaria**: Urocultivo; Examen General de Orina; USG Renal y Vias Urinarias
- **higado**: Ultrasonido de Higado y Vias Biliares; Ultrasonido Abdominal; Ultrasonido Abdomino-pélvico; Química Sanguínea de 38 Elementos; Quimica sanguinea de 27 Elementos
- **vesicula**: Ultrasonido de Higado y Vias Biliares; Ultrasonido Abdominal
- **huesos**: Densitometría Osea Columna/cadera; Columna Lumbo Sacra AP. y LAT. Adulto; Rodilla AP. y LAT.; Pie AP. y LAT. (Adulto); Rodillas Comparativas AP y LAT; Mano AP y LAT (Adulto); Hombro AP (Adulto); Pelvis AP (Adulto); Tobillo Derecho AP. y LAT. (Adulto); Columna Cervical AP. y LAT. Adulto; Tobillo Izquierdo AP. y LAT. (Adulto); Hombro AP y Oblicua Adulto; Pierna AP. y LAT. (Adulto); Columna Dorsal AP. y LAT. Adulto; Pelvis 2 Proyecciones (Adulto)
- **osteoporosis**: Densitometría Osea Columna/cadera
- **torax**: Tele de Tórax (Adulto); Tele de Tórax Pa y LAT (Adulto)
- **pulmones**: Tele de Tórax (Adulto); Tele de Tórax Pa y LAT (Adulto)
- **abdomen**: Ultrasonido Abdomino-pélvico; Ultrasonido de Higado y Vias Biliares; Ultrasonido Abdominal; Tomografía de Abdomen Simple; Tomografía de Abdomen Contrastada; Abdomen Simple
- **pelvis**: Ultrasonido Pélvico; Ultrasonido Abdomino-pélvico; Ultrasonido Transvaginal; Pelvis AP (Adulto); Pelvis 2 Proyecciones (Adulto)
- **cabeza**: Tomografía de Cráneo Simple
- **vision**: Salud Visual
- **garganta**: Cultivo Faringeo
- **heces**: Coprologico; Sangre Oculta en Heces
- **intestino**: Coprologico; Sangre Oculta en Heces; Abdomen Simple; Tomografía de Abdomen Simple; Tomografía de Abdomen Contrastada
- **testiculo**: Ultrasonido Testicular; Testosterona Total Mas Libre.; Perfil Hormonal Masculino
- **fertilidad**: (FSH) Hormona Folículo Estimulante; (LH) Hormona Luteinizante; Perfil Hormonal Completo Femenino; Perfil Hormonal Basico(ginecologico); Perfil Hormonal Masculino; Testosterona Total Mas Libre.
- **ets**: V.D.R.L. (reacciones seroluéticas) en campo oscuro, 286; Acs. HIV (Sida) Clave 2136; Acs. Anti-hepatitis C Clave 1452; Ag. de Superficie Hepatitis B (Hbs Ag) Clave 1470; Vph-pcr Clave 2120
- **vih**: Acs. HIV (Sida) Clave 2136
- **sifilis**: V.D.R.L. (reacciones seroluéticas) en campo oscuro, 286
- **hepatitis**: Acs. Anti-hepatitis C Clave 1452; Ag. de Superficie Hepatitis B (Hbs Ag) Clave 1470
- **papiloma**: Vph-pcr Clave 2120; Papanicolaou; Colposcopia, Papanicolaou y C. Vaginal; Colposcopia y Cultivo Vaginal
- **drogas**: Perfil Drogas de Abuso (1); Perfil Drogas de Abuso (2)
- **musculo**: Ultrasonido Músculo Esqueletico; Creatin-fosfokinasa (CPK) Clave 048
- **check up**: Paquete de 38 elementos; Paquete de 27 elementos; Paquete de 6 elementos; Química Sanguínea de 38 Elementos; Quimica sanguinea de 27 Elementos; Química Sanguínea de 12 Elementos; Química Sanguínea de 6 Elementos
- **niño**: BHC de 1 a 6 Años.; BHC de 6 a 12 años
- **mujer**: Paquete de 38 elementos; Paquete de 6 elementos; BHC. Adulto Femenino; Perfil Hormonal Completo Femenino; Perfil Hormonal Basico(ginecologico); Ultrasonido Pélvico; Ultrasonido Transvaginal; Mastografia; Ultrasonido Mamario Bilateral
- **hombre**: Paquete de 27 elementos; BHC. Adulto Masculino; Perfil Hormonal Masculino; Antigeno Especifico de Prostata Clave 1472; Antigeno Prostatico Libre Clave 1473; Ultrasonido Prostatico

## 6. Catálogo completo de variables de búsqueda

Formato de cada estudio:

- `aliases_directos`: formas que deben encontrarlo con puntuación alta.
- `terminos_relacionados`: conceptos amplios para descubrimiento, con puntuación menor.
- `errores_probables`: variantes explícitas; además se aplican las reglas fuzzy globales.
- `desambiguacion`: reglas de ranking para evitar falsos positivos.

### 001. Paquete de 38 elementos

- **tipo:** `Paquete`
- **área/modalidad:** `Laboratorio`
- **clave:** `PB5-38 + BHC-FEM + EGO`
- **aliases_directos:** `Paquete de 38 elementos`; `Paquete de 38 elementos para mujer`; `química sanguínea de 38 elementos`; `biometría hemática completa`; `BHC`; `biometría hemática femenina`; `hemograma`; `conteo sanguíneo`; `examen general de orina`; `EGO`; `análisis de sangre y orina`; `check up completo para mujer`; `chequeo general femenino`; `check up mujer completo`; `checkup mujer`; `chequeo de mujer`; `perfil general femenino`; `paquete femenino sangre y orina`
- **terminos_relacionados:** `sangre`; `orina`; `check up`; `mujer`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 002. Paquete de 27 elementos

- **tipo:** `Paquete`
- **área/modalidad:** `Laboratorio`
- **clave:** `PB4-27 + BHC-MASC + EGO`
- **aliases_directos:** `Paquete de 27 elementos`; `Paquete de 27 elementos para hombre`; `perfil bioquímico de 27 elementos`; `biometría hemática completa`; `BHC`; `biometría hemática masculina`; `hemograma`; `conteo sanguíneo`; `examen general de orina`; `EGO`; `análisis de sangre y orina`; `check up completo para hombre`; `chequeo general masculino`; `check up hombre completo`; `checkup hombre`; `chequeo de hombre`; `perfil general masculino`; `paquete masculino sangre y orina`
- **terminos_relacionados:** `sangre`; `orina`; `check up`; `hombre`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 003. Paquete de 6 elementos

- **tipo:** `Paquete`
- **área/modalidad:** `Laboratorio`
- **clave:** `BHC-FEM + EGO + QSC-6`
- **aliases_directos:** `Paquete de 6 elementos`; `Paquete de análisis para mujer`; `biometría hemática completa`; `BHC`; `biometría hemática femenina`; `hemograma`; `conteo sanguíneo`; `examen general de orina`; `EGO`; `química sanguínea de 6 elementos`; `QSC 6`; `análisis de sangre y orina`; `check up básico femenino`; `check up basico mujer`; `checkup basico femenino`; `paquete basico femenino`; `sangre y orina mujer`
- **terminos_relacionados:** `sangre`; `orina`; `check up`; `mujer`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 004. Química Sanguínea de 6 Elementos

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `QSC-6`
- **aliases_directos:** `Química Sanguínea de 6 Elementos`; `química de 6`; `QSC 6`; `análisis de química sanguínea`; `glucosa y química sanguínea`; `chequeo básico de sangre`; `quimica sanguinea 6`; `qs 6`; `qsc6`; `perfil quimico 6`
- **terminos_relacionados:** `sangre`; `diabetes`; `glucosa`; `check up`
- **errores_probables:** `kimica`; `qimica`; `quimka`; `sanginea`; `sanguinia`; `sanguina`
- **desambiguacion:** No asumir componentes exactos de la química sanguínea si el catálogo no los enumera.

### 005. Examen General de Orina

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `EGO`
- **aliases_directos:** `Examen General de Orina`; `EGO`; `análisis de orina`; `examen de orina`; `estudio de orina`; `prueba de orina`; `análisis urinario`; `urianalisis`; `uroanalisis`; `general de orina`; `orina completa`
- **terminos_relacionados:** `orina`; `rinon`; `vias urinarias`; `infeccion urinaria`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 006. BHC. Adulto Femenino

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `BHC-FEM`
- **aliases_directos:** `BHC. Adulto Femenino`; `Biometría hemática completa`; `BHC`; `biometría hemática femenina`; `biometría hemática para mujer`; `hemograma`; `conteo sanguíneo completo`; `análisis de células de la sangre`; `glóbulos rojos, glóbulos blancos y plaquetas`; `biometria hematica`; `bhc mujer`; `cbc mujer`; `conteo sanguineo completo mujer`; `complete blood count mujer`
- **terminos_relacionados:** `sangre`; `mujer`
- **errores_probables:** `biometia`; `biometriaa`; `biometria`; `ematica`; `hematika`; `hemática`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 007. BHC. Adulto Masculino

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `BHC-MASC`
- **aliases_directos:** `BHC. Adulto Masculino`; `Biometría hemática completa`; `BHC`; `biometría hemática masculina`; `biometría hemática para hombre`; `hemograma`; `conteo sanguíneo completo`; `análisis de células de la sangre`; `glóbulos rojos, glóbulos blancos y plaquetas`; `biometria hematica`; `bhc hombre`; `cbc hombre`; `conteo sanguineo completo hombre`; `complete blood count hombre`
- **terminos_relacionados:** `sangre`; `hombre`
- **errores_probables:** `biometia`; `biometriaa`; `biometria`; `ematica`; `hematika`; `hemática`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 008. Química Sanguínea de 38 Elementos

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `PB5-38`
- **aliases_directos:** `Química Sanguínea de 38 Elementos`; `química de 38`; `perfil bioquímico completo`; `análisis de sangre de 38 elementos`; `check up de sangre`; `chequeo bioquímico amplio`; `quimica sanguinea 38`; `qs 38`; `qsc 38`; `perfil bioquimico amplio`; `perfil quimico 38`
- **terminos_relacionados:** `sangre`; `diabetes`; `glucosa`; `higado`; `check up`
- **errores_probables:** `kimica`; `qimica`; `quimka`; `sanginea`; `sanguinia`; `sanguina`
- **desambiguacion:** No asumir componentes exactos de la química sanguínea si el catálogo no los enumera.

### 009. Hemoglobina Glucosilada

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `HD-G`
- **aliases_directos:** `Hemoglobina Glucosilada`; `hemoglobina glicosilada`; `HbA1c`; `A1c`; `glucosa de 3 meses`; `promedio de azúcar en sangre`; `control de diabetes`; `hb a1c`; `glicohemoglobina`; `hemoglobina glicada`; `azucar de 3 meses`; `glucosa promedio 3 meses`
- **terminos_relacionados:** `sangre`; `diabetes`; `glucosa`
- **errores_probables:** `emoglobina`; `hemoglovina`; `glucosilada`; `glicosilada`; `glicocilada`
- **desambiguacion:** Con A1c/HbA1c/glucosa 3 meses/promedio 3 meses debe superar a glucosa simple.

### 010. Quimica sanguinea de 27 Elementos

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `PB4-27`
- **aliases_directos:** `Quimica sanguinea de 27 Elementos`; `perfil bioquímico de 27 elementos`; `química sanguínea de 27 elementos`; `química de 27`; `análisis de sangre de 27 elementos`; `check up bioquímico`; `chequeo general de sangre`; `quimica sanguinea 27`; `qs 27`; `qsc 27`; `perfil quimico 27`; `perfil bioquimico 27`
- **terminos_relacionados:** `sangre`; `diabetes`; `glucosa`; `higado`; `check up`
- **errores_probables:** `kimica`; `qimica`; `quimka`; `sanginea`; `sanguinia`; `sanguina`
- **desambiguacion:** No asumir componentes exactos; además ignorar el texto accidental '17 elementos' de la descripción del Excel.

### 011. Química Sanguínea de 12 Elementos

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `PB2-12E`
- **aliases_directos:** `Química Sanguínea de 12 Elementos`; `química de 12`; `QSC 12`; `perfil bioquímico de 12 elementos`; `análisis de sangre de 12 elementos`; `quimica sanguinea 12`; `qs 12`; `qsc12`; `perfil quimico 12`; `perfil bioquimico 12`
- **terminos_relacionados:** `sangre`; `diabetes`; `glucosa`; `check up`
- **errores_probables:** `kimica`; `qimica`; `quimka`; `sanginea`; `sanguinia`; `sanguina`
- **desambiguacion:** No asumir componentes exactos de la química sanguínea si el catálogo no los enumera.

### 012. Tele de Tórax (Adulto)

- **tipo:** `Estudio`
- **área/modalidad:** `Rayos X`
- **clave:** `TX-1`
- **aliases_directos:** `Tele de Tórax (Adulto)`; `Tele de tórax`; `radiografía de tórax`; `rayos X de tórax`; `placa de tórax`; `radiografía de pecho`; `tele de tórax adulto`; `rx torax`; `rx pecho`; `radiografia pecho`; `placa de pecho`; `tele torax`
- **terminos_relacionados:** `torax`; `pulmones`
- **errores_probables:** `radiografia`; `radiogrfia`; `radiografiaa`; `rayosx`
- **desambiguacion:** Con 'una proyección/tele tórax' o término genérico de tórax puede aparecer; con PA+LAT/dos proyecciones priorizar TX-2ADUL.

### 013. Grupo y Factor Rh

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `GPORH`
- **aliases_directos:** `Grupo y Factor Rh`; `Grupo sanguíneo y factor Rh`; `grupo y Rh`; `tipo de sangre`; `grupo sanguíneo`; `factor RH`; `saber qué tipo de sangre soy`; `grupo de sangre`; `grupo sanguineo`; `rh positivo`; `rh negativo`; `que tipo de sangre soy`; `saber mi tipo de sangre`; `blood type`
- **terminos_relacionados:** `sangre`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** Boost fuerte si aparecen juntos: tipo+de+sangre, grupo+sanguineo, factor+rh, rh+positivo/negativo. 'sangre' sola es término relacionado, no coincidencia exacta.

### 014. Urocultivo

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `UROCUL`
- **aliases_directos:** `Urocultivo`; `cultivo de orina`; `cultivo urinario`; `examen para infección urinaria`; `bacterias en orina`; `infección de vías urinarias`; `urocultivo con antibiograma`; `cultivo de vias urinarias`
- **terminos_relacionados:** `orina`; `vias urinarias`; `infeccion urinaria`
- **errores_probables:** `uro cultivo`; `urocultibo`; `urocultivo`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 015. Electrocardiograma en Reposo con Interpretacion Cardiologica

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `EKG/CARDIOLO`
- **aliases_directos:** `Electrocardiograma en Reposo con Interpretacion Cardiologica`; `Electrocardiograma en reposo`; `EKG`; `ECG`; `electro del corazón`; `electrocardiograma con interpretación cardiológica`; `estudio del ritmo del corazón`; `ecg reposo`; `ekg reposo`; `electrocardiograma reposo`; `electro con interpretacion`; `electrocardiograma interpretado por cardiologo`
- **terminos_relacionados:** `corazon`
- **errores_probables:** `electro cardiograma`; `electrocardiogrma`; `electrocardiograma`
- **desambiguacion:** Con 'reposo', 'interpretación' o 'cardiólogo' debe superar a EKG simple.

### 016. Densitometría Osea Columna/cadera

- **tipo:** `Estudio`
- **área/modalidad:** `Especiales`
- **clave:** `DENCOLCA`
- **aliases_directos:** `Densitometría Osea Columna/cadera`; `Densitometría ósea de columna y cadera`; `densitometría`; `estudio de osteoporosis`; `medición de densidad ósea`; `DEXA`; `huesos columna y cadera`; `dxa`; `densidad mineral osea`; `dm osea`; `osteoporosis`; `densitometria columna cadera`
- **terminos_relacionados:** `huesos`; `osteoporosis`
- **errores_probables:** `densitometria`; `densitometriaa`; `columa`; `colunma`
- **desambiguacion:** Priorizar coincidencias específicas del nombre y la intención; los términos de área son secundarios.

### 017. Antigeno Especifico de Prostata Clave 1472

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `AG.P.`
- **aliases_directos:** `Antigeno Especifico de Prostata Clave 1472`; `Antígeno prostático específico`; `PSA total`; `antígeno de próstata`; `examen de próstata en sangre`; `prueba PSA`; `estudio de próstata`; `psa`; `ape`; `antigeno prostatico`; `antigeno especifico de prostata`; `prostate specific antigen`
- **terminos_relacionados:** `sangre`; `prostata`; `hombre`
- **errores_probables:** `prostota`; `prostrata`; `prostata`
- **desambiguacion:** Con PSA sin 'libre' priorizar PSA total; con 'libre' priorizar PSA-LIBRE.

### 018. Perfil Tiroideo 1

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `PTIR-1`
- **aliases_directos:** `Perfil Tiroideo 1`; `perfil de tiroides`; `pruebas de tiroides`; `estudios tiroideos`; `hormonas tiroideas`; `análisis para revisar la tiroides`; `perfil tiroideo`; `funcion tiroidea`; `panel tiroideo`; `chequeo tiroides`
- **terminos_relacionados:** `sangre`; `tiroides`
- **errores_probables:** `tiroide`; `tiroides`; `tiroidis`
- **desambiguacion:** 'tiroides' genérico puede mostrar perfiles y pruebas individuales. Si pide TSH/T3/T4, priorizar la prueba específica.

### 019. Tiempo de Protrombina Clave 2644

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `TP`
- **aliases_directos:** `Tiempo de Protrombina Clave 2644`; `Tiempo de protrombina`; `TP`; `PT`; `tiempo de coagulación`; `prueba de coagulación de la sangre`; `protrombina`; `inr`; `coagulacion protrombina`
- **terminos_relacionados:** `sangre`; `coagulacion`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** TP/PT/INR o protrombina prioriza TP. 'Coagulación' genérico debe mostrar TP y TPT.

### 020. Tiempo de Tromboplastina Parcial Activada (TTP) Clave 0262

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `TPT`
- **aliases_directos:** `Tiempo de Tromboplastina Parcial Activada (TTP) Clave 0262`; `Tiempo de tromboplastina parcial activada`; `TTPa`; `TPT`; `aPTT`; `prueba de coagulación`; `tiempo parcial de tromboplastina`; `tt pa`; `ptt`; `tromboplastina parcial activada`
- **terminos_relacionados:** `sangre`; `coagulacion`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** TTPa/aPTT/PTT/tromboplastina parcial prioriza TPT. 'Coagulación' genérico debe mostrar TP y TPT.

### 021. Columna Lumbo Sacra AP. y LAT. Adulto

- **tipo:** `Estudio`
- **área/modalidad:** `Rayos X`
- **clave:** `COL-LS/ADULT`
- **aliases_directos:** `Columna Lumbo Sacra AP. y LAT. Adulto`; `Radiografía de columna lumbosacra`; `rayos X columna lumbar`; `columna lumbosacra AP y lateral`; `placa de espalda baja`; `radiografía lumbar`; `rx lumbar`; `radiografia lumbar`; `rx lumbosacra`; `columna lumbar`; `espalda baja rayos x`; `lumbosacra`
- **terminos_relacionados:** `huesos`
- **errores_probables:** `radiografia`; `radiogrfia`; `radiografiaa`; `rayosx`; `columa`; `colunma`
- **desambiguacion:** Si la consulta incluye `rx`, `rayos x`, `radiografia` o `placa`, aumentar la prioridad. No confundir con ultrasonido/TAC de la misma zona.

### 022. Ultrasonido Pélvico

- **tipo:** `Estudio`
- **área/modalidad:** `USG`
- **clave:** `USG-PEL`
- **aliases_directos:** `Ultrasonido Pélvico`; `USG pélvico`; `ultrasonido de pelvis`; `eco pélvico`; `ultrasonido ginecológico pélvico`; `usg pelvis`; `eco pelvis`; `ecografia pelvica`; `ultrasonido ginecologico`
- **terminos_relacionados:** `ginecologia`; `pelvis`; `mujer`
- **errores_probables:** `ultra sonido`; `ultrason`; `ultrasonio`; `ultrasonido`; `pelbiz`; `pelvis`
- **desambiguacion:** Si la consulta incluye `ultrasonido`, `usg`, `eco` o `ecografia` más la zona anatómica, aumentar la prioridad. No confundir con radiografía/TAC de la misma zona.

### 023. Prueba Inmuno de Embarazo en Suero

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `PIE`
- **aliases_directos:** `Prueba Inmuno de Embarazo en Suero`; `Prueba de embarazo en sangre`; `prueba inmunológica de embarazo en suero`; `embarazo en suero`; `test de embarazo en sangre`; `hCG cualitativa`; `embarazo sangre`; `prueba embarazo sangre`; `hcg cualitativa sangre`; `gch cualitativa`; `beta hcg cualitativa`
- **terminos_relacionados:** `sangre`; `embarazo`; `prenatal`
- **errores_probables:** `embaraszo`; `embaraso`
- **desambiguacion:** Con 'sangre/suero/cualitativa' + embarazo priorizar PIE. Con 'cuantitativa/niveles' priorizar F.B.

### 024. Rodilla AP. y LAT.

- **tipo:** `Estudio`
- **área/modalidad:** `Rayos X`
- **clave:** `RODILLA`
- **aliases_directos:** `Rodilla AP. y LAT`; `Radiografía de rodilla`; `rayos X de rodilla`; `placa de rodilla`; `rodilla AP y lateral`; `RX rodilla`; `radiografia rodilla`; `placa rodilla`
- **terminos_relacionados:** `huesos`
- **errores_probables:** `radiografia`; `radiogrfia`; `radiografiaa`; `rayosx`; `rodila`; `rodillla`
- **desambiguacion:** Rodilla singular prioriza RODILLA; 'ambas/bilateral/comparativas' prioriza RODILLA-2.

### 025. Ultrasonido Abdomino-pélvico

- **tipo:** `Estudio`
- **área/modalidad:** `USG`
- **clave:** `USG-AP`
- **aliases_directos:** `Ultrasonido Abdomino-pélvico`; `Ultrasonido abdominopélvico`; `ultrasonido de abdomen y pelvis`; `USG abdominal y pélvico`; `eco abdominopélvico`; `usg abdomen pelvis`; `eco abdomen pelvis`; `ultrasonido abdomen y pelvis`; `abdominopelvico`
- **terminos_relacionados:** `higado`; `abdomen`; `pelvis`
- **errores_probables:** `ultra sonido`; `ultrason`; `ultrasonio`; `ultrasonido`; `pelbiz`; `pelvis`
- **desambiguacion:** Si la consulta incluye `ultrasonido`, `usg`, `eco` o `ecografia` más la zona anatómica, aumentar la prioridad. No confundir con radiografía/TAC de la misma zona.

### 026. Ultrasonido de Higado y Vias Biliares

- **tipo:** `Estudio`
- **área/modalidad:** `USG`
- **clave:** `USG-HI`
- **aliases_directos:** `Ultrasonido de Higado y Vias Biliares`; `Ultrasonido de hígado y vías biliares`; `USG hígado`; `ultrasonido de vesícula`; `ultrasonido hepatobiliar`; `eco de hígado y vesícula`; `usg hepatobiliar`; `eco hepatobiliar`; `ultrasonido vesicula`; `ultrasonido higado`; `vesicula biliar ultrasonido`; `higado y vesicula`
- **terminos_relacionados:** `higado`; `vesicula`; `abdomen`
- **errores_probables:** `ultra sonido`; `ultrason`; `ultrasonio`; `ultrasonido`
- **desambiguacion:** Si la consulta incluye `ultrasonido`, `usg`, `eco` o `ecografia` más la zona anatómica, aumentar la prioridad. No confundir con radiografía/TAC de la misma zona.

### 027. Ultrasonido Mamario Bilateral

- **tipo:** `Estudio`
- **área/modalidad:** `USG`
- **clave:** `USG-GM`
- **aliases_directos:** `Ultrasonido Mamario Bilateral`; `ultrasonido de mamas`; `USG mamario`; `ultrasonido de senos`; `eco mamario`; `ultrasonido de mama`; `ultrasonido de seno`; `usg mama`; `eco mama`; `ecografia mamaria`; `sonografia mamaria`
- **terminos_relacionados:** `ginecologia`; `mama`; `mujer`
- **errores_probables:** `ultra sonido`; `ultrason`; `ultrasonio`; `ultrasonido`
- **desambiguacion:** Con ultrasonido/eco/USG de mama priorizar USG-GM; con mamografía/mastografía priorizar MASTO.

### 028. Vitamina D (25-HIDROXI) Clave 1657

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `VITA-D`
- **aliases_directos:** `Vitamina D (25-HIDROXI) Clave 1657`; `Vitamina D 25 hidroxi`; `25-OH vitamina D`; `prueba de vitamina D`; `niveles de vitamina D`; `vitamina D en sangre`; `25 oh vitamina d`; `25-oh-d`; `25 hidroxi vitamina d`; `vitamina d3 sangre`; `nivel vitamina d`
- **terminos_relacionados:** `sangre`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 029. Insulina

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `INSULI`
- **aliases_directos:** `Insulina`; `Insulina en sangre`; `prueba de insulina`; `niveles de insulina`; `insulina sérica`; `análisis de insulina`; `insulina serica`; `insulinemia`; `nivel de insulina en ayunas`; `insulina basal`
- **terminos_relacionados:** `sangre`; `diabetes`; `glucosa`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** 'insulina' sola prioriza Insulina; 'resistencia/HOMA' prioriza IR-HOMA.

### 030. Ultrasonido Músculo Esqueletico

- **tipo:** `Estudio`
- **área/modalidad:** `USG`
- **clave:** `USG-MUSC`
- **aliases_directos:** `Ultrasonido Músculo Esqueletico`; `Ultrasonido musculoesquelético`; `ultrasonido músculo esquelético`; `USG muscular`; `ultrasonido de músculo, tendón o articulación`; `eco musculoesquelético`; `ultrasonido musculoesqueletico`; `usg musculoesqueletico`; `eco muscular`; `ultrasonido tendon`; `ultrasonido articulacion`; `ultrasonido musculo`
- **terminos_relacionados:** `musculo`
- **errores_probables:** `ultra sonido`; `ultrason`; `ultrasonio`; `ultrasonido`
- **desambiguacion:** Si la consulta incluye `ultrasonido`, `usg`, `eco` o `ecografia` más la zona anatómica, aumentar la prioridad. No confundir con radiografía/TAC de la misma zona.

### 031. Mastografia

- **tipo:** `Estudio`
- **área/modalidad:** `Especiales`
- **clave:** `MASTO`
- **aliases_directos:** `Mastografia`; `Mastografía`; `mamografía`; `estudio de mama`; `rayos X de mama`; `estudio para revisión de senos`; `mamografia`; `mamograma`; `mammography`; `rayos x mama`; `rayos x seno`; `estudio mamario`
- **terminos_relacionados:** `ginecologia`; `mama`; `mujer`
- **errores_probables:** `mamografia`; `mamografiaa`; `mastografia`; `mastografiaa`
- **desambiguacion:** Con mamografía/mastografía/rayos X de mama priorizar MASTO; con ultrasonido/eco/USG de mama priorizar USG-GM.

### 032. Pie AP. y LAT. (Adulto)

- **tipo:** `Estudio`
- **área/modalidad:** `Rayos X`
- **clave:** `PIE-ADULTO`
- **aliases_directos:** `Pie AP. y LAT. (Adulto)`; `Radiografía de pie`; `rayos X de pie`; `placa de pie`; `pie AP y lateral`; `RX pie adulto`; `rx pie`; `radiografia pie`; `placa pie`; `rayos x pie`
- **terminos_relacionados:** `huesos`
- **errores_probables:** `radiografia`; `radiogrfia`; `radiografiaa`; `rayosx`
- **desambiguacion:** Boost con pie + radiografia/rx/rayos x/placa. No confundir con clave PIE de embarazo.

### 033. (TSH) Hormona Estimulante de Tiroides

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `TSH`
- **aliases_directos:** `(TSH) Hormona Estimulante de Tiroides`; `TSH`; `hormona estimulante de tiroides`; `hormona tiroestimulante`; `tirotropina`; `prueba de TSH`; `análisis de tiroides`; `thyroid stimulating hormone`; `hormona estimulante tiroides`
- **terminos_relacionados:** `sangre`; `tiroides`
- **errores_probables:** `tiroide`; `tiroides`; `tiroidis`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 034. Rodillas Comparativas AP y LAT

- **tipo:** `Estudio`
- **área/modalidad:** `Rayos X`
- **clave:** `RODILLA-2`
- **aliases_directos:** `Rodillas Comparativas AP y LAT`; `Radiografías de ambas rodillas`; `rodillas comparativas`; `rayos X de rodillas`; `RX bilateral de rodilla`; `rodillas AP y lateral`; `rx ambas rodillas`; `radiografia bilateral rodillas`; `rx rodillas comparativas`
- **terminos_relacionados:** `huesos`
- **errores_probables:** `radiografia`; `radiogrfia`; `radiografiaa`; `rayosx`; `rodila`; `rodillla`
- **desambiguacion:** Requiere boost por ambas/bilateral/comparativas.

### 035. Ultrasonido Transvaginal

- **tipo:** `Estudio`
- **área/modalidad:** `USG`
- **clave:** `USG-TR`
- **aliases_directos:** `Ultrasonido Transvaginal`; `USG transvaginal`; `eco transvaginal`; `ultrasonido vaginal`; `ultrasonido ginecológico interno`; `ecografia transvaginal`; `usg vaginal`; `ultrasonido endovaginal`; `eco vaginal`
- **terminos_relacionados:** `ginecologia`; `pelvis`; `mujer`
- **errores_probables:** `ultra sonido`; `ultrason`; `ultrasonio`; `ultrasonido`
- **desambiguacion:** Si la consulta incluye `ultrasonido`, `usg`, `eco` o `ecografia` más la zona anatómica, aumentar la prioridad. No confundir con radiografía/TAC de la misma zona.

### 036. Indice de Resistencia Homa

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `IR-HOMA`
- **aliases_directos:** `Indice de Resistencia Homa`; `Índice HOMA`; `HOMA-IR`; `índice de resistencia a la insulina`; `prueba de resistencia a la insulina`; `cálculo HOMA`; `homa`; `homa ir`; `resistencia insulina`; `indice resistencia insulina`; `calculo homa`
- **terminos_relacionados:** `sangre`; `diabetes`; `glucosa`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** Con HOMA/resistencia a insulina priorizar HOMA; 'insulina' sola prioriza INSULI.

### 037. Mano AP y LAT (Adulto)

- **tipo:** `Estudio`
- **área/modalidad:** `Rayos X`
- **clave:** `MANO-3`
- **aliases_directos:** `Mano AP y LAT (Adulto)`; `Radiografía de mano`; `rayos X de mano`; `placa de mano`; `mano AP y lateral`; `RX mano adulto`; `rx mano`; `radiografia mano`; `placa mano`; `rayos x mano`
- **terminos_relacionados:** `huesos`
- **errores_probables:** `radiografia`; `radiogrfia`; `radiografiaa`; `rayosx`
- **desambiguacion:** Si la consulta incluye `rx`, `rayos x`, `radiografia` o `placa`, aumentar la prioridad. No confundir con ultrasonido/TAC de la misma zona.

### 038. Ultrasonido Prostatico

- **tipo:** `Estudio`
- **área/modalidad:** `USG`
- **clave:** `USG.PROST`
- **aliases_directos:** `Ultrasonido Prostatico`; `Ultrasonido prostático`; `USG de próstata`; `ultrasonido de próstata`; `eco prostático`; `estudio de próstata por ultrasonido`; `usg prostata`; `eco prostata`; `ecografia prostatica`; `ultrasonido de prostata`
- **terminos_relacionados:** `prostata`; `hombre`
- **errores_probables:** `ultra sonido`; `ultrason`; `ultrasonio`; `ultrasonido`; `prostota`; `prostrata`; `prostata`
- **desambiguacion:** Si la consulta incluye `ultrasonido`, `usg`, `eco` o `ecografia` más la zona anatómica, aumentar la prioridad. No confundir con radiografía/TAC de la misma zona.

### 039. Ultrasonido Abdominal

- **tipo:** `Estudio`
- **área/modalidad:** `USG`
- **clave:** `USG-AB`
- **aliases_directos:** `Ultrasonido Abdominal`; `USG abdomen`; `ultrasonido de abdomen`; `eco abdominal`; `ultrasonido general de abdomen`; `eco abdomen`; `ecografia abdominal`
- **terminos_relacionados:** `higado`; `vesicula`; `abdomen`
- **errores_probables:** `ultra sonido`; `ultrason`; `ultrasonio`; `ultrasonido`
- **desambiguacion:** Si la consulta incluye `ultrasonido`, `usg`, `eco` o `ecografia` más la zona anatómica, aumentar la prioridad. No confundir con radiografía/TAC de la misma zona.

### 040. Perfil Tiroideo 3

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `PTIR-3`
- **aliases_directos:** `Perfil Tiroideo 3`; `perfil completo de tiroides`; `pruebas tiroideas`; `hormonas tiroideas`; `estudios para revisar función de la tiroides`; `perfil tiroideo completo`; `panel tiroideo completo`; `funcion tiroidea completa`; `perfil de tiroides completo`
- **terminos_relacionados:** `sangre`; `tiroides`
- **errores_probables:** `tiroide`; `tiroides`; `tiroidis`
- **desambiguacion:** 'tiroides' genérico puede mostrar perfiles y pruebas individuales. Si pide 'completo' priorizar Perfil Tiroideo 3.

### 041. Tomografía de Cráneo Simple

- **tipo:** `Estudio`
- **área/modalidad:** `Tomografia`
- **clave:** `TAC.CRANS`
- **aliases_directos:** `Tomografía de Cráneo Simple`; `TAC de cráneo`; `tomografía de cabeza`; `CT de cráneo`; `tomografía cerebral sin contraste`; `tac craneo simple`; `tc craneo simple`; `ct head without contrast`; `tomografia cabeza simple`; `tomografia cabeza sin contraste`; `tac cabeza`
- **terminos_relacionados:** `cabeza`
- **errores_probables:** `tomografia`; `tomogrfia`; `tomografiaa`
- **desambiguacion:** Si la consulta incluye `tac`, `tc`, `ct` o `tomografia`, aumentar la prioridad y respetar `con contraste` vs `sin contraste/simple`.

### 042. Creatinina en Suero

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `CRE-S`
- **aliases_directos:** `Creatinina en Suero`; `creatinina en sangre`; `prueba de creatinina`; `función renal`; `estudio de riñón en sangre, estudio para las tomografias`; `creatinina serica`; `creatinina sangre`; `funcion renal creatinina`; `creat serum`
- **terminos_relacionados:** `sangre`; `rinon`
- **errores_probables:** `tomografia`; `tomogrfia`; `tomografiaa`; `creatinina`; `creatnina`
- **desambiguacion:** Con 'creatinina' priorizar creatinina; 'riñón' solo es relacionado y debe mostrar también BUN/ACR/USG renal.

### 043. Tomografía de Abdomen Simple

- **tipo:** `Estudio`
- **área/modalidad:** `Tomografia`
- **clave:** `TAC-ABDIC`
- **aliases_directos:** `Tomografía de Abdomen Simple`; `TAC abdominal simple`; `tomografía abdominal sin contraste`; `CT abdomen`; `tomografía de abdomen`; `tac abdomen simple`; `tc abdomen simple`; `ct abdomen without contrast`; `tomografia abdomen sin contraste`; `tomografia abdominal simple`
- **terminos_relacionados:** `abdomen`; `intestino`
- **errores_probables:** `tomografia`; `tomogrfia`; `tomografiaa`
- **desambiguacion:** Con 'sin contraste/simple' priorizar TAC-ABDIC. Nota: el código/nombre del catálogo dice Abdomen Simple.

### 044. Salud Visual

- **tipo:** `Estudio`
- **área/modalidad:** `Especiales`
- **clave:** `SAL-VISU`
- **aliases_directos:** `Salud Visual`; `examen de la vista`; `revisión de la vista`; `valoración visual`; `chequeo de visión`; `examen visual`; `lentes`; `revision vista`; `chequeo vista`; `valoracion optometrica`; `prueba de vision`; `graduacion lentes`
- **terminos_relacionados:** `vision`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** Priorizar coincidencias específicas del nombre y la intención; los términos de área son secundarios.

### 045. Ultrasonido Obstétrico

- **tipo:** `Estudio`
- **área/modalidad:** `USG`
- **clave:** `USG-OB`
- **aliases_directos:** `Ultrasonido Obstétrico`; `ultrasonido de embarazo`; `USG obstétrico`; `eco de embarazo`; `ultrasonido prenatal`; `usg obstetrico`; `eco embarazo`; `ecografia obstetrica`; `ultrasonido embarazo`
- **terminos_relacionados:** `embarazo`; `prenatal`
- **errores_probables:** `ultra sonido`; `ultrason`; `ultrasonio`; `ultrasonido`; `embaraszo`; `embaraso`
- **desambiguacion:** Si la consulta incluye `ultrasonido`, `usg`, `eco` o `ecografia` más la zona anatómica, aumentar la prioridad. No confundir con radiografía/TAC de la misma zona.

### 046. Perfil Hormonal Completo Femenino

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `P-HORMO1`
- **aliases_directos:** `Perfil Hormonal Completo Femenino`; `perfil hormonal para mujer`; `hormonas femeninas`; `estudios hormonales ginecológicos`; `chequeo hormonal femenino`; `perfil hormonal femenino`; `panel hormonal femenino`; `hormonas mujer`; `estudio hormonal mujer`; `perfil ginecologico completo`
- **terminos_relacionados:** `sangre`; `ginecologia`; `fertilidad`; `mujer`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** No asumir qué hormonas incluye el perfil: usar sólo nombre del catálogo y aliases de intención.

### 047. Colposcopia, Papanicolaou y C. Vaginal

- **tipo:** `Paquete`
- **área/modalidad:** `Especiales`
- **clave:** `COLPO`
- **aliases_directos:** `Colposcopia, Papanicolaou y C. Vaginal`; `Colposcopia, Papanicolaou y cultivo vaginal`; `paquete ginecológico`; `revisión de cuello uterino`; `Papanicolaou`; `cultivo vaginal`; `estudio ginecológico completo`; `colpo papanicolau cultivo`; `colposcopia pap cultivo`; `paquete colposcopia`; `paquete ginecologico colposcopia`
- **terminos_relacionados:** `ginecologia`; `papiloma`
- **errores_probables:** `papanicolau`; `papanicolao`; `papanicolou`; `papanicolauo`; `colposopia`; `colposcopiaa`; `colposcopía`
- **desambiguacion:** Priorizar coincidencias específicas del nombre y la intención; los términos de área son secundarios.

### 048. T4 Libre (Tiroxina Libre).

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `T-4L`
- **aliases_directos:** `T4 Libre (Tiroxina Libre)`; `T4 libre`; `tiroxina libre`; `FT4`; `hormona tiroidea T4 libre`; `prueba de tiroides T4 libre`; `t4l`; `free t4`
- **terminos_relacionados:** `sangre`; `tiroides`
- **errores_probables:** `tiroide`; `tiroides`; `tiroidis`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 049. Hombro AP (Adulto)

- **tipo:** `Estudio`
- **área/modalidad:** `Rayos X`
- **clave:** `HOMBRO-A`
- **aliases_directos:** `Hombro AP (Adulto)`; `Radiografía de hombro`; `rayos X de hombro`; `placa de hombro`; `RX hombro AP`; `radiografía hombro adulto`; `rx hombro`; `radiografia hombro`; `placa hombro`; `rayos x hombro`
- **terminos_relacionados:** `huesos`
- **errores_probables:** `radiografia`; `radiogrfia`; `radiografiaa`; `rayosx`; `ombro`; `hombrro`
- **desambiguacion:** Si la consulta incluye `rx`, `rayos x`, `radiografia` o `placa`, aumentar la prioridad. No confundir con ultrasonido/TAC de la misma zona.

### 050. Pelvis AP (Adulto)

- **tipo:** `Estudio`
- **área/modalidad:** `Rayos X`
- **clave:** `PELV-1A`
- **aliases_directos:** `Pelvis AP (Adulto)`; `Radiografía de pelvis`; `rayos X de pelvis`; `placa de pelvis`; `pelvis AP`; `RX pelvis adulto`; `rx pelvis`; `radiografia pelvis`; `placa pelvis`
- **terminos_relacionados:** `huesos`; `pelvis`
- **errores_probables:** `radiografia`; `radiogrfia`; `radiografiaa`; `rayosx`; `pelbiz`; `pelvis`
- **desambiguacion:** Pelvis AP/una proyección prioriza PELV-1A; '2 proyecciones' prioriza PELV-2A.

### 051. Tobillo Derecho AP. y LAT. (Adulto)

- **tipo:** `Estudio`
- **área/modalidad:** `Rayos X`
- **clave:** `TOB.DER.ADUL`
- **aliases_directos:** `Tobillo Derecho AP. y LAT. (Adulto)`; `Radiografía de tobillo derecho`; `rayos X tobillo derecho`; `placa de tobillo`; `RX tobillo derecho AP y lateral`; `rx tobillo derecho`; `radiografia tobillo derecho`; `placa tobillo derecho`
- **terminos_relacionados:** `huesos`
- **errores_probables:** `radiografia`; `radiogrfia`; `radiografiaa`; `rayosx`; `tovillo`; `tobilo`
- **desambiguacion:** Si la consulta incluye `rx`, `rayos x`, `radiografia` o `placa`, aumentar la prioridad. No confundir con ultrasonido/TAC de la misma zona.

### 052. Columna Cervical AP. y LAT. Adulto

- **tipo:** `Estudio`
- **área/modalidad:** `Rayos X`
- **clave:** `COL-CADULT`
- **aliases_directos:** `Columna Cervical AP. y LAT. Adulto`; `Radiografía de columna cervical`; `rayos X de cuello`; `columna cervical AP y lateral`; `placa cervical`; `RX cervical`; `radiografia cervical`; `columna cervical`; `rayos x cuello`
- **terminos_relacionados:** `huesos`
- **errores_probables:** `radiografia`; `radiogrfia`; `radiografiaa`; `rayosx`; `columa`; `colunma`
- **desambiguacion:** Si la consulta incluye `rx`, `rayos x`, `radiografia` o `placa`, aumentar la prioridad. No confundir con ultrasonido/TAC de la misma zona.

### 053. Tobillo Izquierdo AP. y LAT. (Adulto)

- **tipo:** `Estudio`
- **área/modalidad:** `Rayos X`
- **clave:** `TOB.IZQ.ADUL`
- **aliases_directos:** `Tobillo Izquierdo AP. y LAT. (Adulto)`; `Radiografía de tobillo izquierdo`; `rayos X tobillo izquierdo`; `placa de tobillo`; `RX tobillo izquierdo AP y lateral`; `rx tobillo izquierdo`; `radiografia tobillo izquierdo`; `placa tobillo izquierdo`
- **terminos_relacionados:** `huesos`
- **errores_probables:** `radiografia`; `radiogrfia`; `radiografiaa`; `rayosx`; `tovillo`; `tobilo`
- **desambiguacion:** Si la consulta incluye `rx`, `rayos x`, `radiografia` o `placa`, aumentar la prioridad. No confundir con ultrasonido/TAC de la misma zona.

### 054. Ultrasonido para Partes Blandas

- **tipo:** `Estudio`
- **área/modalidad:** `USG`
- **clave:** `USG-PB`
- **aliases_directos:** `Ultrasonido para Partes Blandas`; `Ultrasonido de partes blandas`; `USG partes blandas`; `ultrasonido de tejidos blandos`; `eco de bulto o masa`; `ultrasonido superficial`; `usg tejidos blandos`; `eco partes blandas`; `ecografia tejidos blandos`; `ultrasonido bulto`; `ultrasonido masa superficial`
- **terminos_relacionados:** `—`
- **errores_probables:** `ultra sonido`; `ultrason`; `ultrasonio`; `ultrasonido`
- **desambiguacion:** Si la consulta incluye `ultrasonido`, `usg`, `eco` o `ecografia` más la zona anatómica, aumentar la prioridad. No confundir con radiografía/TAC de la misma zona.

### 055. Ultrasonido Renal

- **tipo:** `Estudio`
- **área/modalidad:** `USG`
- **clave:** `USG-RE`
- **aliases_directos:** `Ultrasonido Renal`; `ultrasonido de riñones`; `USG renal`; `eco renal`; `estudio de riñones por ultrasonido`; `ecografia renal`; `ultrasonido riñones`; `ultrasonido de rinones`
- **terminos_relacionados:** `rinon`; `vias urinarias`
- **errores_probables:** `ultra sonido`; `ultrason`; `ultrasonio`; `ultrasonido`; `riñon`; `riñón`; `rinones`; `riñones`
- **desambiguacion:** Si la consulta incluye `ultrasonido`, `usg`, `eco` o `ecografia` más la zona anatómica, aumentar la prioridad. No confundir con radiografía/TAC de la misma zona.

### 056. Ultrasonido Tiroideo

- **tipo:** `Estudio`
- **área/modalidad:** `USG`
- **clave:** `USG-TIRO`
- **aliases_directos:** `Ultrasonido Tiroideo`; `ultrasonido de tiroides`; `USG tiroides`; `eco tiroideo`; `estudio de nódulos tiroideos`; `eco tiroides`; `ecografia tiroidea`; `ultrasonido nodulo tiroideo`; `ultrasonido cuello tiroides`
- **terminos_relacionados:** `tiroides`
- **errores_probables:** `ultra sonido`; `ultrason`; `ultrasonio`; `ultrasonido`; `tiroide`; `tiroides`; `tiroidis`
- **desambiguacion:** Con 'ultrasonido/eco/nódulo' + tiroides priorizar imagen sobre pruebas de sangre tiroideas.

### 057. Glucosa en Suero

- **tipo:** `Estudio`
- **área/modalidad:** `Rayos X`
- **clave:** `GLU.S`
- **aliases_directos:** `Glucosa en Suero`; `glucosa en sangre`; `azúcar en sangre`; `prueba de glucosa`; `glicemia`; `análisis de azúcar`; `glucosa sangre`; `glucemia`; `azucar en sangre`; `glucosa serica`; `blood glucose`
- **terminos_relacionados:** `sangre`; `diabetes`; `glucosa`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** Con 'glucosa', 'glucemia', 'azúcar en sangre' priorizar esta prueba simple sobre químicas; si pide '3 meses/A1c' priorizar HbA1c.

### 058. Hombro AP y Oblicua Adulto

- **tipo:** `Estudio`
- **área/modalidad:** `Rayos X`
- **clave:** `HOMB-1`
- **aliases_directos:** `Hombro AP y Oblicua Adulto`; `Radiografía de hombro AP y oblicua`; `rayos X de hombro`; `placa de hombro`; `RX hombro adulto`; `rx hombro oblicua`; `radiografia hombro oblicua`; `rx hombro ap oblicua`
- **terminos_relacionados:** `huesos`
- **errores_probables:** `radiografia`; `radiogrfia`; `radiografiaa`; `rayosx`; `ombro`; `hombrro`
- **desambiguacion:** Si la consulta incluye `rx`, `rayos x`, `radiografia` o `placa`, aumentar la prioridad. No confundir con ultrasonido/TAC de la misma zona.

### 059. Cultivo Faringeo

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `C-FAR`
- **aliases_directos:** `Cultivo Faringeo`; `Cultivo faríngeo`; `cultivo de garganta`; `exudado faríngeo`; `estudio de garganta`; `cultivo para infección de garganta`; `cultivo garganta`; `exudado faringeo`; `frotis faringeo`; `cultivo de faringe`; `infeccion garganta cultivo`
- **terminos_relacionados:** `garganta`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 060. Ecocardiograma

- **tipo:** `Estudio`
- **área/modalidad:** `Especiales`
- **clave:** `ECO`
- **aliases_directos:** `Ecocardiograma`; `eco del corazón`; `ultrasonido del corazón`; `ecografía cardíaca`; `estudio de estructura y función del corazón`; `ecocardiografia`; `eco cardiaco`; `ultrasonido cardiaco`; `ultrasonido corazon`; `echo cardiaco`
- **terminos_relacionados:** `corazon`
- **errores_probables:** `ultra sonido`; `ultrason`; `ultrasonio`; `ultrasonido`
- **desambiguacion:** 'eco' sola es ambigua: combinar con corazón/cardiaco para priorizar ecocardiograma. Con abdomen/pelvis/renal/etc. priorizar ultrasonido correspondiente.

### 061. T3 Libre (Triyodotironina Libre)

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `T3-L`
- **aliases_directos:** `T3 Libre (Triyodotironina Libre)`; `T3 libre`; `triyodotironina libre`; `FT3`; `hormona tiroidea T3 libre`; `prueba de tiroides T3`; `t3l`; `free t3`
- **terminos_relacionados:** `sangre`; `tiroides`
- **errores_probables:** `tiroide`; `tiroides`; `tiroidis`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 062. Nitrogeno Ureico en Suero (BUN)

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `NITRO-S`
- **aliases_directos:** `Nitrogeno Ureico en Suero (BUN)`; `Nitrógeno ureico en suero`; `BUN`; `nitrógeno ureico en sangre`; `urea BUN`; `prueba de función renal`; `blood urea nitrogen`; `nitrogeno ureico sangre`; `nitrogeno ureico serico`; `azoados bun`
- **terminos_relacionados:** `sangre`; `rinon`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 063. Coprologico

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `CPL`
- **aliases_directos:** `Coprologico`; `Coprológico`; `examen de heces`; `análisis de materia fecal`; `estudio de excremento`; `copro`; `examen fecal`; `analisis fecal`; `heces`; `materia fecal`; `copro general`
- **terminos_relacionados:** `heces`; `intestino`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** No tratar 'coproparasitoscópico' como equivalente exacto salvo que el catálogo confirme componentes; puede ser búsqueda relacionada.

### 064. Ultrasonido Testicular

- **tipo:** `Estudio`
- **área/modalidad:** `USG`
- **clave:** `USG-TE`
- **aliases_directos:** `Ultrasonido Testicular`; `USG testicular`; `ultrasonido de testículos`; `eco escrotal`; `ultrasonido de escroto`; `usg testiculos`; `eco testicular`; `ecografia escrotal`; `ultrasonido escroto`; `sonografia testicular`
- **terminos_relacionados:** `testiculo`
- **errores_probables:** `ultra sonido`; `ultrason`; `ultrasonio`; `ultrasonido`
- **desambiguacion:** Si la consulta incluye `ultrasonido`, `usg`, `eco` o `ecografia` más la zona anatómica, aumentar la prioridad. No confundir con radiografía/TAC de la misma zona.

### 065. V.D.R.L. (reacciones seroluéticas) en campo oscuro, 286

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `VDRL`
- **aliases_directos:** `V.D.R.L. (reacciones seroluéticas) en campo oscuro, 286`; `VDRL`; `prueba de sífilis`; `examen para sífilis`; `serología de sífilis`; `prueba sanguínea para sífilis`; `prueba sifilis`; `serologia sifilis`; `tamizaje sifilis`; `venereal disease research laboratory`
- **terminos_relacionados:** `sangre`; `ets`; `sifilis`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 066. Relacion Microalbumina/creatinina en Orina Ocasional (2622)

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `ALB/CREAT`
- **aliases_directos:** `Relacion Microalbumina/creatinina en Orina Ocasional (2622)`; `Relación microalbúmina/creatinina en orina`; `microalbuminuria`; `albúmina creatinina`; `ACR en orina`; `estudio de daño renal en orina`; `acr`; `uacr`; `albumina creatinina orina`; `microalbumina creatinina`; `cociente albumina creatinina`
- **terminos_relacionados:** `orina`; `rinon`; `vias urinarias`
- **errores_probables:** `creatinina`; `creatnina`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 067. Acs. HIV (Sida) Clave 2136

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `HIV`
- **aliases_directos:** `Acs. HIV (Sida) Clave 2136`; `Prueba de VIH`; `HIV`; `prueba de sida`; `anticuerpos VIH`; `examen de VIH en sangre`; `test de VIH`; `vih`; `prueba vih`; `prueba sida`; `test hiv`
- **terminos_relacionados:** `sangre`; `ets`; `vih`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 068. Examen Prenupcial (por Persona)

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `PRENUP`
- **aliases_directos:** `Examen Prenupcial (por Persona)`; `Examen prenupcial`; `estudios prenupciales`; `análisis antes de casarse`; `certificado prenupcial`; `pruebas de laboratorio para matrimonio`; `prenupcial`; `examen prematrimonial`; `analisis matrimonio`; `estudios para casarse`
- **terminos_relacionados:** `—`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 069. Reacciones Febriles

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `R.FEBRI`
- **aliases_directos:** `Reacciones Febriles`; `pruebas febriles`; `reacciones de Widal`; `prueba para tifoidea`; `estudio de aglutinaciones febriles`; `widal`; `prueba widal`; `aglutinaciones febriles`; `tifico paratifico brucella proteus`
- **terminos_relacionados:** `sangre`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 070. Perfil Hormonal Basico(ginecologico)

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `PGINEC`
- **aliases_directos:** `Perfil Hormonal Basico(ginecologico)`; `Perfil hormonal básico ginecológico`; `perfil hormonal femenino`; `hormonas femeninas`; `estudios hormonales para mujer`; `perfil ginecológico hormonal`; `perfil hormonal ginecologico`; `hormonas ginecologicas`; `panel hormonal mujer`; `perfil hormonal basico mujer`
- **terminos_relacionados:** `sangre`; `ginecologia`; `fertilidad`; `mujer`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** No asumir qué hormonas incluye el perfil: usar sólo nombre del catálogo y aliases de intención.

### 071. Pierna AP. y LAT. (Adulto)

- **tipo:** `Estudio`
- **área/modalidad:** `Rayos X`
- **clave:** `PIERNA-ADUL`
- **aliases_directos:** `Pierna AP. y LAT. (Adulto)`; `Radiografía de pierna`; `rayos X de pierna`; `placa de pierna`; `pierna AP y lateral`; `RX pierna adulto`; `rx pierna`; `radiografia pierna`; `placa pierna`; `rayos x pierna`
- **terminos_relacionados:** `huesos`
- **errores_probables:** `radiografia`; `radiogrfia`; `radiografiaa`; `rayosx`
- **desambiguacion:** Si la consulta incluye `rx`, `rayos x`, `radiografia` o `placa`, aumentar la prioridad. No confundir con ultrasonido/TAC de la misma zona.

### 072. Antigeno Prostatico Libre Clave 1473

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `PSA-LIBRE`
- **aliases_directos:** `Antigeno Prostatico Libre Clave 1473`; `PSA libre`; `antígeno prostático libre`; `antígeno de próstata libre`; `examen de próstata`; `prueba PSA libre`; `free psa`; `fpsa`; `antigeno prostatico libre`
- **terminos_relacionados:** `sangre`; `prostata`; `hombre`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** Requiere boost por token 'libre'; si sólo dice PSA mostrar también PSA total arriba o junto, según catálogo.

### 073. DUO SARSCOV2-INFLUENZA A+b

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `DUO COV-INF`
- **aliases_directos:** `DUO SARSCOV2-INFLUENZA A+b`; `Prueba dúo COVID e influenza A/B`; `SARS-CoV-2 e influenza`; `prueba COVID y gripe`; `test COVID influenza`; `prueba respiratoria COVID influenza`; `covid influenza`; `covid flu`; `sars cov 2 influenza`; `sars-cov-2 influenza a b`; `prueba covid gripe`; `duo covid flu`
- **terminos_relacionados:** `sangre`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 074. BHC de 6 a 12 años

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `BHC6A12A`
- **aliases_directos:** `BHC de 6 a 12 años`; `Biometría hemática completa`; `BHC`; `biometría hemática infantil`; `biometría para niños de 6 a 12 años`; `hemograma infantil`; `conteo sanguíneo completo`; `glóbulos rojos, glóbulos blancos y plaquetas`; `biometria hematica niño`; `bhc niño`; `bhc pediatrica`; `hemograma pediatrico`; `cbc pediatric`; `biometria 6 12 años`
- **terminos_relacionados:** `sangre`; `niño`
- **errores_probables:** `biometia`; `biometriaa`; `biometria`; `ematica`; `hematika`; `hemática`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 075. Fraccion Beta (Cuantificacion Hgc)

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `F.B.`
- **aliases_directos:** `Fraccion Beta (Cuantificacion Hgc)`; `Fracción beta hCG cuantitativa`; `beta hCG`; `hormona del embarazo cuantitativa`; `prueba de embarazo cuantitativa en sangre`; `niveles de hCG`; `beta hcg cuantitativa`; `bhcg cuantitativa`; `hcg cuantitativa`; `gch cuantitativa`; `fraccion beta hcg`; `hormona embarazo cuantitativa`
- **terminos_relacionados:** `sangre`; `embarazo`
- **errores_probables:** `embaraszo`; `embaraso`
- **desambiguacion:** Con 'cuantitativa', niveles, beta-hCG priorizar esta; con 'sí/no', cualitativa, prueba embarazo sangre priorizar PIE.

### 076. Tomografía de Abdomen Contrastada

- **tipo:** `Estudio`
- **área/modalidad:** `Tomografia`
- **clave:** `TAC-ABDSC`
- **aliases_directos:** `Tomografía de Abdomen Contrastada`; `TAC abdominal con contraste`; `tomografía de abdomen con contraste`; `CT abdomen contrastado`; `tac abdomen con contraste`; `tc abdomen contrastada`; `ct abdomen with contrast`; `tomografia abdominal contrastada`
- **terminos_relacionados:** `abdomen`; `intestino`
- **errores_probables:** `tomografia`; `tomogrfia`; `tomografiaa`
- **desambiguacion:** Con 'con contraste/contrastada' priorizar TAC-ABDSC.

### 077. USG Renal y Vias Urinarias

- **tipo:** `Estudio`
- **área/modalidad:** `USG`
- **clave:** `USG RE,VU`
- **aliases_directos:** `USG Renal y Vias Urinarias`; `Ultrasonido renal y vías urinarias`; `USG riñones y vías urinarias`; `ultrasonido de riñones y vejiga`; `eco renal y urinario`; `usg renal vias urinarias`; `ultrasonido rinones vejiga`; `eco renal vejiga`; `ultrasonido aparato urinario`; `usg vias urinarias`
- **terminos_relacionados:** `rinon`; `vias urinarias`; `infeccion urinaria`
- **errores_probables:** `ultra sonido`; `ultrason`; `ultrasonio`; `ultrasonido`; `riñon`; `riñón`; `rinones`; `riñones`
- **desambiguacion:** Si la consulta incluye `ultrasonido`, `usg`, `eco` o `ecografia` más la zona anatómica, aumentar la prioridad. No confundir con radiografía/TAC de la misma zona.

### 078. BHC de 1 a 6 Años.

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `BHC1A6A`
- **aliases_directos:** `BHC de 1 a 6 Años`; `Biometría hemática completa`; `BHC`; `biometría hemática infantil`; `biometría para niños de 1 a 6 años`; `hemograma infantil`; `conteo sanguíneo completo`; `glóbulos rojos, glóbulos blancos y plaquetas`; `biometria hematica niño`; `bhc niño`; `bhc pediatrica`; `hemograma pediatrico`; `cbc pediatric`; `biometria 1 6 años`
- **terminos_relacionados:** `sangre`; `niño`
- **errores_probables:** `biometia`; `biometriaa`; `biometria`; `ematica`; `hematika`; `hemática`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 079. Columna Dorsal AP. y LAT. Adulto

- **tipo:** `Estudio`
- **área/modalidad:** `Rayos X`
- **clave:** `COL-D/ADULT`
- **aliases_directos:** `Columna Dorsal AP. y LAT. Adulto`; `Radiografía de columna dorsal`; `rayos X de columna torácica`; `columna dorsal AP y lateral`; `placa de espalda media`; `RX dorsal`; `radiografia dorsal`; `rx toracica columna`; `columna toracica`; `espalda media rayos x`
- **terminos_relacionados:** `huesos`
- **errores_probables:** `radiografia`; `radiogrfia`; `radiografiaa`; `rayosx`; `columa`; `colunma`
- **desambiguacion:** Si la consulta incluye `rx`, `rayos x`, `radiografia` o `placa`, aumentar la prioridad. No confundir con ultrasonido/TAC de la misma zona.

### 080. Papanicolaou

- **tipo:** `Estudio`
- **área/modalidad:** `Especiales`
- **clave:** `PAPS`
- **aliases_directos:** `Papanicolaou`; `PAP`; `citología cervical`; `estudio del cuello uterino`; `prueba de Papanicolaou`; `citología cervicovaginal`; `papanicolau`; `citologia cervical`; `citologia cervicovaginal`; `pap smear`
- **terminos_relacionados:** `ginecologia`; `papiloma`
- **errores_probables:** `papanicolau`; `papanicolao`; `papanicolou`; `papanicolauo`
- **desambiguacion:** Priorizar coincidencias específicas del nombre y la intención; los términos de área son secundarios.

### 081. Pelvis 2 Proyecciones (Adulto)

- **tipo:** `Estudio`
- **área/modalidad:** `Rayos X`
- **clave:** `PELV-2A`
- **aliases_directos:** `Pelvis 2 Proyecciones (Adulto)`; `Radiografía de pelvis 2 proyecciones`; `rayos X de pelvis`; `placa de pelvis`; `RX pelvis adulto`; `rx pelvis 2 proyecciones`; `radiografia pelvis dos vistas`; `pelvis dos proyecciones`
- **terminos_relacionados:** `huesos`; `pelvis`
- **errores_probables:** `radiografia`; `radiogrfia`; `radiografiaa`; `rayosx`; `pelbiz`; `pelvis`
- **desambiguacion:** Requiere boost por 2/dos proyecciones/vistas.

### 082. T4 (Total) Tiroxina Sérica Total

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `T-4`
- **aliases_directos:** `T4 (Total) Tiroxina Sérica Total`; `T4 total`; `tiroxina total`; `hormona tiroidea T4`; `prueba T4`; `análisis de tiroides T4 total`; `tt4`; `total t4`
- **terminos_relacionados:** `sangre`; `tiroides`
- **errores_probables:** `tiroide`; `tiroides`; `tiroidis`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 083. Perfil Drogas de Abuso (2)

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `PDA-2`
- **aliases_directos:** `Perfil Drogas de Abuso (2)`; `Perfil de drogas de abuso`; `antidoping`; `prueba de drogas`; `examen toxicológico`; `panel de drogas`; `detección de sustancias`; `toxicologico`; `panel drogas`; `prueba sustancias`; `drogas de abuso panel 2`
- **terminos_relacionados:** `sangre`; `drogas`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** Si el usuario no especifica panel 1/2, mostrar ambos perfiles de drogas sin inventar sustancias incluidas.

### 084. Abdomen Simple

- **tipo:** `Estudio`
- **área/modalidad:** `Rayos X`
- **clave:** `ABDS/A`
- **aliases_directos:** `Abdomen Simple`; `Radiografía de abdomen simple`; `rayos X de abdomen`; `placa de abdomen`; `RX abdomen simple`; `rx abdomen`; `radiografia abdomen`; `placa abdomen`; `abdomen simple rayos x`
- **terminos_relacionados:** `abdomen`; `intestino`
- **errores_probables:** `radiografia`; `radiogrfia`; `radiografiaa`; `rayosx`
- **desambiguacion:** Si la consulta incluye `rx`, `rayos x`, `radiografia` o `placa`, aumentar la prioridad. No confundir con ultrasonido/TAC de la misma zona.

### 085. Cultivo Vaginal

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `C-VAG`
- **aliases_directos:** `Cultivo Vaginal`; `exudado vaginal`; `cultivo de secreción vaginal`; `estudio para infección vaginal`; `análisis de flujo vaginal`; `cultivo flujo vaginal`; `cultivo secrecion vaginal`; `infeccion vaginal cultivo`
- **terminos_relacionados:** `ginecologia`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 086. Electrocardiograma

- **tipo:** `Estudio`
- **área/modalidad:** `Especiales`
- **clave:** `EKG`
- **aliases_directos:** `Electrocardiograma`; `EKG`; `ECG`; `electro del corazón`; `estudio del ritmo cardíaco`; `prueba del corazón`; `electro`; `electro corazon`
- **terminos_relacionados:** `corazon`
- **errores_probables:** `electro cardiograma`; `electrocardiogrma`; `electrocardiograma`
- **desambiguacion:** 'electro' o 'EKG/ECG' prioriza electrocardiograma; con 'esfuerzo/ejercicio/ergometria' priorizar EKG-ESF; con 'reposo/interpretacion/cardiologo' priorizar EKG/CARDIOLO.

### 087. T3 Total

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `T3 TOTAL`
- **aliases_directos:** `T3 Total`; `triyodotironina total`; `hormona tiroidea T3`; `prueba T3`; `análisis de tiroides T3 total`; `tt3`; `total t3`
- **terminos_relacionados:** `sangre`; `tiroides`
- **errores_probables:** `tiroide`; `tiroides`; `tiroidis`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 088. Creatin-fosfokinasa (CPK) Clave 048

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `CR-CPK`
- **aliases_directos:** `Creatin-fosfokinasa (CPK) Clave 048`; `Creatinfosfoquinasa`; `creatina fosfoquinasa`; `CPK`; `CK`; `enzima muscular`; `prueba de daño muscular`; `creatina quinasa`; `creatine kinase`; `creatin fosfokinasa`
- **terminos_relacionados:** `sangre`; `musculo`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 089. Sangre Oculta en Heces

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `SOH`
- **aliases_directos:** `Sangre Oculta en Heces`; `prueba de sangre en excremento`; `sangre oculta fecal`; `FOBT`; `análisis de heces para sangre`; `sangre oculta heces`; `guayaco heces`
- **terminos_relacionados:** `heces`; `intestino`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** Sangre oculta en heces no es sinónimo de coprológico; sólo compartir grupo semántico 'heces'.

### 090. Testosterona Total Mas Libre.

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `TESTO-L`
- **aliases_directos:** `Testosterona Total Mas Libre`; `Testosterona total y libre`; `testosterona en sangre`; `niveles de testosterona`; `perfil de testosterona`; `hormona masculina`; `testosterona total libre`; `testosterona libre y total`; `perfil testosterona`; `hormona masculina testosterona`
- **terminos_relacionados:** `sangre`; `testiculo`; `fertilidad`
- **errores_probables:** `testosterna`; `testosteronaa`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 091. Perfil Prenatal 2

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `PPRE-2`
- **aliases_directos:** `Perfil Prenatal 2`; `estudios prenatales`; `análisis de embarazo`; `chequeo prenatal`; `paquete de laboratorio para embarazada`; `panel prenatal 2`; `estudios embarazo paquete 2`; `laboratorios prenatales 2`
- **terminos_relacionados:** `sangre`; `embarazo`; `prenatal`
- **errores_probables:** `embaraszo`; `embaraso`
- **desambiguacion:** Si sólo dice perfil prenatal, mostrar PPRE1 y PPRE-2; no asumir componentes no listados.

### 092. Tele de Tórax Pa y LAT (Adulto)

- **tipo:** `Estudio`
- **área/modalidad:** `Rayos X`
- **clave:** `TX-2ADUL`
- **aliases_directos:** `Tele de Tórax Pa y LAT (Adulto)`; `Tele de tórax PA y lateral`; `radiografía de tórax dos proyecciones`; `rayos X de pecho`; `placa de tórax`; `RX tórax adulto`; `rx torax pa lateral`; `radiografia torax 2 proyecciones`; `radiografia pecho pa lateral`; `placa torax dos vistas`
- **terminos_relacionados:** `torax`; `pulmones`
- **errores_probables:** `radiografia`; `radiogrfia`; `radiografiaa`; `rayosx`
- **desambiguacion:** Con 'PA y lateral', '2 proyecciones', 'dos vistas' priorizar TX-2ADUL.

### 093. Perfil Drogas de Abuso (1)

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `PDA-1`
- **aliases_directos:** `Perfil Drogas de Abuso (1)`; `Perfil de drogas de abuso`; `antidoping`; `prueba de drogas`; `examen toxicológico`; `panel de drogas`; `detección de sustancias`; `toxicologico`; `panel drogas`; `prueba sustancias`; `drogas de abuso panel 1`
- **terminos_relacionados:** `sangre`; `drogas`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** Si el usuario no especifica panel 1/2, mostrar ambos perfiles de drogas sin inventar sustancias incluidas.

### 094. Acs. Anti-hepatitis C Clave 1452

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `ACS.ANT-HEPC`
- **aliases_directos:** `Acs. Anti-hepatitis C Clave 1452`; `Anticuerpos anti hepatitis C`; `anti-HCV`; `prueba de hepatitis C`; `anticuerpos VHC`; `examen de hepatitis C en sangre`; `anti hcv`; `anti-vhc`; `anticuerpos hepatitis c`; `hepatitis c anticuerpos`; `prueba vhc`
- **terminos_relacionados:** `sangre`; `ets`; `hepatitis`
- **errores_probables:** `epatitis`; `hepatits`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 095. (FSH) Hormona Folículo Estimulante

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `HFE`
- **aliases_directos:** `(FSH) Hormona Folículo Estimulante`; `FSH`; `hormona folículo estimulante`; `hormona foliculoestimulante`; `prueba FSH`; `estudio de fertilidad`; `hormona reproductiva`; `folitropina`; `fertilidad fsh`; `follicle stimulating hormone`
- **terminos_relacionados:** `sangre`; `fertilidad`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 096. (LH) Hormona Luteinizante

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `HLUT`
- **aliases_directos:** `(LH) Hormona Luteinizante`; `LH`; `hormona luteinizante`; `prueba LH`; `estudio de ovulación`; `hormona reproductiva`; `análisis de fertilidad`; `lutropina`; `ovulacion lh`; `luteinizing hormone`
- **terminos_relacionados:** `sangre`; `fertilidad`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 097. Ag. de Superficie Hepatitis B (Hbs Ag) Clave 1470

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `MHEP-B`
- **aliases_directos:** `Ag. de Superficie Hepatitis B (Hbs Ag) Clave 1470`; `Antígeno de superficie de hepatitis B`; `HBsAg`; `prueba de hepatitis B`; `antígeno HBs`; `examen de hepatitis B en sangre`; `hbs ag`; `antigeno superficie hepatitis b`; `antigeno australia`; `hepatitis b antigeno`
- **terminos_relacionados:** `sangre`; `ets`; `hepatitis`
- **errores_probables:** `epatitis`; `hepatits`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 098. Vph-pcr Clave 2120

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `VPH-PCR`
- **aliases_directos:** `Vph-pcr Clave 2120`; `PCR para VPH`; `prueba de virus del papiloma humano`; `VPH por PCR`; `HPV PCR`; `detección de papiloma humano`; `vph pcr`; `papiloma pcr`; `virus papiloma humano pcr`; `prueba molecular vph`
- **terminos_relacionados:** `ginecologia`; `ets`; `papiloma`
- **errores_probables:** `papilomma`; `papiloma humano`
- **desambiguacion:** Priorizar por nombre/abreviatura/analito. Los términos genéricos `sangre`, `laboratorio`, `análisis` sólo son señales secundarias.

### 099. Prueba Inmuno de Embarazo en Orina

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `PIE-O`
- **aliases_directos:** `Prueba Inmuno de Embarazo en Orina`; `Prueba de embarazo en orina`; `test de embarazo en orina`; `prueba inmunológica de embarazo`; `hCG en orina`; `embarazo orina`; `prueba embarazo orina`; `hcg orina`; `gch orina`; `test embarazo`
- **terminos_relacionados:** `orina`; `embarazo`
- **errores_probables:** `embaraszo`; `embaraso`
- **desambiguacion:** Con 'orina/casera/tira' + embarazo priorizar PIE-O. Con sangre/suero priorizar PIE/F.B.

### 100. Colposcopia y Cultivo Vaginal

- **tipo:** `Paquete`
- **área/modalidad:** `Especiales`
- **clave:** `COLPO-VAG`
- **aliases_directos:** `Colposcopia y Cultivo Vaginal`; `revisión ginecológica`; `estudio de cuello uterino`; `cultivo vaginal`; `examen para infección vaginal`; `colposcopia cultivo`; `colpo cultivo vaginal`; `revision cervix cultivo vaginal`; `paquete ginecologico cultivo`
- **terminos_relacionados:** `ginecologia`; `papiloma`
- **errores_probables:** `colposopia`; `colposcopiaa`; `colposcopía`
- **desambiguacion:** Priorizar coincidencias específicas del nombre y la intención; los términos de área son secundarios.

### 101. Electrocardiograma con Esfuerzo

- **tipo:** `Estudio`
- **área/modalidad:** `Especiales`
- **clave:** `EKG-ESF`
- **aliases_directos:** `Electrocardiograma con Esfuerzo`; `prueba de esfuerzo`; `EKG de esfuerzo`; `ECG de esfuerzo`; `prueba de corazón en ejercicio`; `ergometría`; `prueba esfuerzo`; `ergometria`; `ecg esfuerzo`; `ekg esfuerzo`; `electrocardiograma ejercicio`; `stress test`
- **terminos_relacionados:** `corazon`
- **errores_probables:** `electro cardiograma`; `electrocardiogrma`; `electrocardiograma`
- **desambiguacion:** Con 'esfuerzo', 'ejercicio', 'caminadora', 'ergometría' debe superar a EKG simple.

### 102. Perfil Hormonal Masculino

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `P.HMASC`
- **aliases_directos:** `Perfil Hormonal Masculino`; `hormonas masculinas`; `estudios hormonales para hombre`; `chequeo hormonal masculino`; `perfil de hormonas en sangre`; `panel hormonal hombre`; `hormonas hombre`; `estudio hormonal masculino`
- **terminos_relacionados:** `sangre`; `testiculo`; `fertilidad`; `hombre`
- **errores_probables:** `usar fuzzy global`
- **desambiguacion:** No asumir qué hormonas incluye el perfil: usar sólo nombre del catálogo y aliases de intención.

### 103. Perfil Prenatal 1

- **tipo:** `Estudio`
- **área/modalidad:** `Laboratorio`
- **clave:** `PPRE1`
- **aliases_directos:** `Perfil Prenatal 1`; `estudios prenatales`; `análisis de embarazo`; `chequeo prenatal`; `paquete de laboratorio para embarazada`; `panel prenatal 1`; `estudios embarazo paquete 1`; `laboratorios prenatales 1`
- **terminos_relacionados:** `sangre`; `embarazo`; `prenatal`
- **errores_probables:** `embaraszo`; `embaraso`
- **desambiguacion:** Si sólo dice perfil prenatal, mostrar PPRE1 y PPRE-2; no asumir componentes no listados.

## 7. Reglas especiales de implementación

### 7.1 Claves y abreviaturas

- Una clave nunca se busca por substring si tiene 2–4 caracteres. Debe ser token completo o igualdad exacta.
- `PIE` es un caso crítico: como clave significa prueba de embarazo en suero, pero como palabra normal `pie` es anatomía. El contexto decide.
- `ECO` puede significar ecocardiograma o usarse coloquialmente por ecografía. Con `corazón/cardiaco` → ecocardiograma. Con una zona anatómica → ultrasonido de esa zona.
- `TP` y `TPT/TTPa/aPTT` deben mantenerse separados.
- `PSA` sin `libre` prioriza PSA total; `PSA libre/fPSA` prioriza el estudio libre.

### 7.2 Búsquedas muy amplias

Para consultas de una sola palabra genérica (`sangre`, `orina`, `tiroides`, `corazón`, `embarazo`, `próstata`, `riñón`, `rodilla`, etc.):

1. Recuperar todos los estudios etiquetados con ese grupo semántico.
2. Mostrar primero estudios cuyo **nombre o alias directo** contenga la palabra.
3. Después mostrar perfiles/paquetes relacionados.
4. No inventar que una prueba diagnostica una enfermedad específica; el objetivo es encontrar el estudio del catálogo, no dar diagnóstico.

### 7.3 Modificador anatómico + modalidad

Usar combinaciones como `rodilla + rx`, `rodilla + ultrasonido`, `abdomen + tac`, `mama + mamografia`, `mama + ultrasonido` para resolver estudios de la misma región.

### 7.4 Singular/plural y género

Normalizar singular/plural y variantes comunes: `riñón/riñones`, `mama/mamas/seno/senos`, `testículo/testículos`, `rodilla/rodillas`. No hace falta duplicar todos los términos si el motor tiene stemming o lematización en español.

## 8. Observaciones detectadas en el archivo fuente

- **Glucosa en Suero (`GLU.S`)** aparece en el Excel con área `Rayos X`. Para búsqueda semántica debe tratarse como **laboratorio/análisis de sangre**, sin modificar necesariamente el dato original de catálogo hasta validarlo con el equipo.
- **Química Sanguínea de 27 Elementos (`PB4-27`)** contiene en la descripción una mención a `Química sanguínea de 17 elementos`. Tratarlo como error de texto y **no usar `17 elementos` como alias**.
- Los perfiles/paquetes cuyo contenido exacto no está desglosado (`Perfil Tiroideo 1/3`, `Perfil Prenatal 1/2`, perfiles hormonales, drogas de abuso, químicas de N elementos) **no deben recibir componentes inventados**.
- `Coprológico` y un coproparasitoscópico pueden solaparse en lenguaje del paciente, pero no deben considerarse equivalentes clínicos exactos sin confirmar el contenido del estudio.

## 9. Pseudocódigo recomendado

```ts
function searchStudies(rawQuery, studies) {
  const q = normalize(rawQuery);

  return studies
    .map(study => {
      let score = 0;

      if (exactCodeMatch(q, study.code)) score += 120;
      if (exactPhraseMatch(q, normalize(study.name))) score += 110;
      score += directAliasScore(q, study.aliases_directos);      // hasta 95
      score += multiTokenScore(q, study.aliases_directos);       // hasta 85
      score += fuzzyScore(q, study.aliases_directos, {
        minTokenLength: 5,
        distance1: true,
        distance2FromLength: 8
      });                                                        // hasta 75
      score += semanticTagScore(q, study.terminos_relacionados); // hasta 35
      score += contextBoosts(q, study);                          // modalidad/anatomía
      score += disambiguationPenaltyOrBoost(q, study);

      return { study, score };
    })
    .filter(x => x.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score);
}
```

## 10. Casos de prueba mínimos

- `sangre` → Debe incluir Grupo y Factor Rh y estudios sanguíneos relacionados; si la intención incluye tipo/grupo/RH, Grupo y Factor Rh debe quedar arriba.
- `tipo de sangre` → Grupo y Factor Rh debe quedar #1.
- `que sangre soy` → Grupo y Factor Rh debe quedar #1.
- `glicosilada` → Hemoglobina Glucosilada.
- `azucar 3 meses` → Hemoglobina Glucosilada.
- `azucar en sangre` → Glucosa en Suero primero; HbA1c y químicas como relacionados.
- `tiroide` → Perfiles tiroideos, TSH, T3/T4 y USG tiroideo; el contexto de sangre vs ultrasonido cambia el orden.
- `eco tiroides` → Ultrasonido Tiroideo.
- `psa libre` → Antígeno Prostático Libre.
- `prostata` → PSA total/libre y ultrasonido prostático.
- `embaraso sangre` → Prueba de Embarazo en Suero; si dice cuantitativa/beta, Fracción Beta hCG.
- `papanicolau` → Papanicolaou.
- `mamografia` → Mastografía.
- `ultrasonido seno` → Ultrasonido Mamario Bilateral.
- `eco corazon` → Ecocardiograma.
- `electro esfuerzo` → Electrocardiograma con Esfuerzo.
- `coagulacion` → TP y TPT.
- `riñon` → Creatinina, BUN, ACR, USG renal y relacionados.
- `uro cultivo` → Urocultivo.
- `pie rayos x` → Pie AP y LAT Adulto, no prueba de embarazo.
- `tac cabeza sin contraste` → Tomografía de Cráneo Simple.
- `tac abdomen con contraste` → Tomografía de Abdomen Contrastada.
- `rodillas comparativas` → Rodillas Comparativas AP y LAT.
- `anti hcv` → Anticuerpos anti-hepatitis C.
- `hbsag` → Antígeno de Superficie Hepatitis B.
- `hpv pcr` → VPH-PCR.

## 11. Fuentes de terminología consultadas

Estas fuentes se utilizaron para validar nomenclaturas y aliases médicos frecuentes. El catálogo interno del laboratorio sigue siendo la autoridad para nombres comerciales, claves y contenido exacto.

- MedlinePlus – Análisis de sangre / hemograma: https://www.medlineplus.gov/spanish/bloodcounttests.html
- MedlinePlus – Hemoglobina A1c: https://medlineplus.gov/spanish/pruebas-de-laboratorio/prueba-de-hemoglobina-a1c/
- MedlinePlus – Pruebas y exámenes para la tiroides: https://medlineplus.gov/spanish/thyroidtests.html
- MedlinePlus – TSH: https://www.medlineplus.gov/spanish/pruebas-de-laboratorio/prueba-de-tsh/
- MedlinePlus – T3: https://www.medlineplus.gov/spanish/pruebas-de-laboratorio/pruebas-de-triyodotironina-t3/
- MedlinePlus – Tiempo de protrombina: https://medlineplus.gov/spanish/ency/article/003652.htm
- MedlinePlus – Prueba de embarazo / hCG: https://medlineplus.gov/spanish/pruebas-de-laboratorio/prueba-de-embarazo/
- MedlinePlus – PSA: https://medlineplus.gov/spanish/pruebas-de-laboratorio/prueba-de-psa-antigeno-prostatico-especifico/
- MedlinePlus – Creatinina: https://medlineplus.gov/spanish/pruebas-de-laboratorio/prueba-de-creatinina/
- MedlinePlus – Cociente microalbúmina/creatinina: https://www.medlineplus.gov/spanish/pruebas-de-laboratorio/cociente-de-microalbumina-y-creatinina/
- RadiologyInfo – Densitometría ósea DXA/DEXA: https://www.radiologyinfo.org/es/info/dexa
- RadiologyInfo – Mamografía: https://www.radiologyinfo.org/es/info/mammo
- RadiologyInfo – Ultrasonido abdominal: https://www.radiologyinfo.org/es/info/abdominus
- RadiologyInfo – Ultrasonido de pelvis: https://www.radiologyinfo.org/es/info/pelvus
- RadiologyInfo – TC de cabeza: https://www.radiologyinfo.org/es/info/headct

---

**Uso recomendado con Claude:** cargar este archivo completo como contexto del proyecto y pedirle que convierta cada bloque en un índice de búsqueda (`searchAliases`, `semanticTags`, `typoSeeds`, `disambiguationRules`) sin modificar los datos visibles del estudio.