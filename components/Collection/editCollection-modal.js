import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/router";
import InputTag from "../InputTag";

export function EditCollectionModal({ isOpen, onClose, selectedCollection }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const modalRef = useRef(null);
  const [formData, setFormData] = useState({
    title: selectedCollection?.title || "",
    description: selectedCollection?.description || "",
    visibility: selectedCollection?.visibility || "public",
    cover: selectedCollection?.cover || "/assets/default-cover.png",
    tags: selectedCollection?.tags || [],
  });

  const router = useRouter();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let coverUrl = formData.cover;

      // Si un nouveau fichier est uploadé, on écrase
      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        fd.append("upload_preset", "arcana_unsigned");
        fd.append("cloud_name", "dkj6slmwt");
        fd.append("folder", "collectionCover");

        const cloudinaryRes = await fetch(
          "https://api.cloudinary.com/v1_1/dkj6slmwt/image/upload",
          { method: "POST", body: fd }
        );
        const { secure_url } = await cloudinaryRes.json();
        coverUrl = secure_url;
      }

      const response = await axios.put(
        `https://back-arcana.vercel.app/collections/${selectedCollection._id}`,
        {
          title: formData.title,
          description: formData.description,
          visibility: formData.visibility,
          cover: coverUrl,
          tags: formData.tags,
        }
      );

      if (response.data.result) {
        onClose();
        router.reload();
      } else {
        console.error("Error creating collection:", response.data.error);
      }
    } catch (error) {
      console.error("Error creating collection:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const deleteElement = await fetch(
        `https://back-arcana.vercel.app/collections/${selectedCollection._id}`,
        { method: "DELETE" }
      );
      onClose();
      router.push("/library");
    } catch (error) {
      console.error(error);
    }
  };

  const handleTagsChange = (newTags) => {
    setFormData((prev) => ({
      ...prev,
      tags: newTags,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-arcanaBackgroundDarker border border-white/10 rounded-xl p-6 text-white shadow-2xl max-h-[90vh] flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-arcanaBlue transition-colors duration-200"
          aria-label="Fermer"
        >
          <X size={24} />
        </button>

        <div className="mb-8 text-center">
          <h2 className="mb-2 text-xl font-semibold text-white">
            Modifier une collection
          </h2>
          <p className="text-gray-300 text-sm">
            Organisez vos contenus préférés
          </p>
        </div>

        <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent flex-grow">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-gray-200"
              >
                Nom de la collection
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-white placeholder-gray-400 focus:border-arcanaBlue focus:outline-none transition-colors duration-200"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-200"
              >
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-white placeholder-gray-400 focus:border-arcanaBlue focus:outline-none transition-colors duration-200 resize-none"
                rows={3}
              />
            </div>

            <div>
              <label
                htmlFor="visibility"
                className="mb-2 block text-sm font-medium text-gray-200"
              >
                Visibilité
              </label>
              <select
                id="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-white focus:border-arcanaBlue focus:outline-none transition-colors duration-200"
                required
              >
                <option value="public">Public</option>
                <option value="private">Privé</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="image"
                className="mb-2 block text-sm font-medium text-gray-200"
              >
                Image de couverture
              </label>
              <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-white/10 border-dashed rounded-lg hover:border-arcanaBlue/50 transition-colors duration-200">
                <div className="space-y-2 text-center">
                  {!imagePreview ? (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-400">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-medium text-arcanaBlue hover:text-arcanaBlue/80"
                        >
                          <span>Télécharger une image</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">ou glisser-déposer</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF jusqu'à 10MB
                      </p>
                    </>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Aperçu de la couverture"
                        className="h-40 w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                        }}
                        className="absolute top-2 right-2 bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors duration-200"
                      >
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Tags
              </label>
              <InputTag
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="science-fiction, action, drame..."
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
          <div>
            {confirmDelete ? (
              <div className="text-red-400 flex flex-col space-y-2">
                <span>Êtes-vous sûr de vouloir supprimer la collection ?</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleDelete();
                      setConfirmDelete(false);
                    }}
                    className="px-4 py-1 rounded-lg border border-white/20 bg-red-500/20 text-white hover:bg-red-500/40 transition-colors duration-300"
                  >
                    Oui
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-4 py-1 rounded-lg border border-white/20 bg-white/5 text-gray-300 hover:bg-white/10 transition-colors duration-300"
                  >
                    Non
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="py-3 px-5 rounded-lg border border-white/20 bg-red-500/20 text-white hover:bg-red-500/40 transition-colors duration-300"
              >
                Supprimer la collection
              </button>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-5 rounded-lg border border-white/20 bg-white/5 text-gray-300 hover:bg-white/10 transition-colors duration-300"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-40 rounded-xl bg-arcanaBlue py-3 font-medium text-arcanaBackgroundDarker hover:bg-arcanaBlue/90 focus:outline-none transition-all duration-300 flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-arcanaBackgroundDarker border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <svg
                  className="w-5 h-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
              )}
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditCollectionModal;
