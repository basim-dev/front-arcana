import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ElementModal from "./element-modal";
import EditElementModal from "./editElement-modal";
import EditCollectionModal from "./editCollection-modal";
import "dayjs/locale/fr";
import FilterBar from "./FilterBar";
import {
  Film,
  BookOpen,
  Music,
  Gamepad2,
  Tv,
  PenSquare,
  PlusCircle,
  Search,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Tag,
} from "lucide-react";

dayjs.extend(relativeTime);
dayjs.locale("fr");

const Element = ({ collection, collectionId, isProfileOwner }) => {
  const [elements, setElements] = useState([]);
  const [filteredElements, setFilteredElements] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showReviews, setShowReviews] = useState({});

  const [visibleElement, setVisibleElement] = useState(9);

  const userId = useSelector((state) => state.user.value.userId);
  const isAuthenticated = useSelector(
    (state) => state.user.value.token !== null
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);

  const [isThirdModalOpen, setIsThirdModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(collection);

  // States pour les filtres :
  const [filters, setFilters] = useState({
    status: null,
    type: null,
    rating: null,
  });

  // Fonction pour ouvrir la modal (create element)
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Fonction pour fermer la modal (create element)
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Fonction pour ouvrir la deuxième modal (edit element)
  const openSecondModal = (element) => {
    setSelectedElement(element);
    setIsSecondModalOpen(true);
  };

  // Fonction pour fermer la deuxième modal (edit element)
  const closeSecondModal = () => {
    setIsSecondModalOpen(false);
  };

  // Fonction pour ouvrir la troisième modal (edit collection)
  const openThirdModal = (collection) => {
    setSelectedCollection(collection);
    setIsThirdModalOpen(true);
  };

  // Fonction pour fermer la troisième modal (edit collection)
  const closeThirdModal = () => {
    setIsThirdModalOpen(false);
  };

  // Fonction de recherche
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() === "") {
      setFilteredElements(elements);
    } else {
      const filtered = elements.filter(
        (element) =>
          element.title.toLowerCase().includes(e.target.value.toLowerCase()) ||
          element.description
            ?.toLowerCase()
            .includes(e.target.value.toLowerCase()) ||
          element.review?.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setFilteredElements(filtered);
    }
  };

  // Fonction de tri
  const handleFilterChange = (selectedOption, { name }) => {
    setFilters((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : null,
    }));
  };

  const handleViewMore = () => {
    setVisibleElement((prev) => prev + 9);
  };

  const handleViewLess = () => {
    setVisibleElement((prev) => Math.max(prev - 9, 9));
  };

  useEffect(() => {
    let filtered = [...elements];

    // Filtrage par statut
    if (filters.status) {
      filtered = filtered.filter((el) => el.status === filters.status);
    }

    // Filtrage par type
    if (filters.type) {
      filtered = filtered.filter((el) => el.type === filters.type);
    }

    // Filtrage par rating
    if (filters.rating !== null) {
      filtered = filtered.filter((el) => el.rating === filters.rating);
    }

    setFilteredElements(filtered);
  }, [elements, filters]);

  // Icon based on element type
  const getTypeIcon = (type) => {
    switch (type) {
      case "movie":
        return <Film className="w-5 h-5 text-gray-500" />;
      case "book":
        return <BookOpen className="w-5 h-5 text-gray-500" />;
      case "music":
        return <Music className="w-5 h-5 text-gray-500" />;
      case "game":
        return <Gamepad2 className="w-5 h-5 text-gray-500" />;
      case "serie":
        return <Tv className="w-5 h-5 text-gray-500" />;
      default:
        return null;
    }
  };

  // Objet de traduction pour les statuts
  const statusTranslations = {
    completed: "Terminé",
    "in-progress": "En cours",
    planned: "A découvrir",
  };

  // Status badge
  const getStatusBadge = (status) => {
    let bgColor = "bg-gray-600 border-gray-500";
    if (status === "completed")
      bgColor = "bg-green-600/30 border-green-500/50 text-green-400";
    else if (status === "in-progress")
      bgColor = "bg-yellow-600/30 border-yellow-500/50 text-yellow-400";
    else if (status === "planned")
      bgColor = "bg-blue-600/30 border-blue-500/50 text-blue-400";

    // Utilisation de la traduction pour afficher le statut en français
    const translatedStatus = statusTranslations[status] || status;

    return (
      <div
        className={`text-xs px-2 py-1 rounded-full ${bgColor} border font-medium`}
      >
        {translatedStatus}
      </div>
    );
  };

  // Fonction pour basculer l'affichage de la review et description par élément
  const toggleReview = (elementId) => {
    setShowReviews((prev) => ({
      ...prev,
      [elementId]: !prev[elementId],
    }));
  };

  useEffect(() => {
    const fetchElement = async () => {
      setIsLoading(true);
      if (isAuthenticated && userId) {
        try {
          const response = await axios.get(
            `https://back-arcana.vercel.app/elements/collection/${collectionId}`
          );
          if (response.data.result) {
            setElements(response.data.elements);
            setFilteredElements(response.data.elements);
          }
        } catch (error) {
          console.error("Error fetching elements:", error);
        }
      } else {
        setElements([]);
        setFilteredElements([]);
      }
      setIsLoading(false);
    };

    fetchElement();
  }, [isAuthenticated, userId, collectionId]);

  return (
    <div className="flex-1">
      {/* Header with search and controls */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div className="flex items-center mb-6 md:mb-0">
          <LayoutGrid className="w-6 h-6 text-arcanaBlue mr-3" />
          <h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight font-jakarta">
            Éléments de la collection
          </h1>
          <span className="ml-3 bg-white/10 text-white/80 text-sm px-3 py-1 rounded-full">
            {filteredElements.length} éléments
          </span>
        </div>

        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <input
              type="text"
              placeholder="Rechercher..."
              className="bg-arcanaBackgroundDarker border border-white/10 rounded-lg px-4 py-2 pl-10 text-white w-full focus:border-arcanaBlue/50 focus:outline-none focus:ring-1 focus:ring-arcanaBlue/50"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>

          {/* View Toggle */}
          <div className="flex bg-arcanaBackgroundDarker border border-white/10 rounded-lg overflow-hidden">
            <button
              className={`p-2 ${
                viewMode === "grid"
                  ? "bg-arcanaBlue/20 text-arcanaBlue"
                  : "text-gray-400 hover:bg-white/5"
              }`}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              className={`p-2 ${
                viewMode === "list"
                  ? "bg-arcanaBlue/20 text-arcanaBlue"
                  : "text-gray-400 hover:bg-white/5"
              }`}
              onClick={() => setViewMode("list")}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Button */}
          {isProfileOwner && (
            <button
              onClick={() => openThirdModal(collection)}
              className="p-2 bg-arcanaBackgroundDarker border border-white/10 rounded-lg text-gray-400 hover:bg-white/5"
            >
              <PenSquare className="w-5 h-5" />
            </button>
          )}

          {isProfileOwner && (
            <button
              onClick={openModal}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition bg-arcanaBlue text-arcanaBackgroundDarker whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              Ajouter
            </button>
          )}
        </div>
      </div>

      <FilterBar handleFilterChange={handleFilterChange} />

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-t-transparent border-arcanaBlue rounded-full animate-spin mb-4"></div>
            <p className="text-white font-medium">Chargement des éléments...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredElements.length === 0 && (
        <div className="bg-arcanaBackgroundDarker p-6 backdrop-blur-sm rounded-xl border border-white/10 flex flex-col items-center justify-center py-16 px-4">
          <LayoutGrid className="w-16 h-16 text-arcanaBlue mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">
            {searchTerm
              ? "Aucun élément trouvé"
              : elements.length === 0
              ? "Aucun élément dans cette collection"
              : "Aucun élément ne correspond aux filtres sélectionnés"}
          </h2>
          <p className="text-gray-300 mb-8 text-center max-w-md">
            {searchTerm
              ? "Aucun élément ne correspond à votre recherche."
              : elements.length === 0
              ? "Cette collection ne contient pas encore d'éléments."
              : "Essayez de modifier ou réinitialiser vos filtres pour voir plus d'éléments."}
          </p>

          {isProfileOwner && elements.length === 0 && (
            <button
              onClick={openModal}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition bg-arcanaBlue text-arcanaBackgroundDarker"
            >
              <PlusCircle className="w-4 h-4" />
              Ajouter mon premier élément
            </button>
          )}
        </div>
      )}

      {/* Grid View */}
      {!isLoading && filteredElements.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredElements.slice(0, visibleElement).map((element) => (
            <div
              key={element._id}
              className="bg-arcanaBackgroundDarker p-6 backdrop-blur-sm rounded-xl border border-white/10 hover:border-arcanaBlue/50 transition-all duration-300 group"
            >
              <div className="h-48 bg-gradient-to-r from-arcanaBackgroundDarker to-arcanaBackgroundLighter relative overflow-hidden rounded-lg mb-4">
                {element.cover ? (
                  <img
                    src={element.cover}
                    alt={element.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {getTypeIcon(element.type) || (
                      <LayoutGrid className="w-12 h-12 text-white/40" />
                    )}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                {/* Edit button */}
                {isProfileOwner && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openSecondModal(element);
                    }}
                    className="absolute top-2 right-2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-arcanaBlue/70"
                  >
                    <PenSquare className="w-4 h-4 text-white" />
                  </button>
                )}

                {/* Status badge */}
                {element.status && (
                  <div className="absolute bottom-2 left-2">
                    {getStatusBadge(element.status)}
                  </div>
                )}

                {/* Type icon */}
                <div className="absolute bottom-2 right-2 bg-black/60 p-1.5 rounded-full">
                  {getTypeIcon(element.type)}
                </div>
              </div>

              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-bold text-white group-hover:text-arcanaBlue transition-colors duration-300 flex-1">
                  {element.title}
                </h2>
                <div className="text-yellow-400 text-sm flex ml-2">
                  {"★".repeat(element.rating)}
                  {"☆".repeat(5 - element.rating)}
                </div>
              </div>

              {(element.review || element.description) && (
                <div>
                  {!showReviews[element._id] ? (
                    <div className="flex justify-end ">
                      <button
                        onClick={() => toggleReview(element._id)}
                        className="btn-see-more font-bold text-gray-300 text-sm hover:underline"
                      >
                        Voir plus
                      </button>
                    </div>
                  ) : (
                    <>
                      {element.description && (
                        <div className="text-gray-300 text-sm mb-3 mt-4">
                          <h6 className="text-arcanaBlue text-sm font-bold">
                            Description
                          </h6>
                          <p>{element.description || ""}</p>
                        </div>
                      )}
                      {element.review && (
                        <div className="text-gray-300 text-sm mb-3 mt-4">
                          <h6 className="text-arcanaBlue text-sm font-bold mt-4">
                            Ma critique
                          </h6>
                          <p>{element.review}</p>
                          <div className="flex justify-end">
                            <button
                              onClick={() => toggleReview(element._id)}
                              className="btn-see-less font-bold text-sm mt-4 hover:underline"
                            >
                              Voir moins
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="mt-2 pt-3 border-t border-white/10 flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  {dayjs(element.createdAt).format("DD MMM YYYY")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {!isLoading && filteredElements.length > 0 && viewMode === "list" && (
        <div className="bg-arcanaBackgroundDarker backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          {filteredElements.slice(0, visibleElement).map((element, index) => (
            <div
              key={element._id}
              className={`flex items-center justify-between py-4 px-6 hover:bg-white/5 transition-colors duration-200 group relative \\${
                index !== filteredElements.length - 1
                  ? "border-b border-white/10"
                  : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-[60px] h-[90px] relative rounded-md overflow-hidden">
                  <img
                    src={element.cover}
                    alt={element.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 right-0 bg-black/60 p-1 rounded-tl-md">
                    {getTypeIcon(element.type)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-md font-semibold text-white group-hover:text-arcanaBlue transition-colors">
                      {element.title}
                    </h3>
                    {isProfileOwner && (
                      <button
                        onClick={() => openSecondModal(element)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <PenSquare className="w-4 h-4 text-white hover:text-arcanaBlue" />
                      </button>
                    )}
                  </div>
                  <div className="flex text-yellow-400 text-sm">
                    {"★".repeat(element.rating)}
                    {"☆".repeat(5 - element.rating)}
                  </div>
                  {(element.review || element.description) && (
                    <div>
                      {!showReviews[element._id] ? (
                        <button
                          onClick={() => toggleReview(element._id)}
                          className="btn-see-more font-bold text-white text-xs mt-4 hover:underline text-gray-300"
                        >
                          Voir plus
                        </button>
                      ) : (
                        <>
                          {element.description && (
                            <div className="text-gray-300 text-sm mb-3 mt-4">
                              <h6 className="text-arcanaBlue text-sm font-bold">
                                Description
                              </h6>
                              <p>{element.description || ""}</p>
                            </div>
                          )}
                          {element.review && (
                            <div className="text-gray-300 text-sm mb-3 mt-4">
                              <h6 className="text-arcanaBlue text-sm font-bold mt-4">
                                Ma critique
                              </h6>
                              <p>{element.review}</p>
                              <button
                                onClick={() => toggleReview(element._id)}
                                className="btn-see-less font-bold mt-4 text-xs mt-4 hover:underline"
                              >
                                Voir moins
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6">
                {element.status && getStatusBadge(element.status)}

                <span className="text-gray-500 text-xs">
                  {dayjs(element.createdAt).format("DD MMM YYYY")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {visibleElement < elements.length && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleViewMore}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition bg-arcanaBlue text-arcanaBackgroundDarker"
          >
            Voir plus
          </button>
        </div>
      )}

      {visibleElement > 9 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleViewLess}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition bg-arcanaBlue text-arcanaBackgroundDarker"
          >
            Voir moins
          </button>
        </div>
      )}

      {/* Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-arcanaBackgroundDarker rounded-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-white/10">
            <ElementModal
              isOpen={isModalOpen}
              onClose={closeModal}
              closable={true}
              collectionId={collectionId}
              userId={userId}
            />
          </div>
        </div>
      )}

      {isSecondModalOpen && selectedElement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-arcanaBackgroundDarker rounded-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-white/10">
            <EditElementModal
              isOpen={isSecondModalOpen}
              onClose={closeSecondModal}
              closable={true}
              collectionId={collectionId}
              userId={userId}
              element={selectedElement}
            />
          </div>
        </div>
      )}

      {isThirdModalOpen && selectedCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-arcanaBackgroundDarker rounded-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-white/10">
            <EditCollectionModal
              isOpen={isThirdModalOpen}
              onClose={closeThirdModal}
              userId={userId}
              selectedCollection={selectedCollection}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Element;
