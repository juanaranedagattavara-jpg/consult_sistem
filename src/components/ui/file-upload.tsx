"use client";

import { useState, useCallback, useId } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onUpload: (storageId: string) => void;
  accept?: string;
  maxSize?: number;
  currentImage?: string | null;
  className?: string;
}

export function FileUpload({
  onUpload,
  accept = "image/*",
  maxSize = 2 * 1024 * 1024, // 2MB
  currentImage,
  className,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Unique ID for multiple instances
  const inputId = useId();

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleFile = useCallback(async (file: File) => {
    setError(null);

    // Validate file type based on accept prop
    if (accept === "image/*" && !file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes");
      return;
    }

    if (file.size > maxSize) {
      setError(`Archivo muy grande. Máximo ${maxSize / 1024 / 1024}MB`);
      return;
    }

    // Show preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Upload
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await result.json();
      onUpload(storageId);
    } catch {
      setError("Error al subir archivo");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }, [generateUploadUrl, maxSize, onUpload, accept]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const clearPreview = () => {
    setPreview(null);
    setError(null);
  };

  return (
    <div className={cn("w-full", className)}>
      {preview ? (
        <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
          {!uploading && (
            <button
              type="button"
              onClick={clearPreview}
              className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={cn(
            "w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors",
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
          )}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
            id={inputId}
          />
          <label htmlFor={inputId} className="cursor-pointer text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Arrastra una imagen o haz clic
            </p>
          </label>
        </div>
      )}
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  );
}
