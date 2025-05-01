import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Heart, LayoutGrid } from "lucide-react";
import Link from "next/link";

const TabFavorite = ({ userId }) => {
  const [userLikes, setUserLikes] = useState([]);
  const [visibleLikes, setVisibleLikes] = useState(6);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Truncate text utility
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + "...";
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (userId) {
        try {
          const likesResponse = await fetch(
            `https://back-arcana.vercel.app/likes/${userId}`
          );
          const likesData = await likesResponse.json();

          if (likesData.result) {
            const likesWithValidCollections = likesData.likes.filter(
              (like) => like.collectionId && like.collectionId.userId
            );

            const likesWithAvatars = likesWithValidCollections.map((like) => {
              const user = like.collectionId.userId;
              return like;
            });

            setUserLikes(likesWithAvatars);
          } else {
            console.error("Likes not found");
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données :", error);
        }
      } else {
        setUserLikes([]);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [userId]);

  const handleNavigateToCollection = (id) => {
    router.push(`/collections/${id}`);
  };

  const handleNavigateToProfile = (id, e) => {
    e.stopPropagation();
    router.push(`/userProfile/${id}`);
  };

  const handleViewMore = () => {
    setVisibleLikes((prev) => prev + 6);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16 w-full">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-white font-medium">Chargement des favoris...</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (userLikes.length === 0) {
    return (
      <div className="bg-white/5 p-6 backdrop-blur-sm rounded-xl border border-white/10 flex flex-col items-center justify-center py-16 px-4 w-full">
        <Heart className="w-16 h-16 text-blue-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-3">
          Aucun favori trouvé
        </h2>
        <p className="text-gray-300 mb-4 text-center max-w-md">
          Vous n'avez pas encore ajouté de collections à vos favoris.
        </p>
      </div>
    );
  }

  // Favorites Grid
  return (
    <div className="w-full max-w-6xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {userLikes.slice(0, visibleLikes).map((like) => (
          <Link
            key={like._id}
            href={`/collections/${like.collectionId._id}`}
            passHref
          >
            <a target="_blank" className="block group">
              <div className="bg-arcanaBackgroundDarker p-6 backdrop-blur-sm rounded-xl border border-white/10 hover:border-arcanaBlue/50 transition-all duration-300">
                <div className="h-40 bg-gradient-to-r from-arcanaBackgroundDarker to-arcanaBackgroundLighter relative overflow-hidden rounded-lg mb-4">
                  {like.collectionId.cover ? (
                    <img
                      src={
                        like.collectionId.cover &&
                        like.collectionId.cover.includes(
                          "/assets/default-cover.png"
                        )
                          ? like.collectionId.elements[0]?.cover
                          : like.collectionId.cover
                      }
                      alt={like.collectionId.title}
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
                  {truncateText(like.collectionId.title, 30)}
                </h2>
                <p className="text-gray-300 text-sm line-clamp-2">
                  {truncateText(like.collectionId.description || "", 30)}
                </p>

                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault(); // Empêcher le comportement par défaut du <Link>
                      e.stopPropagation(); // Empêcher l'événement de clic de remonter (bubbling) vers le <Link>.
                      window.open(
                        `/userProfile/${like.collectionId.userId._id}`,
                        "_blank"
                      );
                    }}
                  >
                    <img
                      src={like.collectionId.userId.avatar}
                      alt={like.collectionId.userId.username}
                      className="w-6 h-6 rounded-full object-cover mr-2"
                    />
                    <span className="text-sm text-gray-400 hover:underline">
                      {like.collectionId.userId.username}
                    </span>
                  </div>
                  <span className="text-arcanaBlue text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
                    Voir plus →
                  </span>
                </div>
              </div>
            </a>
          </Link>
        ))}
      </div>
      {visibleLikes < userLikes.length && (
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

export default TabFavorite;
