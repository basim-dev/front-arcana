import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";
import { Heart, Calendar, User, Tag } from "lucide-react";
import { useRouter } from "next/router";

dayjs.extend(relativeTime);
dayjs.locale("fr");

export default function CollectionInfos({
  collection,
  likes,
  onNavigate,
  onLike,
  isLiked,
}) {
  const router = useRouter();

  // Fonction pour gérer le clic sur un tag
  const handleTagClick = (tag) => {
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  };

  return (
    <aside className="w-full md:w-[95%] lg:w-1/5 min-w-[300px] mr-8">
      <div className="bg-arcanaBackgroundDarker backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden sticky top-6">
        {/* Cover Image */}
        <div className="h-64 relative overflow-hidden">
          {collection.cover ? (
            <img
              src={collection.cover}
              alt={collection.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-arcanaBackgroundDarker to-arcanaBackgroundLighter flex items-center justify-center">
              <span className="text-white/30 text-lg">Aucune image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        </div>

        {/* Collection Info */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-3 font-jakarta tracking-tight">
            {collection.title}
          </h2>

          <p className="text-gray-300 text-sm mb-6 font-roboto line-clamp-3">
            {collection.description || "Aucune description"}
          </p>

          {/* Creation Date */}
          <div className="flex items-center text-gray-400 text-sm mb-4">
            <Calendar className="w-4 h-4 mr-2" />
            <span>
              Créé{" "}
              {dayjs().diff(dayjs(collection.createdAt), "day") > 7
                ? dayjs(collection.createdAt).format("DD MMM YYYY")
                : dayjs(collection.createdAt).fromNow()}
            </span>
          </div>

          {/* Creator */}
          <div
            className="flex items-center mb-6 group cursor-pointer"
            onClick={() => onNavigate(collection.userId._id)}
          >
            <User className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-gray-400 text-sm">Créé par</span>
            <div className="flex items-center ml-2">
              <img
                src={collection.userId.avatar}
                alt={collection.userId.username}
                className="w-6 h-6 rounded-full object-cover mr-2 border border-white/20"
              />
              <span className="text-arcanaBlue text-sm group-hover:underline">
                {collection.userId.username}
              </span>
            </div>
          </div>

          {/* Tags Section */}
          <div className="flex flex-wrap gap-2 mb-4">
            {collection.tags && collection.tags.length > 0 ? (
              collection.tags.map((tag, index) => (
                <div
                  key={index}
                  onClick={() => handleTagClick(tag)}
                  className="bg-gray-800 text-gray-400 rounded px-3 py-1 text-xs inline-flex items-center cursor-pointer hover:text-white transition-colors duration-200"
                >
                  <Tag className="mr-1.5 w-[12px] h-[12px]" />
                  <p>{tag}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-xs">Aucun tag</p>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 my-4"></div>

          {/* Likes Section */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-300 text-sm">J'aime</span>
              <span className="text-white font-bold text-lg">{likes}</span>
            </div>

            {/* Like Button */}
            <button
              className={`w-full p-3 flex items-center justify-center space-x-2 rounded-lg transition-all duration-300 ${
                isLiked
                  ? "bg-arcanaBlue/20 border border-arcanaBlue/50 text-white"
                  : "bg-white/5 hover:bg-white/10 border border-white/10"
              }`}
              onClick={onLike}
            >
              <Heart
                className={`w-5 h-5 transition-transform duration-300 ${
                  isLiked ? "fill-arcanaBlue text-arcanaBlue" : "text-white"
                }`}
              />
              <span className="text-white text-sm font-medium">
                {isLiked ? "Collection aimée" : "Aimer cette collection"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
