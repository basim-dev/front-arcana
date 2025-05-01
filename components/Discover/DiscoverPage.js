import { useEffect, useState } from "react";
import axios from "axios";
import GrainOverlay from "../GrainOverlay";
import SectionBlock from "./SectionBlock";
import CommentModal from "./CommentModal";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Discover() {
  const [top, setTop] = useState([]);
  const [recent, setRecent] = useState([]);
  const [random, setRandom] = useState([]);
  const [likedIds, setLikedIds] = useState([]);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);

  const router = useRouter();

  useEffect(() => {
    fetchCollections();
    fetchUserLikes();
  }, [router.asPath]);

  const formatCollections = (data = []) =>
    data
      .filter((c) => c && c.userId && typeof c.userId === "object")
      .map((c) => ({
        id: c._id,
        creator: {
          id: c.userId._id,
          username: c.userId.username || "inconnu",
          avatar: c.userId.avatar || "/assets/default-avatar.png",
        },
        collection: {
          title: c.title,
          cover:
            c.cover && c.cover.includes("/assets/default-cover.png")
              ? c.elements[0]?.cover || "/assets/default-cover.png"
              : c.cover,
        },
      }));

  // API calls
  const fetchCollections = async () => {
    try {
      const [topRes, recentRes, randomRes] = await Promise.all([
        axios.get("https://back-arcana.vercel.app/collections/top"),
        axios.get("https://back-arcana.vercel.app/collections/recent"),
        axios.get("https://back-arcana.vercel.app/collections/random"),
      ]);

      setTop(formatCollections(topRes.data.collections));
      setRecent(formatCollections(recentRes.data.collections));
      setRandom(formatCollections(randomRes.data.collections));
    } catch (err) {
      console.error("Erreur lors de la récupération des collections:", err);
    }
  };

  const fetchUserLikes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await axios.post(
        "https://back-arcana.vercel.app/users/by-token",
        {
          token,
        }
      );
      if (!data.result || !data.user) return;

      const userId = data.user._id;
      const likesRes = await axios.get(
        `https://back-arcana.vercel.app/likes/${userId}`
      );

      const ids = (likesRes.data.likes || [])
        .map(
          (l) =>
            l.collectionId?._id ??
            (typeof l.collectionId === "string" ? l.collectionId : null)
        )
        .filter(Boolean);

      setLikedIds(ids);
    } catch (err) {
      console.error(
        "Erreur lors de la récupération des likes de l'utilisateur:",
        err
      );
    }
  };

  // Navigation & interactions
  const handleNavigateToCollection = (id) => router.push(`/collections/${id}`);

  const handleNavigateToUserProfile = (userId) => {
    if (!userId) return;
    router.push(`/userProfile/${userId}`);
  };

  const handleToggleLike = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vous devez être connecté pour aimer une collection.");
        return;
      }

      const { data } = await axios.post(
        "https://back-arcana.vercel.app/users/by-token",
        {
          token,
        }
      );
      if (!data.result || !data.user) return;

      const userId = data.user._id;
      const already = likedIds.includes(id);

      if (already) {
        await axios.delete("https://back-arcana.vercel.app/likes/like", {
          data: { userId, collectionId: id },
        });
        setLikedIds((prev) => prev.filter((x) => x !== id));
      } else {
        await axios.post("https://back-arcana.vercel.app/likes/like", {
          userId,
          collectionId: id,
        });
        setLikedIds((prev) => [...prev, id]);
      }
    } catch (err) {
      console.error("Erreur lors du changement de like:", err);
    }
  };

  const handleOpenCommentModal = (collection) => {
    setSelectedCollection(collection);
    setCommentModalOpen(true);
  };

  const handleCloseCommentModal = () => {
    setCommentModalOpen(false);
    setSelectedCollection(null);
  };

  return (
    <>
      <GrainOverlay />

      <div className="flex flex-col min-h-screen bg-gradient-to-t from-arcanaBackgroundDarker to-arcanaBackgroundLighter">
        <div className="flex flex-1">
          {/* Left Sidebar */}
          <aside className="w-1/6 p-4" />

          {/* Main Content */}
          <main className="w-4/6 max-w-[1200px] mx-auto flex flex-col space-y-16 py-16 font-jakarta">
            <div className="w-full px-6 text-center">
              <h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
                Découvrez ce qui est tendance, ce qui est nouveau, et ce que vos
                amis aiment.
              </h1>
            </div>

            <SectionBlock
              title="Les plus populaires"
              collections={top}
              likedIds={likedIds}
              onClick={handleNavigateToCollection}
              onUserClick={handleNavigateToUserProfile}
              onLikeToggle={handleToggleLike}
              onCommentClick={handleOpenCommentModal}
              showCount={6}
            />

            <SectionBlock
              title="Récemment enregistrés"
              collections={recent}
              likedIds={likedIds}
              onClick={handleNavigateToCollection}
              onUserClick={handleNavigateToUserProfile}
              onLikeToggle={handleToggleLike}
              onCommentClick={handleOpenCommentModal}
              showCount={6}
            />

            <SectionBlock
              title="Aléatoire"
              collections={random}
              likedIds={likedIds}
              onClick={handleNavigateToCollection}
              onUserClick={handleNavigateToUserProfile}
              onLikeToggle={handleToggleLike}
              onCommentClick={handleOpenCommentModal}
              showCount={6}
            />
          </main>

          {/* Right Sidebar */}
          <aside className="w-1/6 p-4" />
        </div>
      </div>

      {/* Comment Modal */}
      <CommentModal
        isOpen={commentModalOpen}
        onClose={handleCloseCommentModal}
        collection={selectedCollection}
      />
    </>
  );
}
