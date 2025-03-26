import WebcamFilters from "@/components/WebcamFilters";

export default function PhotosPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Take Photos</h1>
      <WebcamFilters />
    </div>
  );
}
