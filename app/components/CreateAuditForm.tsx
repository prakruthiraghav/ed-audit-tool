"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import WebcamFilters from "./WebcamFilters";
import PhotoGallery from "./PhotoGallery";
import Image from "next/image";

interface Photo {
  id: string;
  url: string;
  filterId: string;
  createdAt: string;
}

export default function CreateAuditForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showWebcam, setShowWebcam] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setLoading(true);
    setError("");

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
          photoId: selectedPhoto?.id,
          filterId: selectedPhoto?.filterId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create audit");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Error creating audit:", err);
      setError("Failed to create audit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoCapture = (photo: Photo) => {
    setSelectedPhoto(photo);
    setShowWebcam(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm text-gray-700">Make this audit public</span>
        </label>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Photo</h3>
          <button
            type="button"
            onClick={() => setShowWebcam(!showWebcam)}
            className="text-sm text-purple-600 hover:text-purple-500"
          >
            {showWebcam ? "Close Camera" : "Take New Photo"}
          </button>
        </div>

        {showWebcam ? (
          <div className="rounded-xl overflow-hidden">
            <WebcamFilters onPhotoCapture={handlePhotoCapture} />
          </div>
        ) : (
          <PhotoGallery 
            onSelect={(photo: Photo | null) => setSelectedPhoto(photo)}
            selectedPhotoId={selectedPhoto?.id}
          />
        )}

        {selectedPhoto && (
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-purple-900 mb-2">
              Selected Photo
            </h4>
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image
                src={selectedPhoto.url}
                alt={`Photo with ${selectedPhoto.filterId} filter`}
                fill
                className="object-cover"
              />
            </div>
            <p className="text-sm text-purple-700 mt-2">
              Filter: {selectedPhoto.filterId}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !title}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
              Creating...
            </>
          ) : (
            "Create Audit"
          )}
        </button>
      </div>
    </form>
  );
}
