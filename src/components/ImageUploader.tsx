import React, { useRef, useState } from "react";
import { UploadedImage } from "../types";
import {
  Upload,
  Image as ImageIcon,
  X,
  FileImage,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface ImageUploaderProps {
  image: UploadedImage | null | undefined;
  onImageChange: (image: UploadedImage | null) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  image,
  onImageChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Compress & convert to base64 via Canvas to keep payload lean
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).");
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Max dimension for speed and crisp OCR/reading
        const maxDim = 1600;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedData = canvas.toDataURL("image/jpeg", 0.88);
          onImageChange({
            data: compressedData,
            mimeType: "image/jpeg",
            name: file.name,
            size: Math.round(compressedData.length * 0.75),
          });
        }
        setIsProcessing(false);
      };
      img.onerror = () => {
        setIsProcessing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
    // reset input so same file can be re-selected if removed
    e.target.value = "";
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.items) {
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        const item = e.clipboardData.items[i];
        if (item.type.indexOf("image") !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            processFile(blob);
            break;
          }
        }
      }
    }
  };

  if (image) {
    const sizeKb = Math.round(image.size / 1024);
    return (
      <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/[0.08] flex items-center justify-between gap-3 animate-in fade-in duration-150">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/[0.1] bg-zinc-900 relative shadow-sm">
            <img
              src={image.data}
              alt="Print enviado"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-200 truncate">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{image.name || "Print de conversa"}</span>
            </div>
            <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5 font-normal">
              <span>{sizeKb} KB</span>
              <span>•</span>
              <span className="text-rose-400 font-medium">Pronto para análise</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onImageChange(null)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 border border-transparent hover:border-white/[0.06] transition-colors cursor-pointer shrink-0"
          title="Remover imagem"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPaste={handlePaste}
      tabIndex={0}
      className={`relative border border-dashed rounded-xl p-4 sm:p-5 transition-all outline-none text-center cursor-pointer ${
        isDragging
          ? "border-rose-500 bg-rose-500/[0.06]"
          : "border-white/[0.1] hover:border-white/[0.2] bg-zinc-950/40 hover:bg-zinc-950/70"
      }`}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-zinc-300 shadow-sm">
          {isProcessing ? (
            <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-4 h-4 text-zinc-400" />
          )}
        </div>

        <div>
          <div className="text-xs font-medium text-zinc-200 flex items-center justify-center gap-1.5">
            <span>Clique para enviar print de conversa ou foto</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 max-w-sm font-normal">
            Arraste, selecione do celular/PC ou dê <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-white/[0.08] text-zinc-300 font-mono text-[10px]">Ctrl+V</kbd>
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
          <span className="flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3 text-rose-500" /> WhatsApp, Instagram Direct, Tinder, Bumble
          </span>
        </div>
      </div>
    </div>
  );
};
