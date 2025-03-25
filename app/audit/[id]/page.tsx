"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageTransition from "@/app/components/PageTransition";

interface Audit {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  user: {
    name: string;
    image: string;
  };
  photo?: {
    url: string;
    filterId: string;
  };
}

export default function AuditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const response = await fetch(`/api/audits/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch audit");
        }
        const data = await response.json();
        setAudit(data);
      } catch (err) {
        console.error("Error fetching audit:", err);
        setError("Failed to load audit");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchAudit();
    }
  }, [params.id]);

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
        </div>
      </PageTransition>
    );
  }

  if (error || !audit) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || "Audit not found"}
            </h1>
            <Link
              href="/dashboard"
              className="text-purple-600 hover:text-purple-500"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-purple-100">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-green-500">
                {audit.title}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  audit.isPublic
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {audit.isPublic ? "Public" : "Private"}
              </span>
            </div>
            <p className="text-gray-600">{audit.description}</p>
          </div>

          {audit.photo && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Photo with {audit.photo.filterId} Filter
              </h2>
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <Image
                  src={audit.photo.url}
                  alt={`Photo with ${audit.photo.filterId} filter`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              {audit.user.image && (
                <Image
                  src={audit.user.image}
                  alt={audit.user.name || "User"}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {audit.user.name}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(audit.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="text-purple-600 hover:text-purple-500"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
