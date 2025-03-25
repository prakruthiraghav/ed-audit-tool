"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import PageTransition from "../../components/PageTransition";

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

export default function PhotoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchPhoto();
    }
  }, [status, router, params.id]);

  const fetchPhoto = async () => {
    try {
      const response = await fetch(`/api/photos/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch photo");
      const data = await response.json();
      setPhoto(data);
    } catch (error) {
      console.error("Error fetching photo:", error);
      router.push("/gallery");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!photo) {
    return null;
  }

  return (
    <PageTransition>
      <div className="fixed inset-0 bg-black">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <button
              onClick={() => router.back()}
              className="text-white hover:text-purple-300 transition-colors"
            >
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <div className="text-white text-sm">
              {new Date(photo.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Photo */}
        <div className="relative w-full h-full">
          <Image
            src={photo.url}
            alt={photo.description || `Photo with ${photo.filter.name} filter`}
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-white font-medium">
              Filter: {photo.filter.name}
            </div>
            {photo.description && (
              <p className="text-white/90 mt-2">{photo.description}</p>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
