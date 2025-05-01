import { useState } from "react";
import HoverMenu from "./HoverMenu";

export default function CollectionCard({
  collection,
  isLiked,
  onClick,
  onLikeToggle,
  onUserClick,
  onCommentClick,
}) {
  const [square, setSquare] = useState(false);

  const handleLoad = (e) => {
    const { naturalWidth: w, naturalHeight: h } = e.target;
    if (!w || !h) return;

    const ratio = w / h;
    const isSquare = Math.abs(ratio - 1) < 0.15;
    setSquare(isSquare);
  };

  return (
    <div className="w-full">
      <div
        className="relative w-full aspect-[2/3] flex items-center justify-center group cursor-pointer transition-transform duration-200 hover:scale-105"
        onClick={onClick}
      >
        <img
          src={collection.collection.cover}
          alt={collection.collection.title}
          onLoad={handleLoad}
          className={`w-full h-full rounded-lg ${
            square ? "object-contain" : "object-cover"
          }`}
        />

        <HoverMenu
          collection={collection}
          isLiked={isLiked}
          onLikeToggle={(e) => {
            e.stopPropagation();
            onLikeToggle(e);
          }}
          onUserClick={(e) => {
            e.stopPropagation();
            onUserClick?.();
          }}
          onCommentClick={(e) => {
            e.stopPropagation();
            onCommentClick?.(collection);
          }}
        />
      </div>

      <div className="mt-3">
        <p
          className="font-bold text-white text-sm truncate hover:text-arcanaBlue transition-colors"
          onClick={onClick}
        >
          {collection.collection.title}
        </p>
        <p
          className="text-gray-400 text-xs mt-1 truncate hover:text-gray-300 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onUserClick?.();
          }}
        >
          {collection.creator.username}
        </p>
      </div>
    </div>
  );
}
