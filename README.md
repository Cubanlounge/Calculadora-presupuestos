# Calculadora freelance de presupuestos digitales

Herramienta local en HTML, CSS y JavaScript vanilla para estimar presupuestos freelance de servicios digitales. Funciona abriendo `index.html` directamente en el navegador.

## Qué permite calcular

- Presupuestos por horas.
- Presupuestos por paquete.
- Presupuestos mensuales / retainer.
- Revisiones incluidas y revisiones extra.
- Extras seleccionables con precio editable.
- Recargo comercial opcional.
- Descuento e impuestos opcionales.
- Conversión visual a EUR, SEK y USD con tasas actuales si la API responde, o tasas locales de respaldo si falla.

La tarifa freelance, precio de paquete o cuota mensual se tratan como precio real de venta, no como coste interno.

## Cómo usar

1. Abre `index.html` directamente en el navegador.
2. Selecciona servicio, modelo de presupuesto y moneda.
3. Ajusta precios, revisiones, extras, descuento e impuestos.
4. Completa cliente, proyecto, alcance, entregables y notas si quieres un resumen comercial más completo.
5. Usa `Copiar resumen` para copiar el presupuesto en texto.
6. Usa `Imprimir / Guardar como PDF` para abrir la ventana de impresión.

Para guardar como PDF, selecciona `Microsoft Print to PDF` o `Guardar como PDF` como destino en la ventana de impresión. La herramienta no genera un PDF automático porque no usa dependencias externas como jsPDF o html2canvas.

## Archivos

- `index.html`: interfaz y campos del presupuesto.
- `assets/css/styles.css`: estilos responsive y reglas de impresión.
- `assets/js/services.js`: servicios, presets, extras, monedas, API de cambio y tasas de respaldo.
- `assets/js/calculator.js`: lógica pura de cálculo.
- `assets/js/app.js`: validación, renderizado, copiado, impresión y tipos de cambio.
- `docs/calculation-rules.md`: reglas de cálculo y límites.

## Verificación rápida

- Abrir `index.html` directamente.
- Probar modelos por horas, paquete y mensual.
- Confirmar que no aparecen `NaN` ni `undefined`.
- Probar EUR, SEK y USD.
- Probar `Copiar resumen`.
- Probar `Imprimir / Guardar como PDF` y elegir `Microsoft Print to PDF` o `Guardar como PDF`.

El presupuesto es orientativo. Revisa alcance, entregables, plazos, revisiones, impuestos y condiciones antes de enviarlo a un cliente.
