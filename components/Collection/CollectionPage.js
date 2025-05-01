import { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import Element from "./Element";
import CollectionInfos from "./CollectionInfos";
import GrainOverlay from "../GrainOverlay";
import { ArrowLeft, MessageSquare } from "lucide-react";
import Link from "next/link";
import CommentModal from "../Discover/CommentModal";
import CollectionComments from "./CollectionComments";

dayjs.extend(relativeTime);
dayjs.locale("fr");

export default function CollectionPage({ collectionId }) {
  const [collection, setCollection] = useState(null);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isProfileOwner, setIsProfileOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const userId = useSelector((state) => state.user.value.userId);
  const isAuthenticated = useSelector(
    (state) => state.user.value.token !== null
  );
  const router = useRouter();

  useEffect(() => {
    const fetchCollection = async () => {
      setIsLoading(true);
      try {
        // Récupérer les infos de la collection
        const response = await fetch(
          `https://back-arcana.vercel.app/collections/${collectionId}`
        );
        const collectionData = await response.json();

        if (collectionData.result) {
          setCollection(collectionData.collection);
        }

        const collectionUserId = collectionData.collection.userId._id;
        setIsProfileOwner(userId === collectionUserId);

        // Récupérer le nombre de like de la collection
        const likesResponse = await fetch(
          `https://back-arcana.vercel.app/likes/collection/${collectionId}`
        );
        const likesData = await likesResponse.json();

        if (likesData.result) {
          setLikes(likesData.likes.length);
        }

        // Vérifier si le user a déjà liké la collection
        if (isAuthenticated && userId) {
          const likesByUserRes = await fetch(
            `https://back-arcana.vercel.app/likes/${userId}`
          );
          const likesByUserData = await likesByUserRes.json();
          if (likesByUserData.result && likesByUserData.likes) {
            const alreadyLiked = likesByUserData.likes.some(
              (like) => like.collectionId._id === collectionId
            );
            setIsLiked(alreadyLiked);
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching collection:", error);
        setIsLoading(false);
      }
    };

    if (collectionId) {
      fetchCollection();
    }
  }, [collectionId, isAuthenticated, userId]);

  // Liker la liste
  const handleLike = async () => {
    if (isAuthenticated && userId) {
      try {
        const likesByUser = await fetch(
          `https://back-arcana.vercel.app/likes/${userId}`
        );
        const likesByUserResponse = await likesByUser.json();

        const isCurrentlyLiked =
          likesByUserResponse.likes &&
          likesByUserResponse.likes.some(
            (like) => like.collectionId._id === collectionId
          );

        if (!isCurrentlyLiked) {
          await fetch("https://back-arcana.vercel.app/likes/like", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId,
              collectionId,
            }),
          });
          setIsLiked(true);
          // Incrémenter le nombre de likes
          setLikes((prevLikes) => prevLikes + 1);
        } else {
          await fetch(
            `https://back-arcana.vercel.app/likes/${userId}/${collectionId}`,
            {
              method: "DELETE",
            }
          );
          setIsLiked(false);
          setLikes((prevLikes) => prevLikes - 1);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      // Redirect to login if not authenticated
      router.push("/login");
    }
  };

  const handleNavigateToProfile = (id) => {
    router.push(`/userProfile/${id}`);
  };

  if (isLoading || !collection) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-t from-arcanaBackgroundDarker to-arcanaBackgroundLighter">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-transparent border-arcanaBlue rounded-full animate-spin mb-4"></div>
          <p className="text-white font-semibold">
            Chargement de la collection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <GrainOverlay />
      <div className="min-h-screen bg-gradient-to-t from-arcanaBackgroundDarker to-arcanaBackgroundLighter cursor-default">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          {/* Back button */}
          <Link href="/library" passHref>
            <a className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition duration-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Retour à la bibliothèque</span>
            </a>
          </Link>

          {/* Collection Content */}
          <div className="flex flex-col md:flex-row gap-8">
            <CollectionInfos
              collection={collection}
              likes={likes}
              onNavigate={handleNavigateToProfile}
              onLike={handleLike}
              isLiked={isLiked}
              isProfileOwner={isProfileOwner}
            />

            <div className="flex-1 flex flex-col gap-6">
              <Element
                collection={collection}
                collectionId={collectionId}
                isProfileOwner={isProfileOwner}
              />

              <CollectionComments
                collectionId={collectionId}
                collection={collection}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
