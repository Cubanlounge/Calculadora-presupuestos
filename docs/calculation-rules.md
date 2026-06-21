# Reglas de cálculo

La calculadora está pensada para freelancers que venden servicios digitales. La tarifa por hora, el precio del paquete y la cuota mensual representan precio real de venta. No se calcula un coste interno separado ni un margen de beneficio interno.

## Modelos de presupuesto

```text
Por horas:
base_servicio = horas_estimadas * tarifa_freelance_hora

Por paquete:
base_servicio = precio_paquete

Mensual / retainer:
base_servicio = cuota_mensual * número_de_meses + coste_configuración_inicial
```

## Orden de cálculo

```text
ajuste_complejidad = base_servicio * (multiplicador_complejidad - 1)

subtotal_complejidad = base_servicio + ajuste_complejidad

ajuste_urgencia = subtotal_complejidad * (multiplicador_urgencia - 1)

subtotal_urgencia = subtotal_complejidad + ajuste_urgencia

revisiones_extra = max(0, revisiones_solicitadas - revisiones_incluidas)

coste_revisiones = revisiones_extra * precio_revision_extra

extras = suma de extras seleccionados

subtotal_antes_recargo = subtotal_urgencia + coste_revisiones + extras

recargo_comercial_opcional = subtotal_antes_recargo * porcentaje_recargo_opcional

subtotal_con_recargo = subtotal_antes_recargo + recargo_comercial_opcional

descuento = subtotal_con_recargo * porcentaje_descuento

subtotal_despues_descuento = subtotal_con_recargo - descuento

impuestos = subtotal_despues_descuento * porcentaje_impuesto, solo si aplicar_impuestos está activado

total = subtotal_despues_descuento + impuestos
```

Los importes se redondean a 2 decimales para visualización y resumen.

## Moneda

EUR es la moneda base de entrada. SEK y USD son conversiones visuales del presupuesto calculado en EUR.

La herramienta intenta cargar tasas actuales desde Frankfurter:

```text
https://api.frankfurter.dev/v2/rates?base=EUR&quotes=SEK,USD
```

Si la API externa no responde, se usan tasas locales de respaldo definidas en `assets/js/services.js`.

## Límites y riesgos

- El recargo comercial opcional es una capa comercial adicional, no un margen interno.
- El descuento se aplica antes de impuestos.
- Los impuestos son opcionales y dependen del país, régimen fiscal y cliente.
- Las revisiones extra nunca pueden ser negativas.
- Los extras solo se suman si están seleccionados.
- La estimación no sustituye una propuesta comercial revisada manualmente.
- Las tasas de cambio pueden variar; revisa la fuente si el presupuesto depende de una conversión sensible.
