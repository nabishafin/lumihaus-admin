import { useState, useRef } from "react";
import { UploadCloud, X, Image as ImageIcon, Plus, Link as LinkIcon, Check } from "lucide-react";

export default function ImageUploadZone({ images = [], onChange }) {
  const [activeTab, setActiveTab] = useState("upload"); // 'upload' | 'url'
  const [urlInput, setUrlInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Handle files selected via input or drop
  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length === 0) return;

    const newImages = [...images];
    let loadedCount = 0;

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newImages.push(e.target.result);
        loadedCount++;
        if (loadedCount === validFiles.length) {
          onChange?.(newImages);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleAddUrl = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onChange?.([...images, urlInput.trim()]);
    setUrlInput("");
  };

  const handleRemoveImage = (index) => {
    const updated = images.filter((_, i) => i !== index);
    onChange?.(updated);
  };

  const handleSetPrimary = (index) => {
    if (index === 0) return;
    const selected = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange?.([selected, ...rest]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#60685f]">
          Product Gallery & Images ({images.length})
        </label>
        <div className="flex items-center gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`px-2.5 py-1 rounded-md font-semibold transition ${
              activeTab === "upload"
                ? "bg-[#283d2e] text-white"
                : "text-[#7a8179] hover:bg-gray-100"
            }`}
          >
            Direct File Upload
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`px-2.5 py-1 rounded-md font-semibold transition ${
              activeTab === "url"
                ? "bg-[#283d2e] text-white"
                : "text-[#7a8179] hover:bg-gray-100"
            }`}
          >
            Image URL
          </button>
        </div>
      </div>

      {activeTab === "upload" ? (
        /* Drag & Drop Zone */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition ${
            isDragging
              ? "border-[#d96b86] bg-[#fff5f8]"
              : "border-[#dfe3dc] bg-[#fafbf9] hover:border-[#d96b86]/60 hover:bg-[#fff9fa]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="h-10 w-10 rounded-full bg-[#fdf2f6] text-[#b55871] flex items-center justify-center mb-2">
            <UploadCloud size={20} />
          </div>
          <p className="text-xs font-bold text-[#2b2427]">
            Click to browse or drag and drop images here
          </p>
          <p className="text-[10px] text-[#8e958d] mt-1">
            Supports PNG, JPG, WEBP, JPEG from your device or phone
          </p>
        </div>
      ) : (
        /* URL Input Form */
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/... or CDN link"
            className="flex-1 text-xs px-3 py-2 border border-[#dfe3dc] rounded-lg outline-none focus:border-[#d96b86]"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-4 py-2 bg-[#283d2e] text-white rounded-lg text-xs font-bold hover:bg-[#17251c] transition"
          >
            Add Image
          </button>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 pt-2">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="group relative aspect-square rounded-lg border border-[#e5e8e2] bg-white overflow-hidden shadow-xs"
            >
              <img
                src={img}
                alt={`Product Preview ${idx + 1}`}
                className="h-full w-full object-cover"
              />

              {/* Primary Badge */}
              {idx === 0 ? (
                <span className="absolute bottom-1 left-1 bg-[#283d2e] text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                  Main
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSetPrimary(idx)}
                  className="absolute bottom-1 left-1 bg-black/60 hover:bg-[#283d2e] text-white text-[8px] font-semibold px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition"
                  title="Make Primary Thumbnail"
                >
                  Set Main
                </button>
              )}

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition"
                title="Remove image"
              >
                <X size={11} />
              </button>
            </div>
          ))}

          {/* Add more button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-lg border border-dashed border-[#ccd3c7] flex flex-col items-center justify-center text-[#8e958d] hover:border-[#d96b86] hover:text-[#b55871] hover:bg-[#fff9fa] transition"
          >
            <Plus size={16} />
            <span className="text-[9px] font-semibold mt-0.5">Add more</span>
          </button>
        </div>
      )}
    </div>
  );
}
