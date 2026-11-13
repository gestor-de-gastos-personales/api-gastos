<!-- evaluacion:inicio -->
# Evaluación — gestor-de-gastos-personales/api-gastos

> Documento **generado automáticamente** por la cátedra de Programación III (RepoSense + análisis de calidad + constancia). **No editar a mano**: se regenera en cada evaluación.
> Rama evaluada: `main`. Análisis **heurístico** (regex + métricas): es una criba para orientar la revisión, **no una nota**.
> Generado: 2026-11-13.

## 1. Veredicto

| Aspecto | Resultado |
|---|---|
| Tipo de proyecto | backend |
| Índice de calidad de servicios | **31/100** (mínimo 50) |
| Criterios cumplidos | **12/15** |
| Aprobado (semáforo) | **NO** |
| Código (LOC) | 2,995 |
| Archivos de código | 78 |
| Tests (archivos) | 24 |
| Cobertura de líneas | 88.2% (mínimo 80%) |
| Capas detectadas | presentacion, logica, datos |
| Pushes directos a `main` (sin PR) | 0 |

> **Aprobado** exige las compuertas críticas (**SEC**, **SQL**, **capas**, **índice ≥ 50** y **cobertura ≥ 80 %** cuando aplica) y tolera hasta **3 criterios en rojo** (12/15). No es una nota: sirve para ordenar y priorizar la revisión.

## 2. Autoría (RepoSense)

| Autor | Commits | Código (LOC) | Tests (LOC) | Docs (LOC) | Días activos | % del código |
|---|---:|---:|---:|---:|---:|---:|
| blevatino | 42 | 3,664 | 2,734 | 34 | 18 | 100% |

> _El LOC de autoría lo calcula RepoSense sobre el historial y puede diferir del LOC de código del análisis de calidad (que mira solo el estado de `main`)._

## 3. Constancia (IC) — todas las ramas

> El IC mide **cuándo** se trabajó (sesiones por semana, pausas y recencia), no cuánto ni con qué calidad. Se calcula sobre **todas las ramas** de todos los repositorios del alumno, no sólo `main`.

| Alumno | Sesiones | Cumplimiento | Pausa | Recencia | IC | Nivel | Para subir de nivel |
|---|--:|--:|--:|--:|--:|--|--|
| blevatino | 18 | 68% | 19 d | 93% | **58** | Aprueba | Cumplimiento 68% (mín. 100%); Pausa 19 d (máx. 5 d) |

> Para aprobar el IC: **2 sesiones por semana** sostenidas, sin pausas mayores a **10 días** y con actividad en las **últimas 2 semanas**. Se excluyen merges, bots y al docente. Zona horaria UTC-3.

## 4. Aspectos evaluados

Cada aspecto indica **qué mide**, **por qué importa** y **tu resultado**. Cuando el resultado está en rojo, se agregan preguntas para **investigar la causa** (no hay recetas: entender el porqué es parte de la evaluación).

### 1. Índice de calidad de servicios (indice) — A REVISAR

- **Qué mide:** Un resumen numérico (0-100) que combina todas las señales y métricas del análisis, con topes duros por duplicación.
- **Por qué importa:** Ordena y prioriza la revisión: un índice bajo indica varias señales que conviene mirar juntas.
- **Tu resultado:** índice **31/100** _(mínimo 50)_
- **Para investigar la causa:**
    - ¿En qué momento del proyecto se concentraron los problemas (arranque, integración de partes, cierre)?
    - ¿El índice bajó por muchas señales chicas o por una o dos graves?
    - ¿Se revisó el código integrado después de unir el trabajo de cada integrante?

### 2. Duplicación (DRY) (duplicacion) — OK

- **Qué mide:** Porcentaje de bloques de código repetidos (similitud) en el repositorio.
- **Por qué importa:** Cada copia se mantiene por separado: un arreglo hay que repetirlo y los defectos se multiplican.
- **Tu resultado:** **6.6%** de duplicación _(máximo 15%)_

### 3. Secretos hardcodeados (SEC) — OK

