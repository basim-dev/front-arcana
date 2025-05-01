import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useSelector } from "react-redux";
import { LibraryModal } from "./library-modal";
import { LoginModal } from "../login-modal";
import { SignupModal } from "../signup-modal";
import GrainOverlay from "../GrainOverlay";
import { Library, PlusCircle, LayoutGrid } from "lucide-react";

const LibraryPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const userId = useSelector((state) => state.user.value.userId);
  const isAuthenticated = useSelector(
    (state) => state.user.value.token !== null
  );

  const handleCreateCollection = () => {
    if (isAuthenticated) {
      setIsModalOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const closeSignupModal = () => {
    setIsSignupModalOpen(false);
  };

  const openSignupModal = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(true);
  };

  const openLoginModal = () => {
    setIsSignupModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleCollectionCreated = (newCollection) => {
    setCollections((prevCollections) => [...prevCollections, newCollection]);
  };

  useEffect(() => {
    const fetchCollections = async () => {
      setIsLoading(true);
      if (isAuthenticated && userId) {
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
      } else {
        setCollections([]);
      }
      setIsLoading(false);
    };

    fetchCollections();
  }, [isAuthenticated, userId]);

  return (
    <>
      <GrainOverlay />
      <div className="flex flex-col min-h-screen bg-gradient-to-t from-arcanaBackgroundDarker to-arcanaBackgroundLighter cursor-default">
        <div className="flex flex-1">
          <aside className="w-1/6 p-4"></aside>

          <main className="w-4/6 max-w-[1200px] mx-auto flex flex-col space-y-10 py-16 font-jakarta">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
              <div className="flex items-center mb-6 md:mb-0">
                <Library className="w-8 h-8 text-arcanaBlue mr-3" />
                <h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
                  Ma Bibliothèque
                </h1>
              </div>

              {collections.length >= 1 && (
                <button
                  onClick={handleCreateCollection}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition bg-arcanaBlue text-arcanaBackgroundDarker"
                >
                  <PlusCircle className="w-4 h-4" />
                  Nouvelle collection
                </button>
              )}
            </div>

            {/* Empty State */}
            {collections.length === 0 && !isLoading && (
              <div className="bg-arcanaBackgroundDarker p-6 backdrop-blur-sm rounded-xl border border-white/10 flex flex-col items-center justify-center py-16 px-4">
                <LayoutGrid className="w-16 h-16 text-arcanaBlue mb-4" />
                <h2 className="text-2xl font-bold text-white mb-3">
                  Aucune collection
                </h2>
                <p className="text-gray-300 mb-8 text-center max-w-md">
                  Commencez à organiser vos contenus préférés en créant votre
                  première collection.
                </p>
                <button
                  onClick={handleCreateCollection}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition bg-arcanaBlue text-arcanaBackgroundDarker"
                >
                  <PlusCircle className="w-4 h-4" />
                  Créer ma première collection
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-16">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-t-transparent border-arcanaBlue rounded-full animate-spin mb-4"></div>
                  <p className="text-white font-medium">
                    Chargement des collections...
                  </p>
                </div>
              </div>
            )}

            {/* Collections Grid */}
            {collections.length > 0 && !isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((collection) => (
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
                                !collection.cover.includes(
                                  "/assets/default-cover.png"
                                )
                                  ? collection.cover
                                  : collection.elements[0]?.cover ||
                                    "/assets/default-cover.png"
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
                          {collection.title}
                        </h2>
                        <p className="text-gray-300 text-sm line-clamp-2">
                          {collection.description || ""}
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
            )}
          </main>

          <aside className="w-1/6 p-4"></aside>
        </div>
      </div>

      {/* Modals */}
      <LibraryModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onCollectionCreated={handleCollectionCreated}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        openSignupModal={openSignupModal}
      />

      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={closeSignupModal}
        openLoginModal={openLoginModal}
      />
    </>
  );
};

export default LibraryPage;
