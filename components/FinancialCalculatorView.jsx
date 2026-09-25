import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { t } from "../utils/translations";
import { ApiService } from "../services/api";
import {
  Calculator,
  IndianRupee,
  TrendingUp,
  Percent,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Sliders,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

export function FinancialCalculatorView() {
  const {
    profile,
    updateProfile,
    financials,
    setFinancials,
    setActiveStep,
    language,
    showToast,
  } = useApp();

  const [assumptions, setAssumptions] = useState({
    projectCost: Number(profile.expectedInvestment) || 140000,
    promoterSharePercent: profile.promoterSharePercent || 10,
    annualInterestRate: profile.annualInterestRate || 5.0,
    tenureMonths: profile.tenureMonths || 36,
    moratoriumMonths: profile.moratoriumMonths || 3,
    subsidyPercent: profile.subsidyPercent || 15,
    estimatedMonthlyRevenue: profile.estimatedMonthlyRevenue || 49000,
    estimatedMonthlyOpex: profile.estimatedMonthlyOpex || 27000,
  });

  const [showAmortization, setShowAmortization] = useState(false);
  const [calculating, setCalculating] = useState(false);

  // Recalculate on assumptions change
  const handleRecalculate = async (customParams = null) => {
    setCalculating(true);
    const params = customParams || assumptions;
    try {
      const res = await ApiService.calculateFinancials(params);
      setFinancials(res);
      updateProfile({
        expectedInvestment: params.projectCost,
        promoterSharePercent: params.promoterSharePercent,
        annualInterestRate: params.annualInterestRate,
        tenureMonths: params.tenureMonths,
        moratoriumMonths: params.moratoriumMonths,
        subsidyPercent: params.subsidyPercent,
        estimatedMonthlyRevenue: params.estimatedMonthlyRevenue,
        estimatedMonthlyOpex: params.estimatedMonthlyOpex,
      });
    } catch (err) {
      showToast("Calculation error: " + err.message, "error");
    } finally {
      setCalculating(false);
    }
  };

  const handleSliderChange = (key, val) => {
    const updated = { ...assumptions, [key]: Number(val) };
    setAssumptions(updated);
    handleRecalculate(updated);
  };

  const fin = financials?.summary || {
    projectCost: assumptions.projectCost,
    promoterContribution: Math.round(assumptions.projectCost * 0.1),
    promoterSharePercent: assumptions.promoterSharePercent,
    governmentSubsidyAmount: Math.round(
      assumptions.projectCost * (assumptions.subsidyPercent / 100),
    ),
    loanAmount: Math.round(assumptions.projectCost * 0.75),
    annualInterestRate: assumptions.annualInterestRate,
    tenureMonths: assumptions.tenureMonths,
    moratoriumMonths: assumptions.moratoriumMonths,
    monthlyEmi: 3240,
    totalInterestPayable: 11640,
    grossMonthlyRevenue: assumptions.estimatedMonthlyRevenue,
    grossMonthlyOpex: assumptions.estimatedMonthlyOpex,
    monthlyNetProfitAfterEMI: 18760,
    breakEvenDaysPerMonth: 8,
    debtServiceCoverageRatio: 5.4,
    dscrRating: "High Bankability (Excellent)",
    dscrColor: "emerald",
  };

  const schedule = financials?.amortizationSchedule || [];
  const breakEvenData = financials?.breakEvenChartData || [
    { capacityPercent: 20, revenue: 9800, totalCost: 11640 },
    { capacityPercent: 40, revenue: 19600, totalCost: 17040 },
    { capacityPercent: 60, revenue: 29400, totalCost: 22440 },
    { capacityPercent: 80, revenue: 39200, totalCost: 27840 },
    { capacityPercent: 100, revenue: 49000, totalCost: 33240 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-5 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white rounded-xl shadow-subtle border border-[#DCE4E8] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8F6F1] text-[#167C5A] border border-[#167C5A]/30 mb-2">
              <Calculator className="w-3.5 h-3.5 text-[#167C5A]" />
              <span>
                Step 4 of 6 • Capital Outlay & Loan Structuring Engine
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#123B5D] tracking-tight">
              {t("financial.title", language)}
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] mt-1">
              {t("financial.subtitle", language)}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1.5 rounded-lg font-bold bg-[#E8F6F1] text-[#105D44] border border-[#167C5A]/30 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-[#167C5A]" />
              <span>Bank Viability: {fin.debtServiceCoverageRatio}x DSCR</span>
            </span>
          </div>
        </div>
      </div>

      {/* 6 KEY FINANCIAL KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Project Cost */}
        <div className="bg-white rounded-xl p-4 border border-[#DCE4E8] shadow-subtle">
          <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">
            {t("financial.projectCost", language)}
          </span>
          <div className="mt-1.5 text-lg sm:text-xl font-black text-[#17212B]">
            ₹{Number(fin.projectCost || 0).toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-[#667085] mt-1 block">
            Total capital outlay
          </span>
        </div>

        {/* Promoter Contribution */}
        <div className="bg-white rounded-xl p-4 border border-[#DCE4E8] shadow-subtle">
          <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">
            {t("financial.promoterMargin", language)}
          </span>
          <div className="mt-1.5 text-lg sm:text-xl font-black text-[#17212B]">
            ₹{Number(fin.promoterContribution || 0).toLocaleString("en-IN")}
          </div>
          <span className="text-[10.5px] text-[#167C5A] font-bold mt-1 block">
            {fin.promoterSharePercent}% own margin
          </span>
        </div>

        {/* Government Subsidy */}
        <div className="bg-white rounded-xl p-4 border border-[#DCE4E8] shadow-subtle">
          <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">
            Govt Subsidy
          </span>
          <div className="mt-1.5 text-lg sm:text-xl font-black text-[#167C5A]">
            ₹{Number(fin.governmentSubsidyAmount || 0).toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-[#667085] mt-1 block">
            {assumptions.subsidyPercent}% capital grant
          </span>
        </div>

        {/* Net Bank Loan Required */}
        <div className="bg-white rounded-xl p-4 border border-[#123B5D]/30 shadow-subtle bg-[#EEF4FA]/40">
          <span className="text-[11px] font-bold text-[#123B5D] uppercase tracking-wider block">
            {t("financial.loanAmount", language)}
          </span>
          <div className="mt-1.5 text-lg sm:text-xl font-black text-[#123B5D]">
            ₹{Number(fin.loanAmount || 0).toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-[#667085] mt-1 block">
            @ {fin.annualInterestRate}% p.a.
          </span>
        </div>

        {/* Monthly EMI */}
        <div className="bg-white rounded-xl p-4 border border-[#F59E0B]/30 shadow-subtle bg-[#FFF7E6]/40">
          <span className="text-[11px] font-bold text-[#9A6500] uppercase tracking-wider block">
            {t("financial.monthlyEmi", language)}
          </span>
          <div className="mt-1.5 text-lg sm:text-xl font-black text-[#9A6500]">
            ₹{Number(fin.monthlyEmi || 0).toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-[#667085] mt-1 block">
            {fin.tenureMonths} mos ({fin.moratoriumMonths}m grace)
          </span>
        </div>

        {/* Monthly Net Profit */}
        <div className="bg-white rounded-xl p-4 border border-[#167C5A]/30 shadow-subtle bg-[#E8F6F1]/40">
          <span className="text-[11px] font-bold text-[#167C5A] uppercase tracking-wider block">
            {t("financial.netProfit", language)}
          </span>
          <div className="mt-1.5 text-lg sm:text-xl font-black text-[#167C5A]">
            ₹{Number(fin.monthlyNetProfitAfterEMI || 0).toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-[#667085] mt-1 block">
            After full EMI debit
          </span>
        </div>
      </div>

      {/* INTERACTIVE ASSUMPTION SLIDERS & BREAK-EVEN CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Col: Interactive Controls & Sliders */}
        <div className="bg-white rounded-xl border border-[#DCE4E8] shadow-subtle p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE4E8]/70">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-[#123B5D]" />
              <h3 className="text-xs font-bold text-[#17212B] uppercase tracking-wide">
                {t("financial.adjustAssumptions", language)}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => handleRecalculate()}
              className="text-[11px] font-bold text-[#123B5D] hover:underline"
            >
              Reset to Base
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Project Outlay Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#17212B] font-semibold">
                  Total Project Cost:
                </span>
                <span className="font-black text-[#17212B]">
                  ₹{assumptions.projectCost.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min="20000"
                max="500000"
                step="5000"
                value={assumptions.projectCost}
                onChange={(e) =>
                  handleSliderChange("projectCost", e.target.value)
                }
                className="w-full accent-[#123B5D] cursor-pointer"
              />
            </div>

            {/* Promoter Margin % */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#17212B] font-semibold">
                  Promoter Equity Margin:
                </span>
                <span className="font-black text-[#167C5A]">
                  {assumptions.promoterSharePercent}% (₹
                  {Math.round(
                    assumptions.projectCost *
                      (assumptions.promoterSharePercent / 100),
                  ).toLocaleString("en-IN")}
                  )
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={assumptions.promoterSharePercent}
                onChange={(e) =>
                  handleSliderChange("promoterSharePercent", e.target.value)
                }
                className="w-full accent-[#167C5A] cursor-pointer"
              />
            </div>

            {/* Interest Rate Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#17212B] font-semibold">
                  Annual Concessional Rate:
                </span>
                <span className="font-black text-[#123B5D]">
                  {assumptions.annualInterestRate}% p.a.
                </span>
              </div>
              <input
                type="range"
                min="3.5"
                max="12.0"
                step="0.5"
                value={assumptions.annualInterestRate}
                onChange={(e) =>
                  handleSliderChange("annualInterestRate", e.target.value)
                }
                className="w-full accent-[#123B5D] cursor-pointer"
              />
            </div>

            {/* Tenure Months */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#17212B] font-semibold">
                  Repayment Tenure:
                </span>
                <span className="font-black text-[#17212B]">
                  {assumptions.tenureMonths} Months (
                  {Math.round(assumptions.tenureMonths / 12)} Years)
                </span>
              </div>
              <input
                type="range"
                min="12"
                max="84"
                step="6"
                value={assumptions.tenureMonths}
                onChange={(e) =>
                  handleSliderChange("tenureMonths", e.target.value)
                }
                className="w-full accent-[#123B5D] cursor-pointer"
              />
            </div>

            {/* Moratorium Months */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#17212B] font-semibold">
                  Moratorium (Grace Period):
                </span>
                <span className="font-black text-[#F59E0B]">
                  {assumptions.moratoriumMonths} Months
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                step="1"
                value={assumptions.moratoriumMonths}
                onChange={(e) =>
                  handleSliderChange("moratoriumMonths", e.target.value)
                }
                className="w-full accent-[#F59E0B] cursor-pointer"
              />
            </div>

            {/* Revenue Assumption */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#17212B] font-semibold">
                  Est. Monthly Gross Revenue:
                </span>
                <span className="font-black text-[#167C5A]">
                  ₹{assumptions.estimatedMonthlyRevenue.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min="15000"
                max="150000"
                step="1000"
                value={assumptions.estimatedMonthlyRevenue}
                onChange={(e) =>
                  handleSliderChange("estimatedMonthlyRevenue", e.target.value)
                }
                className="w-full accent-[#167C5A] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Break-Even Chart & Viability Assessment */}
        <div className="bg-white rounded-xl border border-[#DCE4E8] shadow-subtle p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-[#DCE4E8]/70">
              <BarChart3 className="w-4 h-4 text-[#167C5A]" />
              <h3 className="text-xs font-bold text-[#17212B] uppercase tracking-wide">
                {t("financial.breakEvenChart", language)}
              </h3>
            </div>

            {/* Pure SVG Responsive Break-Even Visualizer */}
            <div className="bg-[#F7F9F7] rounded-xl p-4 border border-[#DCE4E8]">
              <div className="flex items-center justify-between text-[11px] text-[#667085] mb-2">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center">
                    <span className="w-2.5 h-2.5 bg-[#167C5A] rounded-sm mr-1.5"></span>
                    <span className="font-semibold text-[#17212B]">
                      Revenue
                    </span>
                  </span>
                  <span className="flex items-center">
                    <span className="w-2.5 h-2.5 bg-[#DC2626] rounded-sm mr-1.5"></span>
                    <span className="font-semibold text-[#17212B]">
                      Total Cost (Opex + EMI)
                    </span>
                  </span>
                </div>
                <span>Capacity: 20% to 100%</span>
              </div>

              {/* Chart SVG */}
              <svg
                viewBox="0 0 360 140"
                className="w-full h-36 overflow-visible"
              >
                {/* Grid lines */}
                <line
                  x1="30"
                  y1="20"
                  x2="350"
                  y2="20"
                  stroke="#DCE4E8"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                <line
                  x1="30"
                  y1="60"
                  x2="350"
                  y2="60"
                  stroke="#DCE4E8"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                <line
                  x1="30"
                  y1="100"
                  x2="350"
                  y2="100"
                  stroke="#DCE4E8"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                <line
                  x1="30"
                  y1="120"
                  x2="350"
                  y2="120"
                  stroke="#667085"
                  strokeWidth="1.5"
                />

                {/* Bars per capacity */}
                {breakEvenData.map((d, i) => {
                  const x = 50 + i * 65;
                  const revHeight = Math.min(
                    100,
                    Math.max(5, (d.revenue / 60000) * 100),
                  );
                  const costHeight = Math.min(
                    100,
                    Math.max(5, (d.totalCost / 60000) * 100),
                  );

                  return (
                    <g key={i}>
                      {/* Cost bar (Rose) */}
                      <rect
                        x={x}
                        y={120 - costHeight}
                        width="18"
                        height={costHeight}
                        fill="#DC2626"
                        rx="3"
                        opacity="0.85"
                      />
                      {/* Revenue bar (Emerald) */}
                      <rect
                        x={x + 20}
                        y={120 - revHeight}
                        width="18"
                        height={revHeight}
                        fill="#167C5A"
                        rx="3"
                      />
                      {/* Label */}
                      <text
                        x={x + 19}
                        y="134"
                        fontSize="9"
                        textAnchor="middle"
                        fill="#667085"
                        fontWeight="600"
                      >
                        {d.capacityPercent}%
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="mt-2 text-center text-[11px] text-[#667085] font-medium">
                Enterprise achieves profitability at approx.{" "}
                <strong className="text-[#167C5A]">
                  {fin.breakEvenDaysPerMonth || 8} operational days / month
                </strong>
              </div>
            </div>

            {/* DSCR Bankability Assessment */}
            <div className="mt-4 p-3.5 rounded-xl bg-[#E8F6F1] border border-[#A9DDCB] text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[#105D44]">
                  Debt Service Coverage Ratio (DSCR):{" "}
                  {fin.debtServiceCoverageRatio}x
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-[#167C5A] text-white font-black text-[10px] uppercase">
                  {fin.dscrRating}
                </span>
              </div>
              <p className="text-[11px] text-[#105D44]/90">
                Banks require a minimum 1.5x DSCR for micro-enterprise credit
                sanction. Your projected cash generation covers debt obligations
                comfortably with a safety cushion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* COLLAPSIBLE AMORTIZATION SCHEDULE TABLE */}
      <div className="bg-white rounded-xl border border-[#DCE4E8] shadow-subtle overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAmortization(!showAmortization)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition"
        >
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[#123B5D]" />
            <span className="text-xs font-bold text-[#17212B] uppercase tracking-wide">
              {t("financial.amortizationTable", language)} ({fin.tenureMonths}{" "}
              Months Loan Lifecycle)
            </span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-[#123B5D] font-bold">
            <span>
              {showAmortization ? "Hide Schedule" : "View Full EMI Breakdown"}
            </span>
            {showAmortization ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {showAmortization && (
          <div className="p-4 border-t border-[#DCE4E8] overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F7F9F7] border-b border-[#DCE4E8] text-[#667085] text-[11px] font-bold uppercase">
                  <th className="py-2 px-3">Month</th>
                  <th className="py-2 px-3">Repayment Phase</th>
                  <th className="py-2 px-3">Opening Principal</th>
                  <th className="py-2 px-3">Principal Paid</th>
                  <th className="py-2 px-3">Interest Paid</th>
                  <th className="py-2 px-3">Total Installment</th>
                  <th className="py-2 px-3">Closing Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE4E8]/60 text-[#17212B]">
                {schedule.map((row) => (
                  <tr key={row.month} className="hover:bg-[#F7F9F7]/60">
                    <td className="py-2 px-3 font-bold text-[#17212B]">
                      M-{row.month}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.phase === "Moratorium"
                            ? "bg-[#FFF7E6] text-[#9A6500] border border-[#F59E0B]/30"
                            : "bg-[#EEF4FA] text-[#123B5D] border border-[#123B5D]/20"
                        }`}
                      >
                        {row.phase}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      ₹{row.openingBalance.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2 px-3 font-semibold text-[#167C5A]">
                      ₹{row.principalPaid.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2 px-3 text-[#667085]">
                      ₹{row.interestPaid.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2 px-3 font-bold text-[#17212B]">
                      ₹{row.totalPayment.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2 px-3">
                      ₹{row.closingBalance.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* NAVIGATION BAR */}
      <div className="bg-white rounded-xl shadow-card border border-[#DCE4E8] p-4 flex items-center justify-between">
        <button
          onClick={() => setActiveStep(3)}
          className="px-4 py-2.5 rounded-lg text-xs font-bold border border-[#DCE4E8] text-[#17212B] hover:bg-slate-50 flex items-center space-x-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("form.back", language)}</span>
        </button>

        <button
          onClick={() => {
            setActiveStep(5);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="px-6 py-2.5 rounded-lg text-xs font-bold bg-[#123B5D] hover:bg-[#0D2E49] text-white shadow-sm flex items-center space-x-2 transition"
        >
          <span>Continue to Government Scheme Match</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
