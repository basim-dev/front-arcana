import React, { useEffect, useRef, useState } from "react";
import { X, Upload, PlusCircle } from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";
import InputTag from "../InputTag";

export function LibraryModal({ isOpen, onClose, onCollectionCreated }) {
  const modalRef = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    visibility: "public",
    tags: [],
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = useSelector((state) => state.user.value.userId);

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

  const handleTagsChange = (newTags) => {
    setFormData((prev) => ({
      ...prev,
      tags: newTags,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let coverUrl = "";

      if (imageFile) {
        const formDataImage = new FormData();
        formDataImage.append("file", imageFile);
        formDataImage.append("upload_preset", "arcana_unsigned");
        formDataImage.append("cloud_name", "dkj6slmwt");
        formDataImage.append("folder", "collectionCover");

        const cloudinaryRes = await fetch(
          "https://api.cloudinary.com/v1_1/dkj6slmwt/image/upload",
          {
            method: "POST",
            body: formDataImage,
          }
        );

        const cloudinaryData = await cloudinaryRes.json();
        coverUrl = cloudinaryData.secure_url;
      }

      const response = await axios.post(
        "https://back-arcana.vercel.app/collections",
        {
          title: formData.title,
          description: formData.description,
          userId,
          cover: coverUrl && coverUrl.trim() !== "" ? coverUrl : undefined,
          visibility: formData.visibility,
          tags: formData.tags,
        }
      );

      if (response.data.result) {
        onCollectionCreated(response.data.collection);
        onClose();
      } else {
        console.error("Error creating collection:", response.data.error);
      }
    } catch (error) {
      console.error("Error creating collection:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-arcanaBackgroundDarker backdrop-blur-sm border border-white/10 rounded-xl p-8 text-white shadow-2xl transform transition-all duration-300"
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
            Créer une Collection
          </h2>
          <p className="text-gray-300 text-sm">
            Organisez vos contenus préférés
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-white placeholder-gray-400 focus:border-arcanaBlue focus:outline-none transition-colors duration-200 min-h-24"
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
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-arcanaBlue py-3 font-medium text-arcanaBackgroundDarker hover:bg-arcanaBlue/90 focus:outline-none transition-all duration-300 flex items-center justify-center"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-arcanaBackgroundDarker border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <PlusCircle className="w-5 h-5 mr-2" />
            )}
            Créer ma collection
          </button>
        </form>
      </div>
    </div>
  );
}
