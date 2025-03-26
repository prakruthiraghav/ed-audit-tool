"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import PageTransition from "../components/PageTransition";
import Navigation from "../components/Navigation";

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

export default function AuditsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      fetchAudits();
    }
  }, [status, router]);

  const fetchAudits = async () => {
    try {
      const response = await fetch("/api/audits");
      if (!response.ok) throw new Error("Failed to fetch audits");
      const data = await response.json();
      setAudits(data);
    } catch (error) {
      console.error("Error fetching audits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50">
      <Navigation />
      <PageTransition>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="space-y-8">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold bg-clip-text text-purple-600">
                    My Audits
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Manage and view your audits
                  </p>
                </div>
                <Link
                  href="/create-audit"
                  className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-green-500 hover:from-purple-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all transform hover:scale-105"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create New Audit
                </Link>
              </div>

              {/* Audits List */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-purple-100">
                {audits.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>
                      No audits yet. Create your first audit to get started!
                    </p>
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
            </div>
          </div>
        </div>
      </PageTransition>
    </div>
  );
}
