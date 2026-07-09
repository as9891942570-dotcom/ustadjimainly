"use client";

import { useRef, useState } from "react";
import axios from "axios";
import { Image as ImageIcon, RefreshCw, Trash2, Upload, AlertCircle } from "lucide-react";

interface CloudinaryUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onError?: (error: string) => void;
}

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

export default function CloudinaryUpload({
  label,
  value,
  onChange,
  onError,
}: CloudinaryUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (file: File) => {
    setErrorMsg("");
    if (onError) onError("");

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      const msg = "Invalid file type. Only JPG, JPEG, PNG, and WEBP are supported.";
      setErrorMsg(msg);
      if (onError) onError(msg);
      return;
    }

    // Validate size
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      const msg = `File is too large. Maximum size is ${MAX_SIZE_MB}MB.`;
      setErrorMsg(msg);
      if (onError) onError(msg);
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      const msg = "Cloudinary environment variables are missing.";
      setErrorMsg(msg);
      if (onError) onError(msg);
      console.error(msg, { cloudName, uploadPreset });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percent = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            setUploadProgress(percent);
          },
        }
      );

      const secureUrl = response.data?.secure_url;
      if (secureUrl) {
        onChange(secureUrl);
      } else {
        throw new Error("Invalid response format from Cloudinary");
      }
    } catch (err: unknown) {
      console.error("Cloudinary upload error:", err);
      let errMsg = "Upload failed. Please check your internet connection.";
      if (axios.isAxiosError(err)) {
        errMsg = err.response?.data?.error?.message || err.message || errMsg;
      }
      setErrorMsg(errMsg);
      if (onError) onError(errMsg);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleUpload(file);
    }
  };

  const handleRemove = () => {
    onChange("");
    setErrorMsg("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
      />

      <div className="relative overflow-hidden rounded-xl border border-dashed border-gray-300 bg-white/50 p-4 transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-50/10">
        {value ? (
          <div className="flex flex-col items-center gap-3">
            {/* Image Preview */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={label}
              className="h-28 w-28 rounded-xl object-cover shadow-sm border border-gray-100"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={triggerSelect}
                className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          </div>
        ) : isUploading ? (
          <div className="flex flex-col items-center justify-center py-6">
            <RefreshCw className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
            <span className="text-sm font-medium text-gray-700">
              Uploading... {uploadProgress}%
            </span>
            <div className="mt-3 h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={triggerSelect}
            className="flex w-full flex-col items-center justify-center py-6 text-center focus:outline-none"
          >
            <div className="mb-3 rounded-full bg-emerald-50 p-2.5 text-emerald-600">
              <Upload className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Click to upload</span>
            <span className="mt-1 text-xs text-gray-400">
              JPG, PNG, WEBP up to {MAX_SIZE_MB}MB
            </span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
