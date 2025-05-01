import React, { useState } from "react";
import {
  Film,
  BookOpen,
  Music,
  Gamepad2,
  Tv,
  CheckCircle,
  Clock,
  Calendar,
  X,
  Star,
  SlidersHorizontal,
  PlusCircle,
} from "lucide-react";

const CollectionFilter = ({
  isProfileOwner,
  elements,
  openModal,
  openThirdModal,
  selectedCollection,
}) => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState(null);
  const [activeTypeFilter, setActiveTypeFilter] = useState(null);
  const [activeRatingFilter, setActiveRatingFilter] = useState(null);

  const toggleFilterPanel = () => {
    setIsFilterPanelOpen(!isFilterPanelOpen);
  };

  const applyStatusFilter = (status) => {
    if (activeStatusFilter === status) {
      setActiveStatusFilter(null);
    } else {
      setActiveStatusFilter(status);
    }
  };

  const applyTypeFilter = (type) => {
    if (activeTypeFilter === type) {
      setActiveTypeFilter(null);
    } else {
      setActiveTypeFilter(type);
    }
  };

  const applyRatingFilter = (rating) => {
    if (activeRatingFilter === rating) {
      setActiveRatingFilter(null);
    } else {
      setActiveRatingFilter(rating);
    }
  };

  const clearAllFilters = () => {
    setActiveStatusFilter(null);
    setActiveTypeFilter(null);
    setActiveRatingFilter(null);
  };

  const typeFilters = [
    { id: "movie", label: "Films", icon: <Film size={18} /> },
    { id: "serie", label: "Séries", icon: <Tv size={18} /> },
    { id: "book", label: "Livres", icon: <BookOpen size={18} /> },
    { id: "music", label: "Musique", icon: <Music size={18} /> },
    { id: "game", label: "Jeux", icon: <Gamepad2 size={18} /> },
  ];

  const statusFilters = [
    { id: "completed", label: "Terminé", icon: <CheckCircle size={18} /> },
    { id: "in-progress", label: "En cours", icon: <Clock size={18} /> },
    { id: "planned", label: "Planifié", icon: <Calendar size={18} /> },
  ];

  return (
    <>
      {/* Filter Drawer - Floating panel that slides in from right */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-arcanaBackgroundDarker backdrop-blur-lg border-l border-white/10 p-6 transform transition-transform duration-300 ease-in-out z-30 ${
          isFilterPanelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Filtres</h3>
          <button
            onClick={toggleFilterPanel}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Active Filters */}
        {(activeStatusFilter || activeTypeFilter || activeRatingFilter) && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">Filtres actifs</span>
              <button
                onClick={clearAllFilters}
                className="text-arcanaBlue text-xs hover:underline"
              >
                Tout effacer
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeStatusFilter && (
                <div className="bg-arcanaBlue/20 border border-arcanaBlue/50 text-arcanaBlue rounded-full px-3 py-1 text-xs flex items-center">
                  {
                    statusFilters.find((s) => s.id === activeStatusFilter)
                      ?.label
                  }
                  <button
                    onClick={() => setActiveStatusFilter(null)}
                    className="ml-2"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {activeTypeFilter && (
                <div className="bg-arcanaBlue/20 border border-arcanaBlue/50 text-arcanaBlue rounded-full px-3 py-1 text-xs flex items-center">
                  {typeFilters.find((t) => t.id === activeTypeFilter)?.label}
                  <button
                    onClick={() => setActiveTypeFilter(null)}
                    className="ml-2"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {activeRatingFilter && (
                <div className="bg-arcanaBlue/20 border border-arcanaBlue/50 text-arcanaBlue rounded-full px-3 py-1 text-xs flex items-center">
                  {activeRatingFilter}★ et plus
                  <button
                    onClick={() => setActiveRatingFilter(null)}
                    className="ml-2"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Filter Section */}
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">Statut</h4>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((status) => (
              <button
                key={status.id}
                onClick={() => applyStatusFilter(status.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeStatusFilter === status.id
                    ? "bg-arcanaBlue/20 border border-arcanaBlue/50 text-arcanaBlue"
                    : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
                }`}
              >
                {status.icon}
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type Filter Section */}
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">Type</h4>
          <div className="flex flex-wrap gap-2">
            {typeFilters.map((type) => (
              <button
                key={type.id}
                onClick={() => applyTypeFilter(type.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeTypeFilter === type.id
                    ? "bg-arcanaBlue/20 border border-arcanaBlue/50 text-arcanaBlue"
                    : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
                }`}
              >
                {type.icon}
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rating Filter Section */}
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">Note minimale</h4>
          <div className="flex gap-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => applyRatingFilter(rating)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                  activeRatingFilter === rating
                    ? "bg-arcanaBlue/20 border border-arcanaBlue/50 text-arcanaBlue"
                    : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-1">{rating}</span>
                  <Star className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Collection Actions */}
        {isProfileOwner && (
          <>
            <div className="border-t border-white/10 my-6"></div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => openThirdModal(selectedCollection)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Modifier la collection
              </button>
              <button
                onClick={openModal}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-arcanaBlue text-arcanaBackgroundDarker transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Ajouter un élément
              </button>
            </div>
          </>
        )}
      </div>

      {/* Floating Filter Button */}
      <button
        onClick={toggleFilterPanel}
        className={`fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center shadow-lg z-20 transition-colors ${
          isFilterPanelOpen ? "bg-white text-black" : "bg-arcanaBlue text-white"
        }`}
      >
        <SlidersHorizontal className="w-5 h-5" />
      </button>

      {/* Semi-transparent overlay when filter panel is open */}
      {isFilterPanelOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20"
          onClick={toggleFilterPanel}
        ></div>
      )}
    </>
  );
};

export default CollectionFilter;
