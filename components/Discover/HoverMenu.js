import { Heart, MessageCircle, User } from "lucide-react";

export default function HoverMenu({
  collection,
  isLiked,
  onLikeToggle,
  onUserClick,
  onCommentClick,
}) {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-4/5 backdrop-blur-sm border border-white/10 text-white px-4 py-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-between shadow-lg">
      <button
        onClick={onLikeToggle}
        className="relative flex items-center justify-center h-9 w-9 rounded-full hover:bg-white/10 transition-all duration-200 group/btn"
        aria-label={isLiked ? "Unlike" : "Like"}
      >
        {isLiked ? (
          <Heart className="w-5 h-5 fill-arcanaBlue text-arcanaBlue group-hover/btn:scale-110 transition-transform duration-200" />
        ) : (
          <Heart className="w-5 h-5 text-gray-300 group-hover/btn:text-arcanaBlue group-hover/btn:scale-110 transition-all duration-200" />
        )}
      </button>

      <button
        onClick={onCommentClick}
        className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-white/10 transition-all duration-200 group/btn"
        aria-label="Comment"
      >
        <MessageCircle className="w-5 h-5 text-gray-300 group-hover/btn:text-arcanaBlue group-hover/btn:scale-110 transition-all duration-200" />
      </button>

      <button
        onClick={onUserClick}
        className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-white/10 transition-all duration-200 group/btn"
        aria-label="View user profile"
      >
        <User className="w-5 h-5 text-gray-300 group-hover/btn:text-arcanaBlue group-hover/btn:scale-110 transition-all duration-200" />
      </button>
    </div>
  );
}
