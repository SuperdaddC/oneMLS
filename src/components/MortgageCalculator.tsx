"use client";

import { useState, useMemo } from "react";

interface MortgageCalculatorProps {
  propertyPrice: number;
}

export default function MortgageCalculator({ propertyPrice }: MortgageCalculatorProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [homePrice, setHomePrice] = useState(propertyPrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState<15 | 30>(30);

  const calculations = useMemo(() => {
    const downPayment = homePrice * (downPaymentPercent / 100);
    const loanAmount = homePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm * 12;

    let monthlyPI: number;
    if (monthlyRate === 0) {
      monthlyPI = loanAmount / numPayments;
    } else {
      monthlyPI =
        (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);
    }

    const monthlyTax = (homePrice * 0.011) / 12;
    const monthlyInsurance = (homePrice * 0.0035) / 12;
    const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance;

    return {
      monthlyPI,
      monthlyTax,
      monthlyInsurance,
      totalMonthly,
      downPayment,
      loanAmount,
    };
  }, [homePrice, downPaymentPercent, interestRate, loanTerm]);

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#2a2a3a] bg-[#161620]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-[#1c1c2e]"
      >
        <div className="flex items-center gap-2.5">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#c9a962"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M2 10h20" />
            <path d="M6 8V6" />
            <path d="M10 8V6" />
          </svg>
          <span className="text-sm font-semibold text-white">Mortgage Calculator</span>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="space-y-5 border-t border-[#2a2a3a] px-5 py-5">
          {/* Estimated Monthly Payment */}
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]">
              Estimated Monthly Payment
            </p>
            <p className="mt-1 text-3xl font-bold text-[#c9a962]">
              {formatCurrency(calculations.totalMonthly)}
            </p>
          </div>

          {/* Home Price */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#94a3b8]">Home Price</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#94a3b8]">
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={homePrice.toLocaleString()}
                onChange={(e) => {
                  const val = Number(e.target.value.replace(/[^0-9]/g, ""));
                  if (!isNaN(val)) setHomePrice(val);
                }}
                className="w-full rounded-lg border border-[#2a2a3a] bg-[#0a0a0f] py-2.5 pl-7 pr-3 text-sm text-white outline-none transition-colors focus:border-[#c9a962]"
              />
            </div>
          </div>

          {/* Down Payment */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-[#94a3b8]">Down Payment</label>
              <span className="text-xs font-semibold text-white">
                {downPaymentPercent}% ({formatCurrency(calculations.downPayment)})
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#2a2a3a] accent-[#c9a962] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#c9a962]"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#94a3b8]">Interest Rate</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="15"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full rounded-lg border border-[#2a2a3a] bg-[#0a0a0f] py-2.5 pl-3 pr-8 text-sm text-white outline-none transition-colors focus:border-[#c9a962]"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#94a3b8]">
                %
              </span>
            </div>
          </div>

          {/* Loan Term Toggle */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#94a3b8]">Loan Term</label>
            <div className="flex overflow-hidden rounded-lg border border-[#2a2a3a]">
              <button
                onClick={() => setLoanTerm(30)}
                className={`flex-1 py-2.5 text-center text-sm font-medium transition-colors ${
                  loanTerm === 30
                    ? "bg-[#c9a962] text-[#0a0a0f]"
                    : "bg-[#0a0a0f] text-[#94a3b8] hover:text-white"
                }`}
              >
                30 Years
              </button>
              <button
                onClick={() => setLoanTerm(15)}
                className={`flex-1 border-l border-[#2a2a3a] py-2.5 text-center text-sm font-medium transition-colors ${
                  loanTerm === 15
                    ? "bg-[#c9a962] text-[#0a0a0f]"
                    : "bg-[#0a0a0f] text-[#94a3b8] hover:text-white"
                }`}
              >
                15 Years
              </button>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-2.5 border-t border-[#2a2a3a] pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#94a3b8]">Principal & Interest</span>
              <span className="font-medium text-white">{formatCurrency(calculations.monthlyPI)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#94a3b8]">Property Tax (est.)</span>
              <span className="font-medium text-white">{formatCurrency(calculations.monthlyTax)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#94a3b8]">Insurance (est.)</span>
              <span className="font-medium text-white">{formatCurrency(calculations.monthlyInsurance)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
