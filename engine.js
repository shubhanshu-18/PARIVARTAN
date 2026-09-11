class FinancialEngine {
  calculateFinancials({
    projectCost = 140000,
    promoterSharePercent = 10,
    annualInterestRate = 6.5,
    tenureMonths = 36,
    moratoriumMonths = 3,
    estimatedMonthlyRevenue = null,
    estimatedMonthlyOpex = null,
    subsidyPercent = 0,
  }) {
    const cost = Math.max(10000, Number(projectCost));
    const marginPercent = Math.min(
      50,
      Math.max(0, Number(promoterSharePercent)),
    );
    const annualRate = Math.max(1, Number(annualInterestRate));
    const totalTenure = Math.max(6, Number(tenureMonths));
    const moratorium = Math.min(
      totalTenure - 1,
      Math.max(0, Number(moratoriumMonths)),
    );
    const subsidy = Math.min(50, Math.max(0, Number(subsidyPercent)));

    const promoterContribution = Math.round(cost * (marginPercent / 100));
    const governmentSubsidyAmount = Math.round(cost * (subsidy / 100));
    const loanAmount = Math.max(
      0,
      cost - promoterContribution - governmentSubsidyAmount,
    );

    const activeRepaymentMonths = Math.max(1, totalTenure - moratorium);
    const monthlyInterestRate = annualRate / 12 / 100;

    let monthlyEmi = 0;
    if (monthlyInterestRate === 0) {
      monthlyEmi = Math.round(loanAmount / activeRepaymentMonths);
    } else {
      const num =
        loanAmount *
        monthlyInterestRate *
        Math.pow(1 + monthlyInterestRate, activeRepaymentMonths);
      const den = Math.pow(1 + monthlyInterestRate, activeRepaymentMonths) - 1;
      monthlyEmi = Math.round(num / den);
    }

    let remainingPrincipal = loanAmount;
    let totalInterestPayable = 0;
    const schedule = [];

    // Moratorium Phase
    for (let m = 1; m <= moratorium; m++) {
      const interest = Math.round(remainingPrincipal * monthlyInterestRate);
      totalInterestPayable += interest;
      schedule.push({
        month: m,
        phase: "Moratorium",
        openingBalance: remainingPrincipal,
        principalPaid: 0,
        interestPaid: interest,
        totalPayment: interest,
        closingBalance: remainingPrincipal,
      });
    }

    // Active EMI Phase
    for (let m = 1; m <= activeRepaymentMonths; m++) {
      const currentMonth = moratorium + m;
      const interest = Math.round(remainingPrincipal * monthlyInterestRate);
      let principal = monthlyEmi - interest;
      if (m === activeRepaymentMonths || principal > remainingPrincipal)
        principal = remainingPrincipal;

      totalInterestPayable += interest;
      const closing = Math.max(0, remainingPrincipal - principal);
      schedule.push({
        month: currentMonth,
        phase: "Regular EMI",
        openingBalance: remainingPrincipal,
        principalPaid: principal,
        interestPaid: interest,
        totalPayment: principal + interest,
        closingBalance: closing,
      });
      remainingPrincipal = closing;
    }

    const grossMonthlyRevenue = estimatedMonthlyRevenue
      ? Number(estimatedMonthlyRevenue)
      : Math.round(cost * 0.35);
    const grossMonthlyOpex = estimatedMonthlyOpex
      ? Number(estimatedMonthlyOpex)
      : Math.round(grossMonthlyRevenue * 0.55);
    const monthlyNetProfitBeforeEMI = grossMonthlyRevenue - grossMonthlyOpex;
    const monthlyNetProfitAfterEMI = Math.max(
      0,
      monthlyNetProfitBeforeEMI - monthlyEmi,
    );

    const fixedMonthlyCost = monthlyEmi + 3000;
    const contributionMarginRatio =
      (grossMonthlyRevenue - grossMonthlyOpex) / (grossMonthlyRevenue || 1);
    const breakEvenMonthlyRevenue =
      contributionMarginRatio > 0
        ? Math.round(fixedMonthlyCost / contributionMarginRatio)
        : Math.round(fixedMonthlyCost * 2);
    const breakEvenDaysPerMonth = Math.min(
      30,
      Math.max(
        3,
        Math.round((breakEvenMonthlyRevenue / (grossMonthlyRevenue || 1)) * 30),
      ),
    );

    const breakEvenChartData = [
      {
        capacityPercent: 20,
        revenue: Math.round(grossMonthlyRevenue * 0.2),
        totalCost: Math.round(fixedMonthlyCost + grossMonthlyOpex * 0.2),
      },
      {
        capacityPercent: 40,
        revenue: Math.round(grossMonthlyRevenue * 0.4),
        totalCost: Math.round(fixedMonthlyCost + grossMonthlyOpex * 0.4),
      },
      {
        capacityPercent: 60,
        revenue: Math.round(grossMonthlyRevenue * 0.6),
        totalCost: Math.round(fixedMonthlyCost + grossMonthlyOpex * 0.6),
      },
      {
        capacityPercent: 80,
        revenue: Math.round(grossMonthlyRevenue * 0.8),
        totalCost: Math.round(fixedMonthlyCost + grossMonthlyOpex * 0.8),
      },
      {
        capacityPercent: 100,
        revenue: grossMonthlyRevenue,
        totalCost: Math.round(fixedMonthlyCost + grossMonthlyOpex),
      },
    ];

    const dscr = Number(
      (monthlyNetProfitBeforeEMI / (monthlyEmi || 1)).toFixed(2),
    );
    let dscrRating = "Moderate";
    let dscrColor = "amber";
    if (dscr >= 2.0) {
      dscrRating = "High Bankability (Excellent)";
      dscrColor = "emerald";
    } else if (dscr >= 1.3) {
      dscrRating = "Viable & Bankable (Good)";
      dscrColor = "emerald";
    } else if (dscr >= 1.0) {
      dscrRating = "Borderline (Tight Cashflow)";
      dscrColor = "amber";
    } else {
      dscrRating = "High Risk (Inadequate Cashflow)";
      dscrColor = "rose";
    }

    const netProfitMarginPercent =
      grossMonthlyRevenue > 0
        ? Math.round((monthlyNetProfitAfterEMI / grossMonthlyRevenue) * 100)
        : 0;

    return {
      summary: {
        projectCost: cost,
        promoterContribution,
        promoterSharePercent: marginPercent,
        governmentSubsidyAmount,
        loanAmount,
        annualInterestRate: annualRate,
        tenureMonths: totalTenure,
        moratoriumMonths: moratorium,
        monthlyEmi,
        totalInterestPayable,
        grossMonthlyRevenue,
        grossMonthlyOpex,
        monthlyNetProfitBeforeEMI,
        monthlyNetProfitAfterEMI,
        netProfitMarginPercent,
        breakEvenMonthlyRevenue,
        breakEvenDaysPerMonth,
        debtServiceCoverageRatio: dscr,
        dscrRating,
        dscrColor,
      },
      breakEvenChartData,
      amortizationSchedule: schedule,
    };
  }
}

module.exports = new FinancialEngine();
