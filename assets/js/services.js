(function () {
  "use strict";

  function buildExtras(prefix, names, prices) {
    return names.map(function (name, index) {
      return {
        id: prefix + "-" + index,
        name: name,
        price: prices[index]
      };
    });
  }

  window.BudgetServices = {
    baseCurrency: "EUR",
    exchangeRateApiUrl: "https://api.frankfurter.dev/v2/rates?base=EUR&quotes=SEK,USD",
    exchangeRateSource: "Frankfurter",
    currencies: [
      { code: "EUR", name: "Euro", locale: "es-ES", fallbackRateFromEur: 1 },
      { code: "SEK", name: "Corona sueca", locale: "sv-SE", fallbackRateFromEur: 10.9838 },
      { code: "USD", name: "Dólar norteamericano", locale: "en-US", fallbackRateFromEur: 1.1486 }
    ],
    budgetModels: [
      { id: "hourly", name: "Por horas" },
      { id: "package", name: "Por paquete" },
      { id: "monthly", name: "Mensual / retainer" }
    ],
    services: [
      {
        id: "web",
        name: "Diseño web",
        hourlyRate: 50,
        includedRevisions: 2,
        revisionRate: 50,
        recommendedModel: "package",
        packagePrice: 900,
        monthlyFee: 0,
        setupFee: 0,
        extras: buildExtras("web", ["Página adicional", "SEO básico on-page", "Blog", "Formulario avanzado", "Integración de analytics", "Multidioma"], [120, 180, 220, 150, 90, 260])
      },
      {
        id: "seo",
        name: "SEO",
        hourlyRate: 55,
        includedRevisions: 1,
        revisionRate: 50,
        recommendedModel: "monthly",
        packagePrice: 0,
        monthlyFee: 450,
        setupFee: 150,
        extras: buildExtras("seo", ["Auditoría SEO", "Keyword research", "Optimización on-page", "Plan de contenidos", "Informe mensual", "SEO técnico básico"], [250, 180, 220, 190, 80, 240])
      },
      {
        id: "branding",
        name: "Branding",
        hourlyRate: 60,
        includedRevisions: 2,
        revisionRate: 60,
        recommendedModel: "package",
        packagePrice: 750,
        monthlyFee: 0,
        setupFee: 0,
        extras: buildExtras("branding", ["Logo principal", "Versiones del logo", "Paleta de color", "Tipografías", "Mini guía de marca", "Mockups"], [280, 160, 90, 90, 220, 120])
      },
      {
        id: "graphic-design",
        name: "Diseño gráfico",
        hourlyRate: 45,
        includedRevisions: 1,
        revisionRate: 45,
        recommendedModel: "package",
        packagePrice: 180,
        monthlyFee: 0,
        setupFee: 0,
        extras: buildExtras("graphic", ["Pieza adicional", "Adaptación a otro formato", "Archivo editable", "Versión para redes", "Versión para impresión"], [80, 45, 60, 45, 55])
      },
      {
        id: "video-editing",
        name: "Edición de video",
        hourlyRate: 50,
        includedRevisions: 1,
        revisionRate: 50,
        recommendedModel: "package",
        packagePrice: 300,
        monthlyFee: 0,
        setupFee: 0,
        extras: buildExtras("video", ["Subtítulos", "Corrección de color", "Limpieza de audio", "Versión vertical", "Miniatura", "Música licenciada aportada por el cliente"], [90, 120, 85, 95, 60, 0])
      },
      {
        id: "ai-automation",
        name: "Automatización con IA",
        hourlyRate: 70,
        includedRevisions: 1,
        revisionRate: 70,
        recommendedModel: "package",
        packagePrice: 850,
        monthlyFee: 0,
        setupFee: 0,
        extras: buildExtras("ai", ["Integración adicional", "Documentación", "Pruebas", "Prompt system", "Flujo de automatización", "Sesión de explicación"], [250, 160, 180, 120, 220, 140])
      },
      {
        id: "social-media",
        name: "Gestión de redes sociales",
        hourlyRate: 45,
        includedRevisions: 1,
        revisionRate: 45,
        recommendedModel: "monthly",
        packagePrice: 0,
        monthlyFee: 500,
        setupFee: 100,
        extras: buildExtras("social", ["Post adicional", "Reel adicional", "Calendario editorial", "Copywriting", "Diseño de plantillas", "Informe mensual"], [45, 95, 160, 90, 180, 80])
      }
    ],
    complexity: [
      { id: "low", name: "Baja", multiplier: 1 },
      { id: "medium", name: "Media", multiplier: 1.25 },
      { id: "high", name: "Alta", multiplier: 1.5 },
      { id: "premium", name: "Premium", multiplier: 1.85 }
    ],
    urgency: [
      { id: "normal", name: "Normal", multiplier: 1 },
      { id: "fast", name: "Rápida", multiplier: 1.2 },
      { id: "critical", name: "Crítica", multiplier: 1.5 }
    ]
  };
})();
