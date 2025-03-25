"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface Photo {
  id: string;
  url: string;
  filterId: string;
  createdAt: string;
}

interface Filter {
  id: string;
  name: string;
  category: string;
}

interface GroupedPhotos {
  [filterId: string]: {
    filter: Filter;
    photos: Photo[];
  };
}

interface PhotoGalleryProps {
  onSelect: (photo: Photo | null) => void;
  selectedPhotoId?: string;
}

export default function PhotoGallery({
  onSelect,
  selectedPhotoId,
}: PhotoGalleryProps) {
  const { data: session } = useSession();
  const [groupedPhotos, setGroupedPhotos] = useState<GroupedPhotos>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotosAndFilters = async () => {
      try {
        // Fetch photos
        const photosResponse = await fetch("/api/photos");
        if (!photosResponse.ok) throw new Error("Failed to fetch photos");
        const photos: Photo[] = await photosResponse.json();

        // Fetch filters
        const filtersResponse = await fetch("/api/filters");
        if (!filtersResponse.ok) throw new Error("Failed to fetch filters");
        const filters: Filter[] = await filtersResponse.json();

        // Group photos by filter
        const grouped: GroupedPhotos = {};
        photos.forEach((photo) => {
          const filter = filters.find((f) => f.id === photo.filterId);
          if (filter) {
            if (!grouped[photo.filterId]) {
              grouped[photo.filterId] = {
                filter,
                photos: [],
              };
            }
            grouped[photo.filterId].photos.push(photo);
          }
        });

        setGroupedPhotos(grouped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchPhotosAndFilters();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4 bg-red-50 rounded-xl">
        Error: {error}
      </div>
    );
  }

  if (Object.keys(groupedPhotos).length === 0) {
    return (
      <div className="text-center text-gray-500 p-8 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
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
        <h3 className="mt-2 text-sm font-medium text-gray-900">No photos</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start by taking some photos with filters!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {Object.values(groupedPhotos).map(({ filter, photos }) => (
        <div key={filter.id} className="space-y-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold text-gray-900">
              {filter.name}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {photos.length} photos
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => onSelect(photo)}
                className={`group relative aspect-square rounded-xl overflow-hidden bg-gray-100 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] ${
                  selectedPhotoId === photo.id ? "ring-2 ring-purple-500" : ""
                }`}
              >
                <Image
                  src={photo.url}
                  alt={`Photo with ${filter.name} filter`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white text-sm">
                      {new Date(photo.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
