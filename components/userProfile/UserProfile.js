import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import TabActivityOther from "./TabActivityOther";
import TabFavorite from "./TabFavorite";
import TabCollection from "./TabCollection";
import FollowersModal from "./FollowersModal";
import FollowingModal from "./FollowingModal";
import EditUserModal from "./EditUserModal";
import MessageModal from "./MessageModal";
import { MessageSquare } from "lucide-react";
import PieStats from "./Stats";

export default function UserProfile({ userId }) {
  const [userInfo, setUserInfo] = useState(null);
  const [topCollection, setTopCollection] = useState(null);
  const [topType, setTopType] = useState([]);
  const [elementsCount, setElementsCount] = useState([]);
  const [statusCount, setStatusCount] = useState([]);
  const [userCollections, setUserCollections] = useState(null);
  const [userLikes, setUserLikes] = useState(null);
  const [activeTab, setActiveTab] = useState("profil");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [isProfileOwner, setIsProfileOwner] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  const router = useRouter();
  const currentUserId = useSelector((state) => state.user.value.userId);
  console.log(currentUserId);

  const handleNavigateToCollection = (id) => router.push(`/collections/${id}`);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (userId) {
        try {
          const userResponse = await fetch(
            `https://back-arcana.vercel.app/users/${userId}`
          );
          const userData = await userResponse.json();

          if (userData.result) {
            setUserInfo(userData.user);
            setIsProfileOwner(currentUserId === userId);
            console.log("userInfo", userInfo);
          }

          if (currentUserId) {
            const connectionsResponse = await fetch(
              `https://back-arcana.vercel.app/connections/${currentUserId}`
            );
            const connectionsData = await connectionsResponse.json();

            if (connectionsData.result && connectionsData.following) {
              setIsFollowing(connectionsData.following.includes(userId));
            }
          }

          const collectionsResponse = await fetch(
            `https://back-arcana.vercel.app/collections/user/${userId}`
          );
          const collectionsData = await collectionsResponse.json();

          if (collectionsData.result) {
            setUserCollections(collectionsData.collections);
          }

          const likesResponse = await fetch(
            `https://back-arcana.vercel.app/likes/${userId}`
          );
          const likesData = await likesResponse.json();

          if (likesData.result) {
            setUserLikes(likesData.likes);

            const topResponse = await fetch(
              `https://back-arcana.vercel.app/collections/top/${userId}`
            );
            const topData = await topResponse.json();
            if (topData.result) {
              console.log(topData.collections);
              setTopCollection({
                cover: topData.collections[0].cover || "",
                title: topData.collections[0].title || "",
                description: topData.collections[0].description || "",
                elements: topData.collections[0].elements || "",
                collectionId: topData.collections[0]._id || "",
              });
            }

            const typeContent = await fetch(
              `https://back-arcana.vercel.app/elements/user/${userId}`
            );
            const typeData = await typeContent.json();
            if (typeData.result) {
              const cleanStats = typeData.stats.map((item) => ({
                ...item,
                percentage: Number(item.percentage),
              }));
              const statusStats = typeData.statusStats.map((item) => ({
                ...item,
                count: item.count,
              }));
              setTopType(cleanStats);
              setStatusCount(statusStats);
              setElementsCount(typeData.elements.length);
            }
          } else {
            console.error("Likes not found");
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données :", error);
        }
      }
      setIsLoading(false);
    };

    fetchData();
  }, [userId, currentUserId]);

  // Extraction des valeurs de chaque statut
  const completedItem = statusCount.find((item) => item.status === "completed");
  const completedCount = completedItem ? completedItem.count : 0;

  const inProgressItem = statusCount.find(
    (item) => item.status === "in-progress"
  );
  const inProgressCount = inProgressItem ? inProgressItem.count : 0;

  const plannedItem = statusCount.find((item) => item.status === "planned");
  const plannedCount = plannedItem ? plannedItem.count : 0;

  let formattedDate = "";
  if (userInfo && userInfo.createdAt) {
    const createdAt = userInfo.createdAt;
    const date = new Date(createdAt);
    const options = { year: "numeric", month: "long" };
    formattedDate = new Intl.DateTimeFormat("fr-FR", options).format(date);
    formattedDate =
      formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-16">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-t-transparent border-arcanaBlue rounded-full animate-spin mb-4"></div>
            <p className="text-white font-medium">Chargement des données...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "profil":
        return (
          <div className="bg-arcanaBackgroundDarker p-6 backdrop-blur-sm rounded-xl border border-white/10 hover:border-arcanaBlue/50 transition-all duration-300 w-full ">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <svg
                className="w-6 h-6 text-arcanaBlue mr-3"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Bienvenue sur le profil de{" "}
              {userInfo?.firstName || userInfo?.username}
            </h2>

            {/* Statistiques collections & contenus */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-3">
              <div className="bg-arcanaBackgroundLighter p-4 rounded-lg border border-white/5">
                <h3 className="text-arcanaBlue font-semibold mb-3 flex items-center">
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
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                  Collections & contenus
                </h3>

                <div className="p-6 bg-arcanaBackgroundDarker text-lg rounded-lg mb-2 mt-10 flex flex-col items-center">
                  <p className="text-arcanaBlue font-bold">
                    {userCollections ? userCollections.length : 0}
                  </p>
                  <p className="text-gray-400">Collections créées</p>
                </div>
                <div className="p-6 bg-arcanaBackgroundDarker text-lg rounded-lg mt-10 flex flex-col items-center">
                  <p className="text-arcanaBlue font-bold">
                    {elementsCount > 0 ? elementsCount : 0}
                  </p>
                  <p className="text-gray-400">
                    Élements ajoutées à ses collections
                  </p>
                </div>
                <div>
                  {topType.length > 0 ? <PieStats data={topType} /> : null}
                </div>
              </div>

              <div className="bg-arcanaBackgroundLighter p-4 rounded-lg border border-white/5">
                <h3 className="text-arcanaBlue font-semibold mb-3 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                  </svg>
                  Sa collection la plus populaire
                </h3>

                {topCollection && topCollection.title ? (
                  <div className="bg-arcanaBackgroundDarker p-6 backdrop-blur-sm rounded-xl border border-white/10 hover:border-arcanaBlue/50 transition-all duration-300">
                    <div
                      onClick={() =>
                        handleNavigateToCollection(topCollection.collectionId)
                      }
                    >
                      <img
                        src={
                          topCollection.cover &&
                          topCollection.cover.includes(
                            "/assets/default-cover.png"
                          )
                            ? topCollection.elements[0]?.cover
                            : topCollection.cover
                        }
                        alt="ok"
                        className={
                          "w-18 h-18 rounded-lg cursor-pointer object-cover"
                        }
                      />
                      <p className="text-xl font-bold text-white flex justify mt-3 mb-2 group-hover:text-arcanaBlue transition-colors duration-300 cursor-pointer">
                        {topCollection.title}
                      </p>
                    </div>
                    <p className="text-gray-300 text-sm line-clamp-2">
                      {topCollection.description}
                    </p>

                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                      <span className="text-sm text-gray-400">
                        {topCollection.elements.length || 0} éléments
                      </span>
                      <span
                        className="text-arcanaBlue text-sm font-medium group-hover:translate-x-1 transition-transform duration-300 cursor-pointer"
                        onClick={() =>
                          handleNavigateToCollection(topCollection.collectionId)
                        }
                      >
                        Voir plus →
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-arcanaBackgroundDarker p-6 rounded-xl border border-white/10 text-gray-400 text-sm text-center">
                    Aucune collection créée à ce jour.
                  </div>
                )}
              </div>
            </div>

            {/* Progression */}
            <h3 className="text-lg font-bold text-arcanaBlue mb-4 mt-8 flex items-center">
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
                <path d="M12 20V10"></path>
                <path d="M18 20V4"></path>
                <path d="M6 20v-6"></path>
              </svg>
              Progression
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-arcanaBackgroundLighter p-3 rounded-lg border border-white/5 text-center">
                <p className="text-2xl font-bold text-arcanaBlue">
                  {userCollections ? userCollections.length : 0}
                </p>
                <p className="text-xs text-gray-400">Collections créées</p>
              </div>

              <div className="bg-arcanaBackgroundLighter p-3 rounded-lg border border-white/5 text-center">
                <p className="text-2xl font-bold text-arcanaBlue">
                  {" "}
                  {completedCount || 0}
                </p>
                <p className="text-xs text-gray-400">contenus terminés</p>
              </div>

              <div className="bg-arcanaBackgroundLighter p-3 rounded-lg border border-white/5 text-center">
                <p className="text-2xl font-bold text-arcanaBlue">
                  {inProgressCount || 0}
                </p>
                <p className="text-xs text-gray-400">contenus en cours</p>
              </div>

              <div className="bg-arcanaBackgroundLighter p-3 rounded-lg border border-white/5 text-center">
                <p className="text-2xl font-bold text-arcanaBlue">
                  {plannedCount || 0}
                </p>
                <p className="text-xs text-gray-400">contenus à découvrir</p>
              </div>
            </div>

            <div className="text-gray-300 leading-relaxed space-y-4 mt-6 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-400 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-arcanaBlue"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  Membre depuis {formattedDate}
                </p>
              </div>
            </div>
          </div>
        );
      case "collection":
        return <TabCollection userId={userId} />;
      case "activities":
        return <TabActivityOther userId={userId} />;
      case "favoris":
        return <TabFavorite userId={userId} />;
      default:
        return <div>Onglet inconnu.</div>;
    }
  };

  const handleFollowToggle = async () => {
    const targetUserId = userId;

    try {
      const res = await fetch("https://back-arcana.vercel.app/users/follow", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, targetUserId }),
      });

      const data = await res.json();

      if (data.result) {
        setIsFollowing(data.action === "followed");

        if (userInfo) {
          const updatedUserInfo = { ...userInfo };
          if (data.action === "followed") {
            updatedUserInfo.followers = [
              ...(updatedUserInfo.followers || []),
              { userId: currentUserId },
            ];
          } else {
            updatedUserInfo.followers = (
              updatedUserInfo.followers || []
            ).filter((f) => f.userId !== currentUserId);
          }
          setUserInfo(updatedUserInfo);
        }
      } else {
        console.error("Échec de la modification du suivi:", data.error);
      }
    } catch (err) {
      console.error("Erreur lors du toggle follow:", err);
    }
  };

  const openMessageModal = () => {
    setIsMessageModalOpen(true);
  };

  const closeMessageModal = () => {
    setIsMessageModalOpen(false);
  };

  const handleSendMessage = async (messageContent) => {
    try {
      const conversationRes = await fetch(
        "https://back-arcana.vercel.app/messages/start-conversation",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId1: currentUserId,
            userId2: userId,
          }),
        }
      );

      const conversationData = await conversationRes.json();

      if (!conversationData || conversationData.error) {
        console.error(
          "Erreur lors de l'initialisation de la conversation:",
          conversationData?.error
        );
        return;
      }

      if (messageContent) {
        const messageRes = await fetch("https://back-arcana.vercel.app/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderId: currentUserId,
            receiverId: userId,
            content: messageContent,
          }),
        });

        const messageData = await messageRes.json();

        if (!messageData || messageData.error) {
          console.error(
            "Erreur lors de l'envoi du message:",
            messageData?.error
          );
          return;
        }
      }

      setIsMessageModalOpen(false);
      router.push({
        pathname: "/message",
        query: { selectedUserId: userId },
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    }
  };

  // Fonction pour ouvrir la modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Fonction pour fermer la modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Fonction de mise à jour des informations de l'utilisateur après modification
  const handleUpdateUserInfo = (updatedUserInfo) => {
    const formattedUpdatedUserInfo = {
      ...updatedUserInfo,
    };
    setUserInfo(formattedUpdatedUserInfo);
  };

  const openFollowersModal = () => setIsFollowersModalOpen(true);
  const closeFollowersModal = () => setIsFollowersModalOpen(false);

  const openFollowingModal = () => setIsFollowingModalOpen(true);
  const closeFollowingModal = () => setIsFollowingModalOpen(false);

  return (
    <div className="min-h-screen w-full bg-gradient-to-t from-arcanaBackgroundDarker to-arcanaBackgroundLighter cursor-default font-jakarta">
      <div className="flex flex-1">
        <aside className="w-1/6 p-4 hidden lg:block"></aside>

        <main className="w-full lg:w-4/6 max-w-[1200px] mx-auto flex flex-col space-y-8 py-10 px-4 md:px-6 lg:px-0">
          <div className="bg-arcanaBackgroundDarker backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:border-arcanaBlue/50">
            <div className="h-40 bg-gradient-to-r from-arcanaBackgroundDarker to-arcanaBackgroundLighter relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            </div>

            <div className="px-6 md:px-8 py-6 -mt-20 relative">
              <div className="flex flex-col md:flex-row md:items-end">
                <div className="flex-shrink-0 mb-4 md:mb-0">
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-arcanaBackgroundDarker overflow-hidden shadow-xl bg-arcanaBackgroundDarker">
                    <img
                      src={userInfo?.avatar || "/assets/default-avatar.png"}
                      className="w-full h-full object-cover"
                      alt={userInfo?.username || "Profile avatar"}
                    />
                  </div>
                </div>

                <div className="md:ml-6 flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-white">
                        {userInfo ? userInfo.username : "Chargement..."}
                      </h1>
                      <p className="text-gray-300 text-sm">
                        {userInfo
                          ? `Membre depuis ${formattedDate}`
                          : "Chargement..."}
                      </p>
                    </div>

                    {isProfileOwner && (
                      <button
                        onClick={openModal}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 bg-arcanaBackgroundDarker text-white border border-arcanaBlue hover:bg-arcanaBlue/10"
                      >
                        <svg
                          className="w-4 h-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M19.5 3.5l-2.37 2.37" />
                          <path d="M13.5 20H11v-4H5v4H3v-7a1 1 0 0 1 1-1h5v-4h2v4h5.42l1.38-1.38a.5.5 0 0 1 .77 0l1.38 1.38a.5.5 0 0 1 0 .71z" />
                        </svg>
                        <span>Modifier le profil</span>
                      </button>
                    )}

                    {!isProfileOwner && (
                      <div className="mt-4 md:mt-0 flex space-x-3">
                        <button
                          onClick={openMessageModal}
                          className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 bg-arcanaBackgroundDarker text-white border border-arcanaBlue hover:bg-arcanaBlue/10"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Message</span>
                        </button>
                        <button
                          onClick={handleFollowToggle}
                          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                            isFollowing
                              ? "bg-arcanaBackgroundDarker border border-white/30 hover:border-white/50 text-white"
                              : "bg-arcanaBlue hover:bg-arcanaBlue/90 text-white"
                          }`}
                        >
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            {isFollowing ? (
                              <path
                                d="M18 6L6 18M6 6L18 18"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            ) : (
                              <path
                                d="M12 4V20M4 12H20"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            )}
                          </svg>
                          <span>
                            {isFollowing ? "Se désabonner" : "Suivre"}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 max-w-2xl">
                    <h2 className="text-lg font-bold text-arcanaBlue mb-1">
                      À propos
                    </h2>
                    <p className="text-gray-300">
                      {userInfo?.bio || "Aucune biographie n'est disponible."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-8">
                <div className="bg-arcanaBackgroundDarker p-4 backdrop-blur-sm rounded-xl border border-white/10 hover:border-arcanaBlue/50 transition-all duration-300 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    {userCollections ? userCollections.length : 0}
                  </div>
                  <div className="text-gray-400 text-sm">Collections</div>
                </div>

                <div className="bg-arcanaBackgroundDarker p-4 backdrop-blur-sm rounded-xl border border-white/10 hover:border-arcanaBlue/50 transition-all duration-300 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    {userLikes && userLikes.length > 0 ? userLikes.length : 0}
                  </div>
                  <div className="text-gray-400 text-sm">Favoris</div>
                </div>

                <div
                  className="bg-arcanaBackgroundDarker p-4 backdrop-blur-sm rounded-xl border border-white/10 hover:border-arcanaBlue/50 transition-all duration-300 text-center cursor-pointer"
                  onClick={openFollowingModal}
                >
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    {userInfo &&
                    userInfo.following &&
                    userInfo.following.length > 0
                      ? userInfo.following.length
                      : 0}
                  </div>
                  <div className="text-gray-400 text-sm">Following</div>
                </div>

                <div
                  className="bg-arcanaBackgroundDarker p-4 backdrop-blur-sm rounded-xl border border-white/10 hover:border-arcanaBlue/50 transition-all duration-300 text-center cursor-pointer"
                  onClick={openFollowersModal}
                >
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    {userInfo &&
                    userInfo.followers &&
                    userInfo.followers.length > 0
                      ? userInfo.followers.length
                      : 0}
                  </div>
                  <div className="text-gray-400 text-sm">Followers</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-arcanaBackgroundDarker backdrop-blur-sm border border-white/10 rounded-xl mb-6 overflow-hidden">
            <div className="flex flex-wrap">
              <button
                className={`px-4 md:px-6 py-3 font-medium transition-all duration-300 ${
                  activeTab === "profil"
                    ? "text-arcanaBackgroundDarker bg-arcanaBlue"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
                onClick={() => setActiveTab("profil")}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span className="hidden md:inline">PROFIL</span>
                </div>
              </button>
              <button
                className={`px-4 md:px-6 py-3 font-medium transition-all duration-300 ${
                  activeTab === "collection"
                    ? "text-arcanaBackgroundDarker bg-arcanaBlue"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
                onClick={() => setActiveTab("collection")}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  <span className="hidden md:inline">COLLECTIONS</span>
                </div>
              </button>
              <button
                className={`px-4 md:px-6 py-3 font-medium transition-all duration-300 ${
                  activeTab === "activities"
                    ? "text-arcanaBackgroundDarker bg-arcanaBlue"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
                onClick={() => setActiveTab("activities")}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span className="hidden md:inline">ACTIVITÉS RÉCENTES</span>
                </div>
              </button>
              <button
                className={`px-4 md:px-6 py-3 font-medium transition-all duration-300 ${
                  activeTab === "favoris"
                    ? "text-arcanaBackgroundDarker bg-arcanaBlue"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
                onClick={() => setActiveTab("favoris")}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span className="hidden md:inline">FAVORIS</span>
                </div>
              </button>
            </div>
          </div>

          <div className="flex justify-center">{renderContent()}</div>
        </main>

        <aside className="w-1/6 p-4 hidden lg:block"></aside>
      </div>

      {isModalOpen && (
        <EditUserModal
          isOpen={isModalOpen}
          onClose={closeModal}
          userInfo={userInfo}
          onUpdate={handleUpdateUserInfo}
        />
      )}

      {isMessageModalOpen && (
        <MessageModal
          isOpen={isMessageModalOpen}
          onClose={closeMessageModal}
          onSendMessage={handleSendMessage}
          recipientName={userInfo?.username}
        />
      )}

      {isFollowersModalOpen && (
        <FollowersModal
          isOpen={isFollowersModalOpen}
          onClose={closeFollowersModal}
          followers={userInfo?.followers || []}
        />
      )}

      {isFollowingModalOpen && (
        <FollowingModal
          isOpen={isFollowingModalOpen}
          onClose={closeFollowingModal}
          following={userInfo?.following || []}
        />
      )}
    </div>
  );
}
