import { useRouter } from "next/router";
import { File, Heart, Users, Folder, SearchX } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Tag } from "lucide-react";

export default function SearchResults({ users = [], collections = [] }) {
  const router = useRouter();
  const [usersWithCollectionCount, setUsersWithCollectionCount] =
    useState(users);

  const handleNavigateToUserProfile = (userId) => {
    if (!userId) return;
    router.push(`/userProfile/${userId}`);
  };

  const hasResults = users.length > 0 || collections.length > 0;

  useEffect(() => {
    const fetchCollectionCounts = async () => {
      const updatedUsers = await Promise.all(
        users.map(async (user) => {
          try {
            const response = await axios.get(
              `https://back-arcana.vercel.app/collections/count/${user._id}`
            );
            return { ...user, collectionsCount: response.data.count };
          } catch (error) {
            console.error("Error fetching collection count:", error);
            return user;
          }
        })
      );
      setUsersWithCollectionCount(updatedUsers);
    };

    fetchCollectionCounts();
  }, [users]);

  return (
    <>
      {!hasResults ? (
        <div className="bg-arcanaBackgroundDarker p-6 backdrop-blur-sm rounded-xl border border-white/10 flex flex-col items-center justify-center py-16 px-4">
          <SearchX className="w-16 h-16 text-arcanaBlue mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">
            Aucun résultat trouvé
          </h2>
          <p className="text-gray-300 mb-8 text-center max-w-md">
            Essayez d'autres mots-clés ou vérifiez l'orthographe de votre
            recherche.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 font-jakarta">
          {/* Collections */}
          <section className="w-full rounded-xl bg-arcanaBackgroundDarker p-6 md:px-8 md:pt-6 md:pb-8 backdrop-blur-sm border border-white/10">
            <h2 className="mb-6 font-jakarta text-xl font-semibold text-white flex items-center">
              <Folder className="w-5 h-5 text-arcanaBlue mr-2" />
              Collections
            </h2>

            {collections.length > 0 ? (
              <ul className="space-y-6">
                {collections.map((collection) => (
                  <li
                    key={collection._id}
                    className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
                  >
                    {/* Cover */}
                    <div
                      className="w-full sm:w-[120px] md:w-[160px] h-32 sm:h-20 md:h-24 overflow-hidden rounded-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() =>
                        router.push(`/collections/${collection._id}`)
                      }
                    >
                      {collection.cover ? (
                        <img
                          src={collection.cover}
                          alt={collection.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-arcanaBackgroundDarker to-arcanaBackgroundLighter flex items-center justify-center">
                          <Folder className="w-10 h-10 text-white/40" />
                        </div>
                      )}
                    </div>

                    {/* Text + counts */}
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <p
                          className="text-base font-medium text-white hover:text-arcanaBlue cursor-pointer text-center sm:text-left"
                          onClick={() =>
                            router.push(`/collections/${collection._id}`)
                          }
                        >
                          {collection.title}
                        </p>
                        <div className="flex items-center justify-center sm:justify-start gap-3 text-sm text-gray-400 font-roboto">
                          <div className="flex items-center gap-1">
                            <File size={16} />
                            <span>{collection.elements?.length ?? 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart size={16} />
                            <span>{collection.likesCount ?? 0}</span>
                          </div>
                        </div>
                      </div>
                      <p
                        className="font-roboto text-sm text-gray-400 cursor-pointer text-center sm:text-left"
                        onClick={() =>
                          handleNavigateToUserProfile(collection.userId._id)
                        }
                      >
                        {collection.userId?.username ?? "Inconnu"}
                      </p>
                      {/* Tags */}
                      {collection.tags && collection.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {collection.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="bg-gray-800 text-gray-400 rounded px-3 py-1 text-xs inline-flex items-center cursor-pointer hover:bg-gray-700 transition-colors duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/search?q=${encodeURIComponent(tag)}`
                                );
                              }}
                            >
                              <Tag className="mr-1.5 w-[12px] h-[12px]" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-roboto text-gray-500 text-center py-8">
                Aucune collection trouvée
              </p>
            )}
          </section>

          {/* Users */}
          <section className="w-full rounded-xl bg-arcanaBackgroundDarker p-6 md:px-8 md:pt-6 md:pb-8 backdrop-blur-sm border border-white/10">
            <h2 className="mb-6 font-jakarta text-xl font-semibold text-white flex items-center">
              <Users className="w-5 h-5 text-arcanaBlue mr-2" />
              Utilisateurs
            </h2>

            {usersWithCollectionCount.length > 0 ? (
              <ul className="space-y-6">
                {usersWithCollectionCount.map((user) => (
                  <li
                    key={user._id}
                    className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 py-2 px-2 rounded-lg hover:bg-white/5 transition-colors duration-200 cursor-pointer"
                    onClick={() => handleNavigateToUserProfile(user._id)}
                  >
                    {/* Avatar */}
                    <img
                      src={
                        !user.avatar ||
                        user.avatar.includes("default-avatar.png")
                          ? "/assets/default-avatar.png"
                          : user.avatar
                      }
                      alt={user.username}
                      className="w-16 h-16 rounded-full object-cover border-2 border-transparent hover:border-arcanaBlue transition duration-300"
                    />

                    {/* Name + stats */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-6 w-full">
                      <p className="font-jakarta text-base font-medium text-white hover:text-arcanaBlue transition-colors duration-200">
                        {user.username}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-400 font-roboto">
                        <div className="flex items-center gap-1">
                          <Folder size={16} />
                          <span>{user.collectionsCount ?? 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={16} />
                          <span>{user.followers?.length ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-roboto text-gray-500 text-center py-8">
                Aucun utilisateur trouvé
              </p>
            )}
          </section>
        </div>
      )}
    </>
  );
}
