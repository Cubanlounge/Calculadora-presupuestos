(function () {
  "use strict";

  var config = window.BudgetServices;
  var calculator = window.BudgetCalculator;
  var form = byId("budget-form");
  var serviceSelect = byId("service");
  var budgetModelSelect = byId("budget-model");
  var currencySelect = byId("currency");
  var complexitySelect = byId("complexity");
  var urgencySelect = byId("urgency");
  var applyTaxInput = byId("apply-tax");
  var taxRateInput = byId("tax-rate");
  var message = byId("message");
  var rateStatus = byId("rate-status");
  var extrasList = byId("extras-list");
  var copySummaryButton = byId("copy-summary");
  var printSummaryButton = byId("print-summary");
  var modelSections = [].slice.call(document.querySelectorAll("[data-model-fields]"));
  var lastSummaryText = "";
  var exchangeRates = {
    source: "respaldo local",
    date: "",
    rates: {}
  };

  var fields = {
    clientName: byId("client-name"),
    projectName: byId("project-name"),
    validity: byId("validity"),
    scope: byId("scope"),
    deliverables: byId("deliverables"),
    hours: byId("hours"),
    hourlyRate: byId("hourly-rate"),
    packagePrice: byId("package-price"),
    monthlyFee: byId("monthly-fee"),
    months: byId("months"),
    setupFee: byId("setup-fee"),
    includedRevisions: byId("included-revisions"),
    requestedRevisions: byId("requested-revisions"),
    revisionRate: byId("revision-rate"),
    commercialSurcharge: byId("commercial-surcharge"),
    discount: byId("discount"),
    notes: byId("notes")
  };

  var output = {
    service: byId("summary-service"),
    exchangeRate: byId("exchange-rate"),
    baseService: byId("base-service"),
    complexityAdjustment: byId("complexity-adjustment"),
    urgencyAdjustment: byId("urgency-adjustment"),
    revisionCost: byId("revision-cost"),
    extrasTotal: byId("extras-total"),
    commercialSurcharge: byId("commercial-surcharge-value"),
    discount: byId("discount-value"),
    taxes: byId("taxes"),
    total: byId("total"),
    commercialSummary: byId("commercial-summary")
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function createOption(item, suffix) {
    var option = document.createElement("option");
    option.value = item.id || item.code;
    option.textContent = item.name + (suffix || "");
    return option;
  }

  function fillSelect(select, items, suffixFactory) {
    select.textContent = "";
    items.forEach(function (item) {
      select.appendChild(createOption(item, suffixFactory ? suffixFactory(item) : ""));
    });
  }

  function findById(items, id) {
    return items.find(function (item) {
      return item.id === id || item.code === id;
    });
  }

  function parseNumber(value) {
    if (value === null || String(value).trim() === "") {
      return NaN;
    }

    return Number(String(value).replace(",", "."));
  }

  function getNumber(formData, name) {
    return parseNumber(formData.get(name));
  }

  function isValidNumber(value) {
    return Number.isFinite(Number(value));
  }

  function isWholeNumber(value) {
    return isValidNumber(value) && Number.isInteger(Number(value));
  }

  function textValue(element) {
    return element.value.trim();
  }

  function getFallbackRate(currency) {
    return Number(currency.fallbackRateFromEur);
  }

  function getRateFromEur(currency) {
    if (currency.code === config.baseCurrency) {
      return 1;
    }

    return Number(exchangeRates.rates[currency.code]) || getFallbackRate(currency);
  }

  function convertMoney(value, currency) {
    return Number(value || 0) * getRateFromEur(currency);
  }

  function formatMoney(value, currency) {
    return new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code
    }).format(convertMoney(value, currency));
  }

  function formatDiscount(value, currency) {
    return value > 0 ? "-" + formatMoney(value, currency) : formatMoney(0, currency);
  }

  function formatRateLine(currency) {
    var formatter = new Intl.NumberFormat(currency.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    });
    var source = exchangeRates.date
      ? exchangeRates.source + " " + exchangeRates.date
      : exchangeRates.source;

    return "1 " + config.baseCurrency + " = " + formatter.format(getRateFromEur(currency)) + " " + currency.code + " (" + source + ")";
  }

  function setRateStatus(text, isError) {
    rateStatus.textContent = text;
    rateStatus.classList.toggle("is-error", Boolean(isError));
  }

  function showSelectedModelFields() {
    var selectedModel = budgetModelSelect.value;
    modelSections.forEach(function (section) {
      section.hidden = section.getAttribute("data-model-fields") !== selectedModel;
    });
  }

  function renderExtras(service) {
    extrasList.textContent = "";
    (service.extras || []).forEach(function (extra) {
      var row = document.createElement("div");
      var checkbox = document.createElement("input");
      var label = document.createElement("label");
      var price = document.createElement("input");

      row.className = "extra-row";
      row.dataset.extraId = extra.id;

      checkbox.type = "checkbox";
      checkbox.className = "extra-checkbox";
      checkbox.id = "extra-" + extra.id;

      label.htmlFor = checkbox.id;
      label.textContent = extra.name;

      price.type = "number";
      price.min = "0";
      price.step = "1";
      price.className = "extra-price";
      price.value = String(extra.price);
      price.setAttribute("aria-label", "Precio de " + extra.name + " en EUR");

      row.appendChild(checkbox);
      row.appendChild(label);
      row.appendChild(price);
      extrasList.appendChild(row);
    });
  }

  function applyServicePreset() {
    var service = findById(config.services, serviceSelect.value);

    if (!service) {
      return;
    }

    budgetModelSelect.value = service.recommendedModel;
    fields.hourlyRate.value = service.hourlyRate;
    fields.packagePrice.value = service.packagePrice;
    fields.monthlyFee.value = service.monthlyFee;
    fields.setupFee.value = service.setupFee;
    fields.includedRevisions.value = service.includedRevisions;
    fields.requestedRevisions.value = service.includedRevisions;
    fields.revisionRate.value = service.revisionRate;
    fields.commercialSurcharge.value = 0;
    renderExtras(service);
    showSelectedModelFields();
  }

  function getSelectedExtras() {
    return [].slice.call(extrasList.querySelectorAll(".extra-row")).reduce(function (selected, row) {
      var checkbox = row.querySelector(".extra-checkbox");
      var price = row.querySelector(".extra-price");

      if (checkbox.checked) {
        selected.push({
          id: row.dataset.extraId,
          name: row.querySelector("label").textContent,
          price: parseNumber(price.value)
        });
      }

      return selected;
    }, []);
  }

  function readForm() {
    var formData = new FormData(form);

    return {
      clientName: textValue(fields.clientName),
      projectName: textValue(fields.projectName),
      validity: textValue(fields.validity) || "15 días",
      scope: textValue(fields.scope),
      deliverables: textValue(fields.deliverables),
      notes: textValue(fields.notes),
      service: findById(config.services, formData.get("service")),
      budgetModel: findById(config.budgetModels, formData.get("budgetModel")),
      currency: findById(config.currencies, formData.get("currency")),
      complexity: findById(config.complexity, formData.get("complexity")),
      urgency: findById(config.urgency, formData.get("urgency")),
      hours: getNumber(formData, "hours"),
      hourlyRate: getNumber(formData, "hourlyRate"),
      packagePrice: getNumber(formData, "packagePrice"),
      monthlyFee: getNumber(formData, "monthlyFee"),
      months: getNumber(formData, "months"),
      setupFee: getNumber(formData, "setupFee"),
      includedRevisions: getNumber(formData, "includedRevisions"),
      requestedRevisions: getNumber(formData, "requestedRevisions"),
      revisionRate: getNumber(formData, "revisionRate"),
      commercialSurcharge: getNumber(formData, "commercialSurcharge"),
      discount: getNumber(formData, "discount"),
      applyTax: applyTaxInput.checked,
      taxRate: getNumber(formData, "taxRate"),
      extras: getSelectedExtras()
    };
  }

  function validateInput(input) {
    var model = input.budgetModel ? input.budgetModel.id : "";

    if (!input.service) return "Selecciona un servicio.";
    if (!input.budgetModel) return "Selecciona un modelo de presupuesto.";
    if (!input.currency) return "Selecciona una moneda.";
    if (getRateFromEur(input.currency) <= 0) return "La tasa de cambio debe ser mayor que 0.";
    if (!input.complexity) return "Selecciona la complejidad.";
    if (!input.urgency) return "Selecciona la urgencia.";
    if (model === "hourly" && (!isValidNumber(input.hours) || input.hours < 0)) return "Las horas estimadas deben ser un número válido y no negativo.";
    if (model === "hourly" && (!isValidNumber(input.hourlyRate) || input.hourlyRate < 0)) return "La tarifa freelance por hora debe ser válida y no negativa.";
    if (model === "package" && (!isValidNumber(input.packagePrice) || input.packagePrice < 0)) return "El precio del paquete debe ser válido y no negativo.";
    if (model === "monthly" && (!isValidNumber(input.monthlyFee) || input.monthlyFee < 0)) return "La cuota mensual debe ser válida y no negativa.";
    if (model === "monthly" && (!isWholeNumber(input.months) || input.months < 1)) return "El número de meses debe ser un entero mayor o igual que 1.";
    if (model === "monthly" && (!isValidNumber(input.setupFee) || input.setupFee < 0)) return "La configuración inicial debe ser válida y no negativa.";
    if (!isWholeNumber(input.includedRevisions) || input.includedRevisions < 0) return "Las revisiones incluidas deben ser un entero no negativo.";
    if (!isWholeNumber(input.requestedRevisions) || input.requestedRevisions < 0) return "Las revisiones solicitadas deben ser un entero no negativo.";
    if (!isValidNumber(input.revisionRate) || input.revisionRate < 0) return "El precio por revisión extra debe ser válido y no negativo.";
    if (!isValidNumber(input.commercialSurcharge) || input.commercialSurcharge < 0 || input.commercialSurcharge > 1000) return "El recargo comercial opcional debe estar entre 0% y 1000%.";
    if (!isValidNumber(input.discount) || input.discount < 0 || input.discount > 100) return "El descuento debe estar entre 0% y 100%.";
    if (input.applyTax && (!isValidNumber(input.taxRate) || input.taxRate < 0 || input.taxRate > 100)) return "Los impuestos deben estar entre 0% y 100%.";
    if (input.extras.some(function (extra) { return !isValidNumber(extra.price) || extra.price < 0; })) return "Los extras activados deben tener importes válidos y no negativos.";

    return "";
  }

  function buildCalculationInput(input) {
    return {
      budgetModel: input.budgetModel.id,
      hours: input.hours,
      hourlyRate: input.hourlyRate,
      packagePrice: input.packagePrice,
      monthlyFee: input.monthlyFee,
      months: input.months,
      setupFee: input.setupFee,
      complexityMultiplier: input.complexity.multiplier,
      urgencyMultiplier: input.urgency.multiplier,
      includedRevisions: input.includedRevisions,
      requestedRevisions: input.requestedRevisions,
      revisionRate: input.revisionRate,
      extras: input.extras,
      commercialSurcharge: input.commercialSurcharge,
      discount: input.discount,
      applyTax: input.applyTax,
      taxRate: input.taxRate
    };
  }

  function getModelDetail(input, currency) {
    if (input.budgetModel.id === "package") {
      return "Paquete: " + formatMoney(input.packagePrice, currency);
    }

    if (input.budgetModel.id === "monthly") {
      return "Mensual: " + formatMoney(input.monthlyFee, currency) + " x " + input.months + " meses + " + formatMoney(input.setupFee, currency) + " de configuración";
    }

    return "Horas: " + input.hours + " h x " + formatMoney(input.hourlyRate, currency) + "/h";
  }

  function getExtrasText(input, currency) {
    if (!input.extras.length) {
      return "Sin extras";
    }

    return input.extras.map(function (extra) {
      return extra.name + " (" + formatMoney(extra.price, currency) + ")";
    }).join(", ");
  }

  function buildCommercialSummary(input, result) {
    var currency = input.currency;

    return [
      "Presupuesto estimado",
      "Cliente: " + (input.clientName || "Pendiente"),
      "Proyecto: " + (input.projectName || "Pendiente"),
      "Servicio: " + input.service.name,
      "Modelo de presupuesto: " + input.budgetModel.name,
      "Tipo de cambio: " + formatRateLine(currency),
      "Alcance: " + (input.scope || "Pendiente de definir"),
      "Entregables: " + (input.deliverables || "Pendiente de definir"),
      "Revisiones incluidas: " + input.includedRevisions,
      "Revisiones solicitadas: " + input.requestedRevisions,
      "Extras: " + getExtrasText(input, currency),
      "Subtotal antes de descuento: " + formatMoney(result.subtotalWithSurcharge, currency),
      "Descuento: " + formatDiscount(result.discount, currency),
      "Impuestos: " + formatMoney(result.taxes, currency),
      "Total estimado: " + formatMoney(result.total, currency),
      "Notas: " + (input.notes || "Estimación orientativa. Revisar alcance, entregables, plazos, revisiones, impuestos y condiciones antes de aprobar."),
      "Validez de la estimación: " + input.validity
    ].join("\n");
  }

  function renderResult(input, result) {
    var currency = input.currency;

    output.service.textContent = input.service.name + " | " + input.budgetModel.name + " | " + getModelDetail(input, currency);
    output.exchangeRate.textContent = formatRateLine(currency);
    output.baseService.textContent = formatMoney(result.baseService, currency);
    output.complexityAdjustment.textContent = formatMoney(result.complexityAdjustment, currency);
    output.urgencyAdjustment.textContent = formatMoney(result.urgencyAdjustment, currency);
    output.revisionCost.textContent = formatMoney(result.revisionCost, currency) + " (" + result.extraRevisions + " extra)";
    output.extrasTotal.textContent = formatMoney(result.extrasTotal, currency);
    output.commercialSurcharge.textContent = formatMoney(result.commercialSurcharge, currency);
    output.discount.textContent = formatDiscount(result.discount, currency);
    output.taxes.textContent = formatMoney(result.taxes, currency);
    output.total.textContent = formatMoney(result.total, currency);
    lastSummaryText = buildCommercialSummary(input, result);
    output.commercialSummary.textContent = lastSummaryText;
  }

  function submit(event) {
    if (event) {
      event.preventDefault();
    }

    message.textContent = "";

    var input = readForm();
    var error = validateInput(input);

    if (error) {
      message.textContent = error;
      return false;
    }

    renderResult(input, calculator.calculateBudget(buildCalculationInput(input)));
    return true;
  }

  function normalizeRemoteRates(data) {
    if (Array.isArray(data)) {
      return data.reduce(function (rates, item) {
        if (item.quote && Number(item.rate) > 0) {
          rates[item.quote] = Number(item.rate);
        }

        return rates;
      }, {});
    }

    return data.rates || data.quotes || {};
  }

  function getRemoteDate(data) {
    if (Array.isArray(data) && data.length > 0) {
      return data[0].date || "";
    }

    return data.date || "";
  }

  function useFallbackRates() {
    exchangeRates = {
      source: "respaldo local",
      date: "",
      rates: config.currencies.reduce(function (rates, currency) {
        rates[currency.code] = getFallbackRate(currency);
        return rates;
      }, {})
    };
  }

  function loadRates() {
    if (!window.fetch) {
      useFallbackRates();
      setRateStatus("No hay soporte fetch. Usando tasas locales de respaldo.", true);
      submit();
      return;
    }

    fetch(config.exchangeRateApiUrl)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Error HTTP " + response.status);
        }

        return response.json();
      })
      .then(function (data) {
        var remoteRates = normalizeRemoteRates(data);
        var valid = config.currencies.every(function (currency) {
          return currency.code === config.baseCurrency || Number(remoteRates[currency.code]) > 0;
        });

        if (!valid) {
          throw new Error("Respuesta de tipos de cambio incompleta.");
        }

        exchangeRates = {
          source: config.exchangeRateSource,
          date: getRemoteDate(data) || "actual",
          rates: remoteRates
        };
        setRateStatus("Tipos de cambio actuales cargados desde " + config.exchangeRateSource + ".", false);
        submit();
      })
      .catch(function () {
        useFallbackRates();
        setRateStatus("No se pudieron cargar tasas actuales. Usando tasas locales de respaldo.", true);
        submit();
      });
  }

  function copyFallback(text) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand("copy");
      message.textContent = "Resumen copiado al portapapeles.";
    } catch (error) {
      message.textContent = "No se pudo copiar automáticamente. Selecciona el resumen y cópialo manualmente.";
    }

    document.body.removeChild(textarea);
  }

  function copySummary() {
    if (!submit()) {
      return;
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(lastSummaryText).then(function () {
        message.textContent = "Resumen copiado al portapapeles.";
      }).catch(function () {
        copyFallback(lastSummaryText);
      });
      return;
    }

    copyFallback(lastSummaryText);
  }

  function updateTaxFieldState() {
    taxRateInput.disabled = !applyTaxInput.checked;
  }

  function initialize() {
    fillSelect(serviceSelect, config.services);
    fillSelect(budgetModelSelect, config.budgetModels);
    fillSelect(currencySelect, config.currencies, function (currency) { return " (" + currency.code + ")"; });
    fillSelect(complexitySelect, config.complexity, function (option) { return " x" + option.multiplier.toFixed(2); });
    fillSelect(urgencySelect, config.urgency, function (option) { return " x" + option.multiplier.toFixed(2); });

    applyServicePreset();
    updateTaxFieldState();

    form.addEventListener("submit", submit);
    form.addEventListener("input", submit);
    serviceSelect.addEventListener("change", function () {
      applyServicePreset();
      submit();
    });
    budgetModelSelect.addEventListener("change", function () {
      showSelectedModelFields();
      submit();
    });
    currencySelect.addEventListener("change", submit);
    complexitySelect.addEventListener("change", submit);
    urgencySelect.addEventListener("change", submit);
    extrasList.addEventListener("change", submit);
    applyTaxInput.addEventListener("change", function () {
      updateTaxFieldState();
      submit();
    });
    form.addEventListener("reset", function () {
      window.setTimeout(function () {
        applyServicePreset();
        updateTaxFieldState();
        message.textContent = "";
        submit();
      }, 0);
    });
    copySummaryButton.addEventListener("click", copySummary);
    printSummaryButton.addEventListener("click", function () {
      if (submit()) {
        window.print();
      }
    });

    useFallbackRates();
    submit();
    loadRates();
  }

  initialize();
})();
