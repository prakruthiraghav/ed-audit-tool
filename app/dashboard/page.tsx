"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import PageTransition from "../components/PageTransition";

interface Photo {
  id: string;
  url: string;
  description?: string;
  filterId: string;
  createdAt: string;
  filter: {
    name: string;
  };
}

interface Audit {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  filter: {
    name: string;
  };
  photo?: {
    url: string;
  };
  user: {
    name: string;
    image: string;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [publicAudits, setPublicAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      fetchPhotos();
      fetchPublicAudits();
    }
  }, [status, router]);

  const fetchPhotos = async () => {
    try {
      const response = await fetch("/api/photos");
      if (!response.ok) throw new Error("Failed to fetch photos");
      const data = await response.json();
      setPhotos(data.slice(0, 6)); // Show only latest 6 photos
    } catch (error) {
      console.error("Error fetching photos:", error);
    }
  };

  const fetchPublicAudits = async () => {
    try {
      const response = await fetch("/api/audits/public");
      if (!response.ok) throw new Error("Failed to fetch public audits");
      const data = await response.json();
      setPublicAudits(data.slice(0, 6)); // Show only latest 6 audits
    } catch (error) {
      console.error("Error fetching public audits:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50">
      <PageTransition>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="space-y-8">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-green-500">
                  Welcome to EduAudit
                </h1>
                <p className="mt-2 text-gray-600">
                  Your educational audit and filter management platform
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Audits Card */}
                <Link
                  href="/audits"
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-purple-100"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        My Audits
                      </h3>
                      <p className="text-sm text-gray-500">
                        View and manage your educational audits
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Filters Card */}
                <Link
                  href="/filters"
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-purple-100"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Camera Filters
                      </h3>
                      <p className="text-sm text-gray-500">
                        Try out different artistic filters on your webcam
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Gallery Card */}
                <Link
                  href="/gallery"
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-purple-100"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Photo Gallery
                      </h3>
                      <p className="text-sm text-gray-500">
                        Browse and manage your filtered photos
                      </p>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Recent Photos */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Recent Photos
                  </h2>
                  <Link
                    href="/gallery"
                    className="text-sm text-purple-600 hover:text-purple-500 transition-colors"
                  >
                    View all photos
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {photos.map((photo) => (
                    <Link
                      key={photo.id}
                      href={`/photos/${photo.id}`}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <Image
                        src={photo.url}
                        alt={
                          photo.description ||
                          `Photo with ${photo.filter.name} filter`
                        }
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white text-sm font-medium">
                            {photo.filter.name}
                          </p>
                          {photo.description && (
                            <p className="text-white/90 text-xs line-clamp-2 mt-1">
                              {photo.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Public Audits */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Public Audits
                  </h2>
                  <Link
                    href="/audits"
                    className="text-sm text-purple-600 hover:text-purple-500 transition-colors"
                  >
                    View all audits
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {publicAudits.map((audit) => (
                    <Link
                      key={audit.id}
                      href={`/audit/${audit.id}`}
                      className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-purple-100"
                    >
                      {audit.photo && (
                        <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                          <Image
                            src={audit.photo.url}
                            alt={audit.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {audit.title}
                      </h3>
                      {audit.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {audit.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {audit.user.image && (
                            <Image
                              src={audit.user.image}
                              alt={audit.user.name}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                          )}
                          <span className="text-sm text-gray-600">
                            {audit.user.name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(audit.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </div>
  );
}
