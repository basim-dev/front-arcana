import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FaStar, FaRegStar } from "react-icons/fa";
import { X, Calendar } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

dayjs.extend(relativeTime);
dayjs.locale("fr");

const EditElementModal = ({ collectionId, onClose, element }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const router = useRouter();
  const [formData, setFormData] = useState({
    title: element?.title || "",
    description: element?.description || "",
    review: element?.review || "",
    author: element?.author || "",
    rating: element?.rating || 0,
    cover: element?.cover || "",
    releaseDate: element?.releaseDate
      ? dayjs(element.releaseDate).format("YYYY-MM-DD")
      : "",
    status: element?.status || "",
    type: element?.type || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleStarClick = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      rating: value,
    }));
  };

  const renderStars = () => {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= formData.rating) {
        stars.push(
          <FaStar
            key={i}
            onClick={() => handleStarClick(i)}
            className="cursor-pointer text-yellow-500 text-xl"
          />
        );
      } else {
        stars.push(
          <FaRegStar
            key={i}
            onClick={() => handleStarClick(i)}
            className="cursor-pointer text-gray-400 text-xl"
          />
        );
      }
    }
    return stars;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.type) {
      toast.error(
        "Veuillez sélectionner un type de contenu avant d'ajouter un élément."
      );
      return;
    }

    try {
      const response = await fetch(
        `https://back-arcana.vercel.app/elements/${element._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: formData.description || "",
            review: formData.review || "",
            rating: formData.rating || 0,
            status: formData.status || "",
            collectionId: collectionId,
          }),
        }
      );

      const data = await response.json();

      if (data.result) {
        onClose();
        router.reload();
      } else {
        console.error("Erreur de réponse:", response.status);
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const deleteElement = await fetch(
        `https://back-arcana.vercel.app/elements/${element._id}`,
        { method: "DELETE" }
      );
      onClose();
      router.reload();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-arcanaBackgroundDarker border border-white/10 rounded-xl p-6 text-white shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-arcanaBlue transition-colors duration-200"
          aria-label="Fermer"
        >
          <X size={24} />
        </button>

        <div className="mb-8 text-center">
          <h2 className="mb-2 text-xl font-semibold text-white">
            Modifier un élément
          </h2>
          <p className="text-gray-300 text-sm">
            Personnalisez les détails de votre élément
          </p>
        </div>

        {/* Scrollable form content */}
        <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent flex-grow">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type Selector */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Type de contenu
              </label>
              <div className="grid grid-cols-5 gap-2">
                {["movie", "serie", "book", "music", "game"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    name="type"
                    value={type}
                    readOnly
                    className={`py-2 rounded-lg text-center font-medium transition-all duration-300 ${
                      formData.type === type
                        ? "bg-arcanaBlue text-arcanaBackgroundDarker"
                        : "bg-white/5 border border-white/10 text-gray-300 cursor-not-allowed opacity-50"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Title and Cover */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                {formData.cover && (
                  <div>
                    <img
                      src={formData.cover}
                      alt="Aperçu"
                      className="w-16 h-24 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="flex-grow">
                <label className="mb-2 block text-sm font-medium text-gray-200">
                  Titre
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    readOnly
                    className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-gray-400 focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Two columns layout for smaller fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(formData.type === "book" || formData.type === "music") && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-200">
                    Auteur
                  </label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    readOnly
                    className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-gray-400 focus:outline-none cursor-not-allowed"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-200">
                  Date de sortie
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="releaseDate"
                    name="releaseDate"
                    value={formData.releaseDate}
                    disabled
                    className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-gray-400 focus:outline-none cursor-not-allowed"
                  />
                  <Calendar
                    className="absolute right-3 top-3 text-gray-400"
                    size={20}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-white placeholder-gray-400 focus:border-arcanaBlue focus:outline-none transition-colors duration-200 resize-none"
                placeholder="Décrivez brièvement..."
              ></textarea>
            </div>

            {/* Review */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Votre avis
              </label>
              <textarea
                id="review"
                name="review"
                value={formData.review}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-white placeholder-gray-400 focus:border-arcanaBlue focus:outline-none transition-colors duration-200 resize-none"
                placeholder="Partagez votre opinion..."
              ></textarea>
            </div>

            {/* Rating */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200 text-center">
                Note
              </label>
              <div className="flex justify-center space-x-1 mt-1">
                {renderStars()}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Statut
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "completed", label: "Terminé" },
                  { id: "in-progress", label: "En cours" },
                  { id: "planned", label: "A découvrir" },
                ].map((status) => (
                  <button
                    key={status.id}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, status: status.id }))
                    }
                    className={`py-3 rounded-lg text-center font-medium transition-all duration-300 ${
                      formData.status === status.id
                        ? "bg-arcanaBlue text-arcanaBackgroundDarker"
                        : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
          <div>
            {confirmDelete ? (
              <div className="text-red-400 flex flex-col space-y-2">
                <span>Êtes-vous sûr de vouloir supprimer l'élément ?</span>
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
                Supprimer l'élément
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
              className="w-40 rounded-xl bg-arcanaBlue py-3 font-medium text-arcanaBackgroundDarker hover:bg-arcanaBlue/90 focus:outline-none transition-all duration-300 flex items-center justify-center"
            >
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
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditElementModal;
