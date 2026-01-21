import { useState, useRef, useEffect } from "react";
import { Upload, Edit2, Trash2, X, Check, ZoomIn, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getImagesAPI,
  updateImageAPI,
  deleteImageAPI,
  updateImageOrderAPI,
} from "../services/imageServices";
import { logoutAPI } from "../services/authServices";
import ConfirmModal from "../components/confirmModal";
import ImageUploadModal from "../components/imageUploader";
import type { ImageType, SelectedFile } from "../types/dashboard";

type ConfirmModalState = {
  show: boolean;
  title: string;
  message: string;
  onConfirm: (() => Promise<void>) | null;
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [images, setImages] = useState<ImageType[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [zoomedImage, setZoomedImage] = useState<ImageType | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = (await getImagesAPI()) as { data: { images: ImageType[] } };
      const fetchedImages = res?.data?.images ?? [];
      setImages(fetchedImages);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const uploads: SelectedFile[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      title: file.name.replace(/\.[^/.]+$/, ""),
    }));

    setSelectedFiles(uploads);
    setShowUploadModal(true);
    e.target.value = "";
  };

  const startEdit = (image: ImageType) => {
    setEditingId(image._id);
    setEditTitle(image.title);
    setEditFile(null);
  };

  const saveEdit = async (): Promise<void> => {
    if (!editingId) return;
    const imageToUpdate = images.find((img) => img._id === editingId);
    if (!imageToUpdate) return;

    setActionLoading("save");

    try {
      const formData = new FormData();
      formData.append("title", editTitle);
      if (editFile) formData.append("image", editFile);

      const res = (await updateImageAPI(editingId, formData)) as
        | { data: ImageType }
        | ImageType;
      const updated: ImageType =
        res && typeof res === "object" && "data" in res
          ? (res as { data: ImageType }).data
          : (res as ImageType);

      setImages((prev) =>
        prev.map((img) => (img._id === editingId ? updated : img))
      );
      toast.success("Image updated");
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setEditingId(null);
      setEditTitle("");
      setEditFile(null);
      setActionLoading(null);
    }
  };

  const cancelEdit = (): void => {
    setEditingId(null);
    setEditTitle("");
    setEditFile(null);
  };

  const deleteImage = async (id: string, public_id: string): Promise<void> => {
    setActionLoading(id);
    try {
      await deleteImageAPI(id, public_id);
      setImages((prev) => prev.filter((img) => img._id !== id));
      toast.success("Image deleted");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) setEditFile(file);
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);
    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = async (): Promise<void> => {
    setDraggedIndex(null);
    setActionLoading("reorder");
    try {
      const orderedIds = images.map((img) => img._id);
      await updateImageOrderAPI(orderedIds);
      toast.success("Order saved successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save order");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async (): Promise<void> => {
    setActionLoading("logout");
    try {
      localStorage.removeItem("accessToken");
      await logoutAPI();
      toast.success("Logged out successfully");
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error("Logout failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-light text-stone-800 mb-1 tracking-tight">
                ImageBox 🗃
              </h1>
              <p className="text-stone-500 font-light">
                {images.length} {images.length === 1 ? "image" : "images"} 📸
              </p>
            </div>

            <button
              disabled={actionLoading === "logout"}
              onClick={() =>
                setConfirmModal({
                  show: true,
                  title: "Logout?",
                  message: "Are you sure you want to log out?",
                  onConfirm: async () => {
                    await handleLogout();
                    setConfirmModal({
                      show: false,
                      title: "",
                      message: "",
                      onConfirm: null,
                    });
                  },
                })
              }
              className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 flex items-center gap-2"
            >
              {actionLoading === "logout" && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Logout
            </button>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="group relative border-2 border-dashed border-stone-300 rounded-2xl p-12 bg-white/50 hover:bg-white hover:border-amber-400 transition-all duration-300 cursor-pointer"
          >
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="p-4 bg-linear-to-br from-amber-100 to-orange-100 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <Upload size={32} className="text-amber-600" />
                </div>
              </div>
              <h3 className="text-lg font-light text-stone-700 mb-2">
                Click to select images 🖼️
              </h3>
              <p className="text-sm text-stone-500 font-light">
                Add titles before uploading • PNG, JPG, WEBP
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-stone-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
            Loading images...
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div
                key={image._id}
                draggable={editingId !== image._id}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${draggedIndex === index ? "opacity-50 scale-95" : ""
                  }`}
              >
                <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                  <img
                    src={
                      editingId === image._id && editFile
                        ? URL.createObjectURL(editFile)
                        : (image.url as string)
                    }
                    alt={(image.title as string) ?? "image"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {editingId !== image._id && (
                    <>
                      <button
                        onClick={() => setZoomedImage(image)}
                        className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        <div className="p-3 bg-white/90 rounded-full transform scale-75 group-hover:scale-100 transition-transform">
                          <ZoomIn size={20} className="text-stone-700" />
                        </div>
                      </button>

                      <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => startEdit(image)}
                          className="p-2 bg-white/95 rounded-lg shadow hover:bg-amber-50"
                        >
                          <Edit2 size={14} className="text-stone-600" />
                        </button>

                        <button
                          disabled={actionLoading === image._id}
                          onClick={() =>
                            setConfirmModal({
                              show: true,
                              title: "Delete Image?",
                              message: "This action cannot be undone.",
                              onConfirm: async () => {
                                await deleteImage(
                                  image._id,
                                  String(image.public_id)
                                );
                                setConfirmModal({
                                  show: false,
                                  title: "",
                                  message: "",
                                  onConfirm: null,
                                });
                              },
                            })
                          }
                          className="p-2 bg-white/95 rounded-lg shadow hover:bg-rose-50 flex items-center justify-center"
                        >
                          {actionLoading === image._id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                          ) : (
                            <Trash2 size={14} className="text-stone-600" />
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="p-3">
                  {editingId === image._id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-amber-400 text-stone-700"
                      />
                      <button
                        onClick={() => editFileInputRef.current?.click()}
                        className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg hover:border-amber-400 transition-colors text-stone-600"
                      >
                        {editFile ? "Image selected ✓" : "Change image"}
                      </button>

                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleEditFileSelect}
                        className="hidden"
                      />

                      <div className="flex gap-1.5">
                        <button
                          disabled={actionLoading === "save"}
                          onClick={() =>
                            setConfirmModal({
                              show: true,
                              title: "Save Changes?",
                              message:
                                "Do you want to save the updated image details?",
                              onConfirm: async () => {
                                await saveEdit();
                                setConfirmModal({
                                  show: false,
                                  title: "",
                                  message: "",
                                  onConfirm: null,
                                });
                              },
                            })
                          }
                          className="flex-1 px-3 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center justify-center gap-1.5"
                        >
                          {actionLoading === "save" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check size={14} />
                              <span>Save</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={cancelEdit}
                          className="flex-1 px-3 py-1.5 text-sm bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <h3 className="text-stone-700 font-light text-sm truncate">
                      {(image.title as string) ?? "Untitled"}
                    </h3>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length === 0 && !loading && (
          <div className="text-center py-24 text-stone-400">
            <Upload size={48} className="mx-auto mb-4 text-stone-300" />
            No images yet. Start by uploading your first photo.
          </div>
        )}
      </div>

      <ImageUploadModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedFiles([]);
        }}
        onUploadSuccess={fetchImages}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
      />

      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow hover:bg-rose-50"
            >
              <X size={20} className="text-stone-700" />
            </button>

            <img
              src={zoomedImage.url as string}
              alt={(zoomedImage.title as string) ?? "zoomed"}
              className="max-w-full max-h-[80vh] object-contain"
            />

            <div className="p-6 bg-linear-to-t from-white to-transparent">
              <h2 className="text-2xl font-light text-stone-800">
                {(zoomedImage.title as string) ?? ""}
              </h2>
            </div>
          </div>
        </div>
      )}

      {confirmModal.show && confirmModal.onConfirm && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() =>
            setConfirmModal({
              show: false,
              title: "",
              message: "",
              onConfirm: null,
            })
          }
        />
      )}
    </div>
  );
};

export default Dashboard;
