import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

const TabCollection = ({ userId }) => {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCollections, setVisibleCollections] = useState(6);

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + "...";
  };

  useEffect(() => {
    const fetchCollections = async () => {
      setIsLoading(true);
      if (userId) {
        try {
          const response = await axios.get(
            `https://back-arcana.vercel.app/collections/user/${userId}`
          );
          if (response.data.result) {
            setCollections(response.data.collections);
          }
        } catch (error) {
          console.error("Error fetching collections:", error);
        }
      }
      setIsLoading(false);
    };

    fetchCollections();
  }, [userId]);

  const handleViewMore = () => {
    setVisibleCollections((prev) => prev + 6);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16 w-full">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-white font-medium">
            Chargement des collections...
          </p>
        </div>
      </div>
    );
  }

  // Empty State
  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl w-full max-w-4xl">
        <svg
          className="w-16 h-16 text-blue-400 mb-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <rect x="7" y="7" width="3" height="9"></rect>
          <rect x="14" y="7" width="3" height="5"></rect>
        </svg>
        <h2 className="text-2xl font-bold text-white mb-3">
          Aucune collection trouvée
        </h2>
        <p className="text-gray-300 mb-4 text-center max-w-md">
          Vous n'avez pas encore créé de collections.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.slice(0, visibleCollections).map((collection) => (
          <Link
            key={collection._id}
            href={`/collections/${collection._id}`}
            passHref
          >
            <a className="block group">
              <div className="bg-arcanaBackgroundDarker p-6 backdrop-blur-sm rounded-xl border border-white/10 hover:border-arcanaBlue/50 transition-all duration-300">
                <div className="h-40 bg-gradient-to-r from-arcanaBackgroundDarker to-arcanaBackgroundLighter relative overflow-hidden rounded-lg mb-4">
                  {collection.cover ? (
                    <img
                      src={
                        collection.cover &&
                        collection.cover.includes("/assets/default-cover.png")
                          ? collection.elements[0]?.cover
                          : collection.cover
                      }
                      alt={collection.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <LayoutGrid className="w-12 h-12 text-white/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                </div>

                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-arcanaBlue transition-colors duration-300">
                  {truncateText(collection.title, 30)}
                </h2>
                <p className="text-gray-300 text-sm line-clamp-2">
                  {truncateText(collection.description || "", 30)}
                </p>

                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    {collection.elements?.length || 0} éléments
                  </span>
                  <span className="text-arcanaBlue text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
                    Voir plus →
                  </span>
                </div>
              </div>
            </a>
          </Link>
        ))}
      </div>
      {visibleCollections < collections.length && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleViewMore}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition bg-arcanaBlue text-arcanaBackgroundDarker"
          >
            Voir plus
          </button>
        </div>
      )}
    </div>
  );
};

export default TabCollection;
