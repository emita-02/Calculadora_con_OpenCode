# Calculadora de Notas - EPN

Aplicación web para estudiantes de la Escuela Politécnica Nacional que calcula la nota final
del semestre (`bim1 + bim2`) y determina si aprueban la materia, si deben rendir el examen
supletorio (indicando la nota mínima que necesitan en ese examen) o si no alcanzan la nota
mínima para rendirlo.

## Reglas implementadas

| Condición (`suma = bim1 + bim2`) | Resultado |
|---|---|
| `suma >= 28` | Aprueba (exoneración, no rinde supletorio) |
| `18 <= suma <= 27.99` | Debe rendir el examen supletorio y se muestra la nota mínima que necesita |
| `suma < 18` | No alcanza para rendir el supletorio |

Nota mínima a obtener en el supletorio = `max(24, 48 - (bim1 + bim2))`
(se exige `rec >= 24` como mínimo absoluto y `bim1 + bim2 + rec >= 48` para pasar).

Rangos: `bim1` y `bim2` de 0 a 20 (decimales permitidos).

## Archivos

- `index.html` — estructura de la interfaz.
- `styles.css` — estilos modernos y responsive.
- `app.js` — validaciones y lógica de cálculo (JavaScript puro).
- `README.md` — este archivo.

## Cómo ejecutarla

**Opción 1 (más simple):** abre el archivo `index.html` con doble clic en cualquier navegador moderno (Chrome, Edge, Firefox). No necesita servidor ni internet.

**Opción 2 (servidor local):** desde una terminal en la carpeta del proyecto:

```bash
python -m http.server 8000
```

y visita <http://localhost:8000>.

**Opción 3 (VS Code):** instala la extensión *Live Server*, haz clic derecho sobre `index.html` y elige *Open with Live Server*.
