"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  value: string | null | undefined;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  apiBase?: string; // URL основного сайта с API загрузки
}

/**
 * Компонент загрузки изображений.
 * Загружает файл на /api/atlas/media основного сайта и возвращает URL.
 */
export function ImageUploader({
  value,
  onChange,
  label = "Изображение",
  className,
  apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (file.size > 10 * 1024 * 1024) {
      setError("Файл больше 10 МБ");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const resp = await fetch(`${apiBase}/api/atlas/media`, {
        method: "POST",
        body: formData,
      });
      const data = await resp.json();
      if (data.url) {
        onChange(data.url);
      } else {
        setError(data.error || "Ошибка загрузки");
      }
    } catch (e) {
      setError("Не удалось загрузить файл");
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">{label}</label>
      )}

      {value ? (
        <div className="relative group">
          <img
            src={value.startsWith("http") ? value : `${apiBase}${value}`}
            alt="Preview"
            className="h-32 w-full rounded-xl border border-slate-200 object-cover"
          />
          <button
            onClick={() => onChange("")}
            className="absolute top-2 right-2 rounded-lg bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-blue-500 hover:bg-blue-50"
        >
          {uploading ? (
            <Loader2 className="size-6 animate-spin text-slate-400" />
          ) : (
            <>
              <Upload className="size-6 text-slate-400" />
              <span className="mt-2 text-xs text-slate-500">
                Перетащите файл или нажмите
              </span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {value && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="или вставьте URL"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs outline-none focus:border-blue-500"
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium hover:bg-slate-200"
            type="button"
          >
            <ImageIcon className="inline size-3.5" /> Заменить
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
