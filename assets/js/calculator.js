(function () {
  "use strict";

  function numberOrZero(value) {
    var number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function percent(value) {
    return numberOrZero(value) / 100;
  }

  function roundMoney(value) {
    return Math.round((numberOrZero(value) + Number.EPSILON) * 100) / 100;
  }

  function calculateBaseService(input) {
    if (input.budgetModel === "package") {
      return numberOrZero(input.packagePrice);
    }

    if (input.budgetModel === "monthly") {
      return numberOrZero(input.monthlyFee) * numberOrZero(input.months) + numberOrZero(input.setupFee);
    }

    return numberOrZero(input.hours) * numberOrZero(input.hourlyRate);
  }

  function calculateBudget(input) {
    var baseService = calculateBaseService(input);
    var complexityMultiplier = numberOrZero(input.complexityMultiplier) || 1;
    var urgencyMultiplier = numberOrZero(input.urgencyMultiplier) || 1;
    var extraRevisions = Math.max(0, numberOrZero(input.requestedRevisions) - numberOrZero(input.includedRevisions));
    var revisionCost = extraRevisions * numberOrZero(input.revisionRate);
    var extrasTotal = (Array.isArray(input.extras) ? input.extras : []).reduce(function (total, extra) {
      return total + numberOrZero(extra.price);
    }, 0);
    var complexityAdjustment = baseService * (complexityMultiplier - 1);
    var subtotalAfterComplexity = baseService + complexityAdjustment;
    var urgencyAdjustment = subtotalAfterComplexity * (urgencyMultiplier - 1);
    var subtotalBeforeSurcharge = subtotalAfterComplexity + urgencyAdjustment + revisionCost + extrasTotal;
    var commercialSurcharge = subtotalBeforeSurcharge * percent(input.commercialSurcharge);
    var subtotalWithSurcharge = subtotalBeforeSurcharge + commercialSurcharge;
    var discount = subtotalWithSurcharge * percent(input.discount);
    var subtotalAfterDiscount = subtotalWithSurcharge - discount;
    var taxes = input.applyTax ? subtotalAfterDiscount * percent(input.taxRate) : 0;
    var total = subtotalAfterDiscount + taxes;

    return {
      budgetModel: input.budgetModel,
      baseService: roundMoney(baseService),
      complexityAdjustment: roundMoney(complexityAdjustment),
      subtotalAfterComplexity: roundMoney(subtotalAfterComplexity),
      urgencyAdjustment: roundMoney(urgencyAdjustment),
      extraRevisions: extraRevisions,
      revisionCost: roundMoney(revisionCost),
      extrasTotal: roundMoney(extrasTotal),
      subtotalBeforeSurcharge: roundMoney(subtotalBeforeSurcharge),
      commercialSurcharge: roundMoney(commercialSurcharge),
      subtotalWithSurcharge: roundMoney(subtotalWithSurcharge),
      discount: roundMoney(discount),
      subtotalAfterDiscount: roundMoney(subtotalAfterDiscount),
      taxes: roundMoney(taxes),
      total: roundMoney(total)
    };
  }

  window.BudgetCalculator = {
    calculateBudget: calculateBudget
  };
})();
