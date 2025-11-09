import React, { useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { uploadImageAPI } from "../services/imageServices";

interface SelectedFile {
  file: File;
  preview: string;
  title: string;
}

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
  selectedFiles: SelectedFile[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<SelectedFile[]>>;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  selectedFiles,
  setSelectedFiles,
}) => {
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!selectedFiles.length) {
      toast.error("Please select at least one image");
      return;
    }

    setUploading(true);
    const formData = new FormData();

    selectedFiles.forEach((item) => {
      formData.append("image", item.file);
      formData.append("titles", item.title);
    });

    try {
      await uploadImageAPI(formData);
      toast.success("Images uploaded successfully!");
      setSelectedFiles([]);
      onClose();
      onUploadSuccess?.();
    } catch (error) {
      console.log(error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[90%] max-w-4xl h-[85vh] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-2xl font-semibold">Upload Images</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Image preview + title edit */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 mt-3">
          {selectedFiles.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {selectedFiles.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center border rounded-lg p-2 shadow-sm hover:shadow-md transition"
                >
                  <img
                    src={item.preview}
                    alt="preview"
                    className="w-full h-36 object-cover rounded mb-2"
                  />
                  <input
                    type="text"
                    placeholder="Enter title..."
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...selectedFiles];
                      updated[idx].title = e.target.value;
                      setSelectedFiles(updated);
                    }}
                    className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-10">
              No images selected.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
            Upload All
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
