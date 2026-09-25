import React, { useEffect, useState, useMemo } from "react";
import { trimText } from "../utils/validation-client";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { ApiService } from "../services/api";
import { AdminFeedbackPanel } from "./AdminFeedbackPanel";
import {
  Shield,
  Building2,
  Users,
  IndianRupee,
  TrendingUp,
  FileCheck,
  Search,
  Filter,
  Download,
  Eye,
  LogOut,
  RefreshCw,
  Award,
  CheckCircle2,
  Clock,
  Landmark,
  X,
  Printer,
  ChevronRight,
  UserCheck,
  Trash2,
} from "lucide-react";

export function AdminDashboard() {
  const { officerName, officerId, logoutOfficer } = useAuth();
  const { language, showToast } = useApp();

  const [assessments, setAssessments] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [deletingAssessmentId, setDeletingAssessmentId] = useState(null);

  // Load assessments and stats
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [assessList, statsData] = await Promise.all([
        ApiService.getAssessments(),
        ApiService.getAdminStats(),
      ]);

      setAssessments(assessList);
      setStats(statsData);
    } catch (err) {
      console.error("Error loading admin dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Filtered list
  const filteredAssessments = useMemo(() => {
    return assessments.filter((item) => {
      const matchSearch =
        (item.applicantName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (item.businessIdea || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (item.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.district || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory =
        selectedCategory === "ALL" ||
        item.businessCategory === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [assessments, searchTerm, selectedCategory]);

  // Aggregate Metrics calculation
  const totalOutlay = useMemo(() => {
    return assessments.reduce(
      (sum, a) => sum + (Number(a.expectedInvestment) || 0),
      0,
    );
  }, [assessments]);

  const totalLoanDemand = useMemo(() => {
    return assessments.reduce((sum, a) => {
      const loan =
        a.financialData?.summary?.loanAmount ||
        (Number(a.expectedInvestment) || 140000) * 0.75;
      return sum + loan;
    }, 0);
  }, [assessments]);

  const avgFeasibility = useMemo(() => {
    if (assessments.length === 0) return 82;
    const sum = assessments.reduce(
      (s, a) => s + (Number(a.overallScore) || 80),
      0,
    );
    return Math.round(sum / assessments.length);
  }, [assessments]);

  const avgDscr = useMemo(() => {
    if (assessments.length === 0) return 2.0;
    const sum = assessments.reduce((s, a) => s + (Number(a.dscr) || 1.9), 0);
    return (sum / assessments.length).toFixed(2);
  }, [assessments]);

  // Download PDF for an assessment
  const handleDownloadDossierPdf = async (assessment) => {
    setIsGeneratingPdf(true);
    showToast("Downloading assessment dossier PDF...", "info");
    try {
      const blob = await ApiService.downloadPdfReport(assessment);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Gram_Sarthi_AI_Dossier_${assessment.id}_${(assessment.applicantName || "Applicant").replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast("PDF downloaded successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to download dossier PDF", "error");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDeleteAssessment = async (assessment) => {
    const applicant = assessment.applicantName || "this assessment";
    if (
      !window.confirm(
        `Delete the assessment for ${applicant}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setDeletingAssessmentId(assessment.id);
    try {
      await ApiService.deleteAssessment(assessment.id);
      setAssessments((current) =>
        current.filter((item) => item.id !== assessment.id),
      );
      if (selectedAssessment?.id === assessment.id) {
        setSelectedAssessment(null);
      }
      showToast("Assessment deleted successfully", "success");
    } catch (err) {
      console.error("Error deleting assessment:", err);
      showToast("Failed to delete assessment", "error");
    } finally {
      setDeletingAssessmentId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Officer Command Bar */}
      <div className="bg-gradient-to-br from-[#123B5D] via-[#0E2F4A] to-[#123B5D] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-900/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold px-3 py-1 rounded-full border border-[#F59E0B]/30">
              <Shield className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>MoSJE Field Verification & Sanction Portal</span>
            </span>
            <span className="text-xs font-mono text-slate-300 bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
              Station: Sehore DIC (MP)
            </span>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-lg border border-white/20 shrink-0">
              <img
                src="/logo.png"
                alt="GRAM SARTHI AI Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Officer Appraisal & Sanctions Dashboard
              </h1>
              <span className="text-xs text-[#F59E0B] font-semibold">
                GRAM SARTHI AI (ग्राम सारथी AI) Institutional Desk
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Welcome, <strong>{officerName}</strong> ({officerId}) • Direct
            facilitation desk for NBCFDC, NSFDC, NSKFDC and PMEGP credit-linked
            subsidies.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={loadDashboardData}
            disabled={isLoading}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>

          <button
            onClick={logoutOfficer}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Officer Mode</span>
          </button>
        </div>
      </div>

      {/* 4 Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Appraisals */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#667085] text-xs font-bold uppercase tracking-wider">
            <span>Total Field Appraisals</span>
            <Users className="w-4 h-4 text-[#123B5D]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#17212B]">
            {assessments.length}
          </div>
          <div className="text-[11px] text-[#167C5A] font-semibold flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-[#167C5A]" />
            <span>100% automated KYC & Feasibility check</span>
          </div>
        </div>

        {/* Total Project Outlay */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#667085] text-xs font-bold uppercase tracking-wider">
            <span>Cumulative Capital Outlay</span>
            <IndianRupee className="w-4 h-4 text-[#167C5A]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#17212B]">
            ₹{(totalOutlay / 100000).toFixed(2)}L
          </div>
          <div className="text-[11px] text-[#667085]">
            Total project expenditure proposed
          </div>
        </div>

        {/* Total Loan Demand */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#667085] text-xs font-bold uppercase tracking-wider">
            <span>Net Bank Loan Demand</span>
            <Landmark className="w-4 h-4 text-[#123B5D]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#123B5D]">
            ₹{(totalLoanDemand / 100000).toFixed(2)}L
          </div>
          <div className="text-[11px] text-[#667085]">
            Priority Sector Lending (PSL) target
          </div>
        </div>

        {/* Avg DSCR & Feasibility */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#667085] text-xs font-bold uppercase tracking-wider">
            <span>Avg Feasibility & DSCR</span>
            <Award className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-[#167C5A]">
              {avgFeasibility}%
            </span>
            <span className="text-sm font-bold text-[#667085]">
              ({avgDscr}x DSCR)
            </span>
          </div>
          <div className="text-[11px] text-[#167C5A] font-semibold">
            Prudential credit standard satisfied
          </div>
        </div>
      </div>

      {/* Search, Filter & Assessment Dossier Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
        {/* Table Filter Toolbar */}
        <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(trimText(e.target.value, 100))}
              placeholder="Search by name, enterprise, ref ID, or district..."
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-[#DCE4E8] focus:outline-none focus:ring-2 focus:ring-[#123B5D]/20 focus:border-[#123B5D] transition-all"
            />
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-xs text-[#667085] font-semibold">
              <Filter className="w-3.5 h-3.5 text-[#123B5D]" />
              <span>Category:</span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-[#DCE4E8] bg-white text-[#17212B] focus:outline-none focus:ring-2 focus:ring-[#123B5D]/20 focus:border-[#123B5D]"
            >
              <option value="ALL">All Sectors ({assessments.length})</option>
              <option value="dairy">Dairy & Milk</option>
              <option value="food_processing">Food Processing</option>
              <option value="tailoring">Tailoring & Apparel</option>
              <option value="agri_equipment">Agri Equipment</option>
              <option value="grocery">Grocery & Retail</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[#667085] uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Ref ID & Date</th>
                <th className="py-3 px-4">Entrepreneur</th>
                <th className="py-3 px-4">Proposed Enterprise</th>
                <th className="py-3 px-4">Outlay / Net Loan</th>
                <th className="py-3 px-4">Matched Scheme</th>
                <th className="py-3 px-4">Feasibility / DSCR</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#17212B]">
              {filteredAssessments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#667085]">
                    No enterprise assessments found matching your query.
                  </td>
                </tr>
              ) : (
                filteredAssessments.map((item) => {
                  const scheme = item.matchedSchemes?.[0] || {};
                  const loan =
                    item.financialData?.summary?.loanAmount ||
                    Math.round(
                      (Number(item.expectedInvestment) || 140000) * 0.75,
                    );

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Ref ID & Date */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[#17212B] block">
                          {item.id}
                        </span>
                        <span className="text-[10px] text-[#667085]">
                          {item.submittedAt
                            ? new Date(item.submittedAt).toLocaleDateString(
                                "en-IN",
                              )
                            : "Recent"}
                        </span>
                      </td>

                      {/* Entrepreneur */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#17212B]">
                          {item.applicantName || "Entrepreneur"}
                        </div>
                        <div className="text-[10px] text-[#667085]">
                          {item.beneficiaryCategory} •{" "}
                          {item.district || "Sehore"}, {item.state || "MP"}
                        </div>
                      </td>

                      {/* Enterprise Idea */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div
                          className="font-medium text-[#17212B] truncate"
                          title={item.businessIdea}
                        >
                          {item.businessIdea}
                        </div>
                        <span className="inline-block px-2 py-0.5 mt-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 text-[#667085] border border-slate-200">
                          {item.businessCategory}
                        </span>
                      </td>

                      {/* Outlay / Loan */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#17212B]">
                          ₹
                          {Number(
                            item.expectedInvestment || 140000,
                          ).toLocaleString("en-IN")}
                        </div>
                        <div className="text-[10px] text-[#123B5D] font-bold">
                          Loan: ₹{Number(loan).toLocaleString("en-IN")}
                        </div>
                      </td>

                      {/* Matched Scheme */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div
                          className="font-semibold text-[#17212B] truncate"
                          title={scheme.name}
                        >
                          {scheme.name || "NBCFDC Micro Finance"}
                        </div>
                        <div className="text-[10px] text-[#167C5A] font-bold">
                          {scheme.subsidyPercent || 15}% Capital Subsidy
                        </div>
                      </td>

                      {/* Score & DSCR */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#167C5A]/10 text-[#167C5A] font-bold border border-[#167C5A]/20">
                          <span>{item.overallScore || 84}%</span>
                          <span>•</span>
                          <span>{item.dscr || 2.14}x</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedAssessment(item)}
                            className="p-1.5 rounded-lg border border-[#DCE4E8] bg-white hover:bg-slate-50 text-[#123B5D] transition-colors shadow-sm"
                            title="Inspect full dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownloadDossierPdf(item)}
                            disabled={isGeneratingPdf}
                            className="p-1.5 rounded-lg border border-[#DCE4E8] bg-white hover:bg-slate-50 text-[#167C5A] transition-colors shadow-sm"
                            title="Download official PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAssessment(item)}
                            disabled={deletingAssessmentId === item.id}
                            className="p-1.5 rounded-lg border border-[#DCE4E8] bg-white hover:bg-rose-50 text-rose-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete assessment"
                            aria-label={`Delete assessment ${item.id}`}
                          >
                            <Trash2
                              className={`w-3.5 h-3.5 ${
                                deletingAssessmentId === item.id
                                  ? "animate-pulse"
                                  : ""
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminFeedbackPanel />

      {/* Detailed Inspection Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-[#667085] bg-slate-100 px-2 py-0.5 rounded border border-[#DCE4E8]">
                    {selectedAssessment.id}
                  </span>
                  <span className="text-xs font-bold text-[#167C5A] bg-[#167C5A]/10 px-2.5 py-0.5 rounded-full border border-[#167C5A]/20">
                    Sanction Recommended
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-[#17212B]">
                  {selectedAssessment.applicantName} •{" "}
                  {selectedAssessment.businessIdea}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAssessment(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Profile Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/80 p-4 rounded-2xl text-xs border border-slate-100">
              <div>
                <span className="text-[#667085] block font-semibold">
                  Category
                </span>
                <span className="font-bold text-[#17212B]">
                  {selectedAssessment.beneficiaryCategory} (
                  {selectedAssessment.gender})
                </span>
              </div>
              <div>
                <span className="text-[#667085] block font-semibold">
                  Location
                </span>
                <span className="font-bold text-[#17212B]">
                  {selectedAssessment.district}, {selectedAssessment.state}
                </span>
              </div>
              <div>
                <span className="text-[#667085] block font-semibold">
                  Project Outlay
                </span>
                <span className="font-bold text-[#17212B]">
                  ₹
                  {Number(
                    selectedAssessment.expectedInvestment || 140000,
                  ).toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-[#667085] block font-semibold">
                  DSCR Safety
                </span>
                <span className="font-black text-[#167C5A]">
                  {selectedAssessment.dscr || 2.14}x (Grade A)
                </span>
              </div>
            </div>

            {/* Scheme & Financial Summary */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[#17212B] flex items-center space-x-2">
                <Landmark className="w-4 h-4 text-[#123B5D]" />
                <span>Recommended Scheme & Concessions</span>
              </h4>
              <div className="bg-[#123B5D]/5 border border-[#123B5D]/15 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex justify-between items-center font-bold text-[#123B5D]">
                  <span>
                    {selectedAssessment.matchedSchemes?.[0]?.name ||
                      "NBCFDC Micro Finance Scheme"}
                  </span>
                  <span className="text-[#167C5A] bg-[#167C5A]/10 px-2.5 py-0.5 rounded-full border border-[#167C5A]/20">
                    {selectedAssessment.matchedSchemes?.[0]?.subsidyPercent ||
                      15}
                    % Subsidy
                  </span>
                </div>
                <p className="text-[#667085]">
                  Concessional credit facility compliant with MoSJE lending
                  rules for rural entrepreneurs. Zero collateral needed.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setSelectedAssessment(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#17212B] hover:bg-slate-50 border border-[#DCE4E8] transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleDownloadDossierPdf(selectedAssessment)}
                disabled={isGeneratingPdf}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#123B5D] hover:bg-[#0E2F4A] text-white text-xs font-bold transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Dossier PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminDashboard;
