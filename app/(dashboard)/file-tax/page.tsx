"use client";

import { useEffect, useState } from "react";

type TaxReturn = {
  id: number;
  externalReturnId: string;
  taxYear: number;
  status: string;
  lastEventAt: string | null;
  lastEventType: string;
};

export default function FileTaxPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [returnsLoading, setReturnsLoading] = useState(true);
  const [returnsError, setReturnsError] = useState<string | null>(null);
  const [taxReturns, setTaxReturns] = useState<TaxReturn[]>([]);

  const handleFileTax = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tax-login-url", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get tax filing URL");
      }

      if (data.login_url) {
        // Open the tax filing URL in the same tab
        window.location.href = data.login_url;
      } else {
        throw new Error("No login URL received");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const fetchReturns = async () => {
      try {
        const response = await fetch("/api/tax-returns");
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          const message = data.error || "Failed to load tax return updates";
          throw new Error(message);
        }

        const data = await response.json();
        if (active) {
          setTaxReturns(data.taxReturns || []);
        }
      } catch (err) {
        if (active) {
          setReturnsError(
            err instanceof Error
              ? err.message
              : "Unable to load tax return updates",
          );
        }
      } finally {
        if (active) {
          setReturnsLoading(false);
        }
      }
    };

    fetchReturns();

    return () => {
      active = false;
    };
  }, []);

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      created: "Just Created",
      in_progress: "In Progress",
      submitted: "Submitted",
      rejected: "Needs Revision",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      created: "text-blue-700",
      in_progress: "text-amber-700",
      submitted: "text-green-700",
      rejected: "text-red-700",
    };
    return colorMap[status] || "text-indigo-700";
  };

  const renderReturnStatus = () => {
    if (returnsLoading) {
      return <p className="text-gray-600">Loading your tax return status...</p>;
    }

    if (returnsError) {
      return <p className="text-red-600">{returnsError}</p>;
    }

    if (!taxReturns.length) {
      return <p className="text-gray-600">No tax return activity yet.</p>;
    }

    return (
      <div className="space-y-3">
        {taxReturns.map((item) => (
          <div
            key={item.id}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-lg border border-gray-200 p-4"
          >
            <div>
              <p className="text-sm text-gray-500">Tax Year</p>
              <p className="text-lg font-semibold text-gray-900">
                {item.taxYear}
              </p>
              <p className="text-xs text-gray-500 break-all">
                Return ID: {item.externalReturnId}
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm text-gray-500">Status</p>
              <p
                className={`text-base font-semibold ${getStatusColor(item.status)}`}
              >
                {getStatusLabel(item.status)}
              </p>
              <p className="text-xs text-gray-500">
                {item.lastEventAt
                  ? `Updated ${new Date(item.lastEventAt).toLocaleString()}`
                  : item.lastEventType}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">File Your Tax</h1>
        <p className="text-gray-600 mt-1">
          Complete your Canadian tax return quickly and easily
        </p>
      </div>

      {/* Tax Filing Benefits */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Why File With Us?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">CRA Certified</p>
              <p className="text-sm text-gray-500">
                NETFILE certified for secure e-filing
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Maximum Refund</p>
              <p className="text-sm text-gray-500">
                We find every deduction you qualify for
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Fast & Easy</p>
              <p className="text-sm text-gray-500">
                Complete your return in minutes
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Bank-Level Security</p>
              <p className="text-sm text-gray-500">
                Your data is encrypted and protected
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Year Info */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
            <span className="text-2xl font-bold text-indigo-600">2025</span>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">
              2025 Tax Year Filing
            </p>
            <p className="text-gray-600">
              File your 2025 Canadian income tax return. Deadline: April 30,
              2026
            </p>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-amber-50 rounded-xl p-6 border border-amber-200 mb-6">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <p className="font-medium text-amber-800">Before You Start</p>
            <ul className="mt-2 text-sm text-amber-700 space-y-1">
              <li>• Make sure your personal information is up to date</li>
              <li>• Have your T4, T5, and other tax slips ready</li>
              <li>• Gather receipts for deductions and credits</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Return Updates
            </h2>
            <p className="text-sm text-gray-600">
              Latest activity from your tax filings
            </p>
          </div>
          {!returnsLoading && !returnsError && taxReturns.length > 0 && (
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full">
              {taxReturns.length} active
            </span>
          )}
        </div>
        {renderReturnStatus()}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* File Tax Button */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Click the button below to start filing your taxes. You&apos;ll be
            redirected to our secure tax filing platform.
          </p>
          <button
            onClick={handleFileTax}
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Preparing...
              </>
            ) : (
              <>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Start Filing My Taxes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
