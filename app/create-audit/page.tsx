"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageTransition from "../components/PageTransition";
import Navigation from "../components/Navigation";

interface Filter {
  id: string;
  name: string;
  category: string | null;
}

interface Question {
  id: string;
  text: string;
  type: string;
  required: boolean;
  options: string | null;
}

interface Photo {
  id: string;
  url: string;
  filterId: string;
  createdAt: string;
}

export default function CreateAuditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [filters, setFilters] = useState<Filter[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      fetchFilters();
      fetchPhotos();
    }
  }, [status, router]);

  useEffect(() => {
    if (selectedFilter) {
      fetchQuestions();
    }
  }, [selectedFilter]);

  const fetchFilters = async () => {
    try {
      const response = await fetch("/api/filters");
      if (!response.ok) throw new Error("Failed to fetch filters");
      const data = await response.json();
      setFilters(data);
    } catch (error) {
      console.error("Error fetching filters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/filters/${selectedFilter}/questions`);
      if (!response.ok) throw new Error("Failed to fetch questions");
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const fetchPhotos = async () => {
    try {
      const response = await fetch("/api/photos");
      if (!response.ok) throw new Error("Failed to fetch photos");
      const data = await response.json();
      setPhotos(data);
    } catch (error) {
      console.error("Error fetching photos:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFilter || !selectedPhoto) return;

    try {
      const response = await fetch("/api/audits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          isPublic,
          filterId: selectedFilter,
          photoId: selectedPhoto,
        }),
      });

      if (!response.ok) throw new Error("Failed to create audit");
      const data = await response.json();
      router.push(`/audits/${data.id}`);
    } catch (error) {
      console.error("Error creating audit:", error);
    }
  };

  // Filter photos based on selected filter
  const filteredPhotos = photos.filter(
    (photo) => photo.filterId === selectedFilter
  );

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
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-green-500">
                  Create New Audit
                </h1>
                <p className="mt-2 text-gray-600">
                  Create a new educational audit with photos and filters
                </p>
              </div>

              {/* Create Audit Form */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-purple-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-xl border-purple-200 bg-white/50 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full rounded-xl border-purple-200 bg-white/50 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm transition-colors"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                      />
                      <label
                        htmlFor="isPublic"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Make this audit public
                      </label>
                    </div>
                  </div>

                  {/* Filter Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Select a Filter
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {filters.map((filter) => (
                        <div
                          key={filter.id}
                          className={`relative p-4 rounded-xl cursor-pointer transition-all ${
                            selectedFilter === filter.id
                              ? "bg-gradient-to-br from-purple-500 to-green-500 text-white shadow-lg"
                              : "bg-white/50 hover:bg-white/80 border border-purple-100 hover:border-purple-200"
                          }`}
                          onClick={() => {
                            setSelectedFilter(filter.id);
                            setSelectedPhoto(null); // Reset selected photo when filter changes
                          }}
                        >
                          <div className="flex flex-col items-center text-center">
                            <div
                              className={`w-12 h-12 rounded-full mb-3 ${
                                selectedFilter === filter.id
                                  ? "bg-white/20"
                                  : "bg-purple-50"
                              }`}
                            >
                              <svg
                                className={`w-6 h-6 mx-auto mt-3 ${
                                  selectedFilter === filter.id
                                    ? "text-white"
                                    : "text-purple-500"
                                }`}
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
                            <h3
                              className={`font-medium ${
                                selectedFilter === filter.id
                                  ? "text-white"
                                  : "text-gray-900"
                              }`}
                            >
                              {filter.name}
                            </h3>
                            {filter.category && (
                              <p
                                className={`text-sm mt-1 ${
                                  selectedFilter === filter.id
                                    ? "text-white/80"
                                    : "text-gray-500"
                                }`}
                              >
                                {filter.category}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Photo Selection */}
                  {selectedFilter && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select a Photo for{" "}
                        {filters.find((f) => f.id === selectedFilter)?.name}
                      </label>
                      {filteredPhotos.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
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
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No photos available
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Take some photos with this filter first!
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {filteredPhotos.map((photo) => (
                            <div
                              key={photo.id}
                              className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all ${
                                selectedPhoto === photo.id
                                  ? "ring-4 ring-purple-500"
                                  : "hover:ring-2 hover:ring-purple-300"
                              }`}
                              onClick={() => setSelectedPhoto(photo.id)}
                            >
                              <img
                                src={photo.url}
                                alt="Selected photo"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!selectedFilter || !selectedPhoto}
                      className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-green-500 hover:from-purple-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                      Create Audit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </div>
  );
}
