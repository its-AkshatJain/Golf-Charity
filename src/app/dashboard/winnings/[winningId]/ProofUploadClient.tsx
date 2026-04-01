"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Props = {
  winningId: string;
};

export default function ProofUploadClient({ winningId }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // Validate: image only, max 5MB
    if (!f.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, WEBP).");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB.");
      return;
    }

    setError(null);
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("Please select a screenshot first."); return; }

    setUploading(true);
    setError(null);

    try {
      // 1. Upload to Cloudinary via our API route
      const formData = new FormData();
      formData.append("file", file);
      formData.append("winningId", winningId);

      const res = await fetch("/api/upload-proof", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Upload failed.");
      }

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="brand-card p-10 text-center space-y-3">
        <div className="text-5xl">✓</div>
        <h2 className="text-xl font-black text-green-600">Proof Submitted!</h2>
        <p className="text-gray-500 text-sm">
          An admin will review your scorecard and verify your prize. Redirecting…
        </p>
      </div>
    );
  }

  return (
    <div className="brand-card p-6 space-y-5">
      <h2 className="font-black text-[#111] text-base uppercase tracking-tight">
        Upload Scorecard Screenshot
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
            preview
              ? "border-[#e63946] bg-red-50"
              : "border-gray-200 hover:border-gray-300 bg-gray-50"
          }`}
        >
          {preview ? (
            <div className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Score proof preview"
                className="max-h-48 mx-auto rounded-xl object-contain shadow-md"
              />
              <p className="text-xs text-gray-500 font-medium">{file?.name}</p>
              <p className="text-[10px] text-[#e63946] font-bold uppercase tracking-widest">
                Click to change
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-4xl text-gray-300">📷</div>
              <p className="font-bold text-[#111] text-sm">
                Click to upload screenshot
              </p>
              <p className="text-xs text-gray-400">
                PNG, JPG or WEBP · Max 5MB
              </p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-medium">
            {error}
          </div>
        )}

        <div className="space-y-2 text-xs text-gray-400 bg-gray-50 rounded-xl p-4">
          <p className="font-bold text-gray-500 text-xs uppercase tracking-widest">Requirements</p>
          <ul className="space-y-1">
            <li>• Must show your Stableford score clearly</li>
            <li>• Must show the date of the round</li>
            <li>• Screenshot from the golf platform or score app</li>
            <li>• Legible and unedited</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={uploading || !file}
          className="w-full bg-[#e63946] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#111] transition-all disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Submit Proof"}
        </button>
      </form>
    </div>
  );
}
