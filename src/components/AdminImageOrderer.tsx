import React from "react";
import { motion } from "framer-motion";
import { GripVertical, X, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AdminImageOrdererProps {
  images: string[];
  onChange: (images: string[]) => void;
  videoUrl?: string;
  onVideoChange?: (url: string) => void;
}

const AdminImageOrderer: React.FC<AdminImageOrdererProps> = ({ images, onChange, videoUrl, onVideoChange }) => {
  const [uploading, setUploading] = React.useState(false);
  const [dragIdx, setDragIdx] = React.useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = React.useState<number | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setUploading(true);
    for (const file of files) {
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { data, error } = await supabase.storage.from("product-media").upload(fileName, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from("product-media").getPublicUrl(data.path);
        if (file.type.startsWith("video")) {
          onVideoChange?.(publicUrl);
        } else {
          onChange([...images, publicUrl]);
        }
      } catch (err: any) {
        console.error("upload error", err);
        alert("Upload error: " + err.message);
      }
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // If dragging files from outside
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(Array.from(e.dataTransfer.files));
      return;
    }
    // Internal reorder
    if (dragIdx !== null && dragOverIdx !== null && dragIdx !== dragOverIdx) {
      const reordered = [...images];
      const [moved] = reordered.splice(dragIdx, 1);
      reordered.splice(dragOverIdx, 0, moved);
      onChange(reordered);
    }
    setDragIdx(null);
    setDragOverIdx(null);
  };

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const reordered = [...images];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    onChange(reordered);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-foreground">
        Product Images <span className="text-muted-foreground font-normal">(Image #1 = primary thumbnail)</span>
      </label>

      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-border/60 rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
      >
        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          {uploading ? "Uploading..." : "Drag & drop images/video, or click to select"}
        </p>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          ref={inputRef}
          onChange={(e) => {
            const files = e.target.files ? Array.from(e.target.files) : [];
            uploadFiles(files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Image grid with ordering */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {images.map((url, idx) => (
            <motion.div
              key={`${url}-${idx}`}
              layout
              draggable
              onDragStart={() => setDragIdx(idx)}
              onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
              onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
              className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing ${
                idx === 0 ? "border-primary ring-2 ring-primary/20" : "border-border/40"
              } ${dragOverIdx === idx ? "scale-105 border-primary/60" : ""}`}
            >
              <img src={url} alt={`Image ${idx + 1}`} className="w-full aspect-square object-cover" />

              {/* Number badge */}
              <div className={`absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                idx === 0 ? "bg-primary text-primary-foreground" : "bg-foreground/70 text-background"
              }`}>
                {idx + 1}
              </div>

              {/* Primary label */}
              {idx === 0 && (
                <div className="absolute bottom-0 inset-x-0 bg-primary text-primary-foreground text-[10px] font-bold text-center py-0.5">
                  PRIMARY
                </div>
              )}

              {/* Controls overlay */}
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                  className="w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <GripVertical className="absolute top-1 right-1 w-4 h-4 text-background/80 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Reorder hint */}
      {images.length > 1 && (
        <p className="text-xs text-muted-foreground">💡 Drag images to reorder. Image #1 is the primary thumbnail shown on the website.</p>
      )}

      {/* Video preview */}
      {videoUrl && (
        <div className="mt-2">
          <label className="text-sm font-medium text-foreground">Video Preview</label>
          <video src={videoUrl} controls className="w-full max-w-xs rounded-xl mt-1" />
        </div>
      )}
    </div>
  );
};

export default AdminImageOrderer;