- **Qué mide:** Credenciales, tokens o claves escritos directamente en el código en vez de leerse de variables de entorno.
- **Por qué importa:** Un secreto en el repositorio queda expuesto en el historial aunque luego se borre, y compromete al servicio y a sus usuarios.
- **Tu resultado:** **0** secreto(s) hardcodeado(s) _(máximo 0)_

### 4. Consultas SQL por concatenación (SQL) — OK

- **Qué mide:** Consultas SQL armadas concatenando o interpolando valores en vez de usar parámetros.
- **Por qué importa:** Es la puerta clásica a inyección: un valor que llega de afuera puede cambiar la consulta.
- **Tu resultado:** **0** consulta(s) SQL por concatenación _(máximo 0)_

### 5. Separación en capas (capas) — OK

- **Qué mide:** Si el código está separado en capas reconocibles (backend: presentación / lógica / datos; frontend: vistas / servicios / estado).
- **Por qué importa:** Sin separación, cada archivo hace de todo y cualquier cambio toca varios lugares a la vez.
- **Tu resultado:** **3** capa(s) detectada(s): presentacion, logica, datos _(mínimo 2 capas (a partir de 150 LOC))_

### 6. Acceso a datos dentro del componente (HTTP) — OK

- **Qué mide:** Llamadas `fetch`/`axios` dentro de componentes de UI en vez de una capa de servicios/API.
- **Por qué importa:** Duplica la lógica de acceso a datos y acopla la vista al backend: un cambio de API toca muchos componentes.
- **Tu resultado:** **0** llamada(s) a la API dentro de componente(s) _(máximo 0)_

### 7. Depuración olvidada (DBG) — OK

- **Qué mide:** Mensajes de depuración olvidados (`console.log`, `print`, `debugger`).
- **Por qué importa:** Generan ruido en los registros, pueden filtrar datos y dan sensación de código sin terminar.
- **Tu resultado:** **0** mensaje(s) de depuración olvidado(s) _(máximo 0)_

### 8. Uso del tipo `any` (Any) — OK

- **Qué mide:** Uso de `any` en TypeScript, que desactiva la verificación de tipos.
- **Por qué importa:** Se pierde la ayuda del compilador justo donde los datos vienen de afuera (API, formularios).
- **Tu resultado:** **0** uso(s) de `any` _(máximo 2)_

### 9. Componente demasiado grande (BigC) — OK

- **Qué mide:** Componentes de UI muy extensos, que suelen mezclar render, estado y lógica.
- **Por qué importa:** Son difíciles de leer, probar y reutilizar, y sus cambios tienen efectos inesperados.
- **Tu resultado:** **0** componente(s) demasiado grande(s) _(máximo 1)_

### 10. Baja cohesión (Coh) — A REVISAR

- **Qué mide:** Una clase o unidad cuyos métodos y campos no están relacionados entre sí.
- **Por qué importa:** Una unidad que cambia por motivos distintos es frágil y cuesta entenderla.
- **Tu resultado:** **2** unidad(es) con baja cohesión _(máximo 0)_
- **Para investigar la causa:**
    - ¿La unidad agrupa cosas que en realidad pertenecen a lugares distintos?
    - ¿Cambia por motivos diferentes según la tarea?
    - ¿Se pensó su responsabilidad antes de escribirla, o se fue agregando?

### 11. Complejidad alta (Compl) — OK

- **Qué mide:** Complejidad ciclomática: cantidad de caminos posibles dentro de una función (condicionales, bucles, casos).
- **Por qué importa:** Muchos caminos = difícil de seguir y de probar; suelen esconderse casos sin cubrir.
- **Tu resultado:** **2** bloque(s) de complejidad alta _(máximo 5 por 1000 LOC (tenés 2995 LOC))_

### 12. Funciones/métodos largos o con muchos parámetros (Tam) — OK

- **Qué mide:** Tamaño de las funciones/métodos y cantidad de parámetros.
- **Por qué importa:** Una función que hace varias cosas cuesta leerla, nombrarla y reutilizarla.
- **Tu resultado:** **3** función/método(s) largos o con muchos parámetros _(máximo 10 por 1000 LOC)_

