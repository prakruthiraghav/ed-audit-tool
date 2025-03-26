"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageTransition from "../../components/PageTransition";
import Navigation from "../../components/Navigation";

interface Audit {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  filter: {
    id: string;
    name: string;
    category: string | null;
  };
  photo: {
    id: string;
    url: string;
  } | null;
}

export default function AuditDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      fetchAudit();
    }
  }, [status, router, params.id]);

  const fetchAudit = async () => {
    try {
      const response = await fetch(`/api/audits/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch audit");
      const data = await response.json();
      setAudit(data);
    } catch (error) {
      console.error("Error fetching audit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this audit? This action cannot be undone."
      )
    )
      return;

    setIsDeleting(true);
    try {
      // Delete the audit from the database
      await fetch(`/api/audits/${params.id}`, {
        method: "DELETE",
      });

      // Redirect to the dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting audit:", error);
      alert("Failed to delete audit");
    } finally {
      setIsDeleting(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-purple-50">
        <Navigation />
        <PageTransition>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">
                  Audit Not Found
                </h1>
                <p className="mt-2 text-gray-600">
                  The audit you're looking for doesn't exist or you don't have
                  access to it.
                </p>
              </div>
            </div>
          </div>
        </PageTransition>
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
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-green-500">
                    {audit.title}
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Created on {new Date(audit.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete Audit
                    </>
                  )}
                </button>
              </div>

              {/* Audit Details */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-purple-100">
                <div className="space-y-6">
                  {/* Description */}
                  {audit.description && (
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        Description
                      </h2>
                      <p className="mt-2 text-gray-600">{audit.description}</p>
                    </div>
                  )}

                  {/* Filter */}
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Filter
                    </h2>
                    <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      {audit.filter.name}
                      {audit.filter.category && (
                        <span className="ml-1 text-purple-600">
                          ({audit.filter.category})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Photo */}
                  {audit.photo && (
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        Photo
                      </h2>
                      <div className="mt-2">
                        <img
                          src={audit.photo.url}
                          alt="Audit photo"
                          className="rounded-xl shadow-lg max-w-2xl"
                        />
                      </div>
                    </div>
                  )}

                  {/* Visibility */}
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Visibility
                    </h2>
                    <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {audit.isPublic ? "Public" : "Private"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </div>
  );
}
