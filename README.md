<!-- calidad:inicio -->
![Calidad](https://img.shields.io/badge/Calidad-100%2F100-green) ![Aprobado](https://img.shields.io/badge/Aprobado-SI-green) ![Cumple](https://img.shields.io/badge/Cumple-15%2F15-green) ![Duplicación](https://img.shields.io/badge/Duplicaci%C3%B3n-5.2%25-green) ![SEC](https://img.shields.io/badge/SEC-0-green) ![SQL](https://img.shields.io/badge/SQL-0-green) ![DBG](https://img.shields.io/badge/DBG-0-green) ![Capas](https://img.shields.io/badge/Capas-3-green) ![Tests](https://img.shields.io/badge/Tests-27-green) ![Cob](https://img.shields.io/badge/Cob-88.9%25-green) ![EP](https://img.shields.io/badge/EP-36-green)

**Calidad de servicios (heurístico):** índice **100/100** · cumple **15/15** · aprobado **SI** · capas **3**
Detalle completo en [`docs/EVALUACION.md`](docs/EVALUACION.md).
<!-- calidad:fin -->

## Asistente web

El asistente del frontend usa el proxy autenticado de la API:

- `POST /chat/analizar` (JWT)
- `POST /chat/analizar-imagen` (JWT, multipart, máximo 10 MB)
- `GET|POST /gastos/recurrentes/mios` (JWT)

Requiere `SERVICIO_IA_URL` apuntando al servicio de IA.