### 13. Acoplamiento alto (Acop) — A REVISAR

- **Qué mide:** Cuánto depende una unidad de las partes internas de otra.
- **Por qué importa:** Piezas muy enlazadas hacen que un cambio se propague y que sea difícil reemplazar partes.
- **Tu resultado:** **15** unidad(es) con acoplamiento alto _(máximo 2 por 1000 LOC)_
- **Para investigar la causa:**
    - ¿Las piezas se conocen en detalle entre sí (acceden a campos o estructuras internas)?
    - ¿El acceso a datos ocurre desde lugares que no son los responsables?
    - ¿Se puede cambiar una parte sin tocar las demás?

### 14. Cobertura de tests (Cob) — OK

- **Qué mide:** Porcentaje de líneas de código ejecutadas por la suite de tests (cobertura real, no cantidad de archivos de test).
- **Por qué importa:** Un test que existe pero no ejecuta el código no protege de nada: la cobertura muestra qué partes quedan sin verificar.
- **Tu resultado:** **88.2%** de líneas cubiertas · fuente: ejecución: vitest _(mínimo 80% de líneas)_

### 15. Endpoints del backend (EP) — OK

- **Qué mide:** Cantidad de endpoints (rutas HTTP) expuestos por el backend.
- **Por qué importa:** El backend se mide por lo que expone: pocos endpoints sugiere poca funcionalidad de servicio.
- **Tu resultado:** **35** endpoint(s) _(mínimo 5)_

## 5. Observaciones y qué falta

Criterios que hoy están en rojo y, para cada uno, una explicación breve de **cómo corregirlo** hasta alcanzar el nivel de aprobación (perfil `exigente`):

| Criterio | Resultado actual | Meta | Brecha | Cómo alcanzarlo |
|---|---|---|---|---|
| Índice de calidad de servicios (indice) | índice **31/100** | mínimo 50 | faltan 19 pts | El índice sólo penaliza lo que **excede** los umbrales de cada criterio: si tenés todo en verde, el índice es 100. Si está en rojo, mirá la columna **Brecha** y los criterios en rojo; corregí primero duplicación, SEC, SQL y capas. Meta del perfil exigente: ≥50. |
| Baja cohesión (Coh) | **2** unidad(es) con baja cohesión | máximo 0 | 2 clase(s) a separar | Separá la clase en unidades con una sola responsabilidad: si los métodos cambian por motivos distintos, son clases distintas. Meta: 0 clases con baja cohesión. |
| Acoplamiento alto (Acop) | **15** unidad(es) con acoplamiento alto | máximo 2 por 1000 LOC | 15 hallazgo(s); el máximo para 2,995 LOC es 6.0 | Hacé que cada unidad dependa de una interfaz o de un módulo de servicio, no de los detalles internos de otra; evitá acceder a campos ajenos. Meta: ≤2 por 1000 LOC. |

> Empezá por las señales de seguridad (**SEC**, **SQL**) y por la **duplicación**: son las que más pesan en el índice y las más rápidas de verificar a ojo. Después de corregir, volvé a correr la medición: el semáforo se recalcula sobre `main`.

## 6. Actividad en clase y fuera de clase

> Se consideran las **27 clases** del período (miércoles y viernes, según `config/constancia.json`; feriados y semanas sin clase descontados). Para cada alumno se muestra la actividad **en cada clase** y también la actividad **fuera de los días de clase** (fines de semana u otros días). `Commits` = commits de trabajo (no-merge); `Merges` = merges de PR (también son push). Los días sin actividad dicen **sin actividad**.

### blevatino

**15/27 clases con actividad** · total del período: 57 commits · 23 merges

