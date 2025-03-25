"use client";

import { useState } from "react";
import Link from "next/link";
import WebcamFilters from "./WebcamFilters";

interface Filter {
  id: string;
  name: string;
  category: string | null;
}

interface Audit {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  filter: {
    name: string;
    category: string | null;
  };
}

interface DashboardTabsProps {
  audits: Audit[];
  filters: Filter[];
}

export default function DashboardTabs({ audits, filters }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<"audits" | "filters">("audits");

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("audits")}
            className={`${
              activeTab === "audits"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            My Audits
          </button>
          <button
            onClick={() => setActiveTab("filters")}
            className={`${
              activeTab === "filters"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Camera Filters
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === "audits" ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-purple-100">
            {audits.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No audits yet. Create your first audit to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {audits.map((audit) => (
                  <div
                    key={audit.id}
                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {audit.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {audit.description || "No description"}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {audit.filter.name}
                          </span>
                          {audit.isPublic && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Public
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/audits/${audit.id}`}
                        className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <WebcamFilters />
        )}
      </div>
    </div>
  );
}
