import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { FaStar, FaRegStar } from "react-icons/fa";
import { X, Search, Calendar, BookOpen } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

dayjs.extend(relativeTime);
dayjs.locale("fr");

const ElementModal = ({ collectionId, onClose }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    review: "",
    author: [],
    rating: 0,
    cover: "",
    releaseDate: "",
    status: "",
    type: "",
  });

  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isUserTyping && formData.title.trim().length >= 3 && formData.type) {
        setIsLoading(true);
        axios
          .get(
            `https://back-arcana.vercel.app/autocomplete/${formData.type}?query=${formData.title}`
          )
          .then((response) => {
            setSearchResults(response.data);
          })
          .catch((error) => {
            console.error("Erreur lors de la recherche :", error);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.title, formData.type, isUserTyping]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "title") {
      setIsUserTyping(true); // L'utilisateur tape, donc on autorise l'appel API
    }
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
      const response = await fetch(`https://back-arcana.vercel.app/elements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title || "",
          description: formData.description || "",
          review: formData.review || "",
          author: formData.author || "",
          rating: formData.rating || 0,
          cover: formData.cover || "/assets/default-cover.png",
          releaseDate: formData.releaseDate || "",
          status: formData.status || "",
          type: formData.type || "",
          collectionId: collectionId,
        }),
      });

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

  const handleSelectSuggestion = (selectedItem) => {
    setFormData((prevData) => ({
      ...prevData,
      title: selectedItem.title || selectedItem.name || "",
      releaseDate: selectedItem.releaseDate
        ? dayjs(selectedItem.releaseDate).format("YYYY-MM-DD")
        : "",
      cover:
        selectedItem.cover ||
        selectedItem.poster_path ||
        selectedItem.image ||
        "",
      author: selectedItem.author || "",
    }));
    setSearchResults([]);
    setIsUserTyping(false); // L'utilisateur a sélectionné une suggestion, on ne relance pas l'API.
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
            Ajouter un élément à votre collection
          </h2>
          <p className="text-gray-300 text-sm">
            Enrichissez votre bibliothèque personnalisée
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
                    onClick={() => setFormData((prev) => ({ ...prev, type }))}
                    className={`py-2 rounded-lg text-center font-medium transition-all duration-300 ${
                      formData.type === type
                        ? "bg-arcanaBlue text-arcanaBackgroundDarker"
                        : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Title with Search */}
            <div className="relative">
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Titre
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-white placeholder-gray-400 focus:border-arcanaBlue focus:outline-none transition-colors duration-200"
                  placeholder={
                    formData.type
                      ? "Entrez un titre..."
                      : "Veuillez sélectionner un type de contenu"
                  }
                  disabled={!formData.type}
                />
                <Search
                  className="absolute right-3 top-3 text-gray-400"
                  size={20}
                />
              </div>

              {isLoading && (
                <div className="mt-2 px-3 py-2 text-gray-400 text-sm flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-arcanaBlue border-t-transparent rounded-full mr-2"></div>
                  Recherche en cours...
                </div>
              )}

              {searchResults.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-arcanaBackgroundDarker border border-white/10 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {searchResults.slice(0, 5).map((result, index) => (
                    <li
                      key={index}
                      className="px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors duration-200 flex items-center"
                      onClick={() => handleSelectSuggestion(result)}
                    >
                      {result.cover || result.poster_path || result.image ? (
                        <img
                          src={
                            result.cover || result.poster_path || result.image
                          }
                          alt=""
                          className="w-8 h-12 object-cover rounded mr-3"
                        />
                      ) : (
                        <div className="w-8 h-12 bg-white/5 rounded mr-3 flex items-center justify-center">
                          <BookOpen size={16} className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-white">
                          {result.title || result.name}{" "}
                          <span className="text-xs">
                            ({dayjs(result.releaseDate).format("YYYY")})
                          </span>
                        </p>
                        {result.author && (
                          <p className="text-sm text-gray-400">
                            {result.author}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
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
                    onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-white placeholder-gray-400 focus:border-arcanaBlue focus:outline-none transition-colors duration-200"
                    placeholder="Auteur"
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
                    onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-white placeholder-gray-400 focus:border-arcanaBlue focus:outline-none transition-colors duration-200"
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

            {/* Rating and Cover in two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-200">
                  Note
                </label>
                <div className="flex items-center space-x-1 mt-1">
                  {renderStars()}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-200">
                  Image de couverture
                </label>
                <input
                  type="url"
                  id="cover"
                  name="cover"
                  value={formData.cover}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-white placeholder-gray-400 focus:border-arcanaBlue focus:outline-none transition-colors duration-200"
                  placeholder="URL de l'image"
                />
                {formData.cover && (
                  <div className="mt-2">
                    <img
                      src={formData.cover}
                      alt="Aperçu"
                      className="h-16 rounded object-cover shadow-md"
                    />
                  </div>
                )}
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
        <div className="mt-8 pt-6 border-t border-white/10 text-center flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-5 rounded-lg border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors duration-300"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="w-32 rounded-xl bg-arcanaBlue py-3 font-medium text-arcanaBackgroundDarker hover:bg-arcanaBlue/90 focus:outline-none transition-all duration-300 flex items-center justify-center"
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
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
};

export default ElementModal;