| Fecha | Actividad | Repositorios | Commits / merges |
|---|:--:|---|--:|
| 2026-08-14 | No | sin actividad | 0 / 0 |
| 2026-08-19 | No | sin actividad | 0 / 0 |
| 2026-08-21 | No | sin actividad | 0 / 0 |
| 2026-08-26 | **Sí** | api-gastos | 2 / 1 |
| 2026-08-28 | No | sin actividad | 0 / 0 |
| 2026-09-02 | No | sin actividad | 0 / 0 |
| 2026-09-04 | **Sí** | api-gastos | 1 / 0 |
| 2026-09-09 | **Sí** | api-gastos | 0 / 1 |
| 2026-09-11 | No | sin actividad | 0 / 0 |
| 2026-09-16 | No | sin actividad | 0 / 0 |
| 2026-09-18 | No | sin actividad | 0 / 0 |
| 2026-09-23 | **Sí** | api-gastos | 2 / 1 |
| 2026-09-25 | **Sí** | api-gastos | 1 / 1 |
| 2026-09-30 | **Sí** | api-gastos | 1 / 1 |
| 2026-10-02 | **Sí** | api-gastos | 2 / 1 |
| 2026-10-07 | **Sí** | api-gastos | 5 / 4 |
| 2026-10-09 | **Sí** | api-gastos | 1 / 0 |
| 2026-10-14 | **Sí** | servicio-ia | 0 / 2 |
| 2026-10-16 | **Sí** | servicio-ia | 4 / 1 |
| 2026-10-21 | **Sí** | api-gastos, bot-telegram | 11 / 0 |
| 2026-10-23 | No | sin actividad | 0 / 0 |
| 2026-10-28 | **Sí** | api-gastos, bot-telegram, servicio-ia | 3 / 3 |
| 2026-10-30 | **Sí** | front-web | 1 / 0 |
| 2026-11-04 | No | sin actividad | 0 / 0 |
| 2026-11-06 | No | sin actividad | 0 / 0 |
| 2026-11-11 | **Sí** | api-gastos, bot-telegram, front-web, servicio-ia | 23 / 7 |
| 2026-11-13 | No | sin actividad | 0 / 0 |

**Fuera de clase:** 6 fecha(s) con actividad · 74 commits · 10 merges

| Fecha | Repositorios | Commits / merges |
|---|---|--:|
| 2026-10-13 | api-gastos, bot-telegram, servicio-ia | 8 / 1 |
| 2026-10-22 | api-gastos, bot-telegram, servicio-ia | 40 / 6 |
| 2026-10-27 | api-gastos, bot-telegram | 2 / 0 |
| 2026-10-29 | api-gastos, bot-telegram, servicio-ia | 5 / 0 |
| 2026-11-07 | api-gastos, bot-telegram, servicio-ia | 3 / 0 |
| 2026-11-12 | api-gastos, front-web, servicio-ia | 16 / 3 |

## 7. Anexo: dónde mirar

Archivos donde el análisis encontró cada señal en rojo (sin número de línea, a propósito):

**Baja cohesión (Coh)** — 2 archivo(s):
- `src/auth/services/auth.service.ts`
- `src/gastos/services/gastos-consulta.service.ts`

**Acoplamiento alto (Acop)** — 15 archivo(s):
- `src/auth/controllers/auth.controller.ts`
- `src/auth/controllers/telegram-auth.controller.ts`
- `src/auth/services/auth.service.ts`
- `src/categorias/services/categorias.service.ts`
- `src/common/filters/prisma-client-exception.filter.ts`
- `src/gastos/controllers/gastos-bot.controller.ts`
- `src/gastos/controllers/gastos-detalle.controller.ts`
- `src/gastos/controllers/gastos-recurrentes.controller.ts`
- `src/gastos/services/gastos-consulta.service.ts`
- `src/gastos/services/gastos-recurrentes.service.ts`
- `src/gastos/services/gastos-resumen.service.ts`
- `src/gastos/services/gastos.service.ts`
- `src/gastos/services/usuarios-gastos.service.ts`
- `src/grupos/grupos.service.ts`
- `src/presupuestos/presupuestos.controller.ts`

---
_Informe generado por la cátedra. Los umbrales corresponden al perfil `exigente`. Ante dudas, revisá el archivo señalado y el criterio en `CRITERIOS-CALIDAD.md`._
<!-- evaluacion:fin -->
