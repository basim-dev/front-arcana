import CollectionCard from "./CollectionCard";

export default function SectionBlock({
  title,
  collections,
  likedIds,
  onClick,
  onUserClick,
  onLikeToggle,
  onCommentClick,
  showCount = 6,
  className = "",
  actionButton = null,
}) {
  return (
    <section
      className={`
        w-full
        bg-arcanaBackgroundDarker backdrop-blur-sm
        rounded-xl overflow-hidden shadow-lg hover:shadow-arcanaBlue/10
        transition-all duration-300
        px-10 py-8 font-jakarta cursor-default
        ${className}
      `}
    >
      <div className="w-full">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          {actionButton}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {collections.slice(0, showCount).map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              isLiked={likedIds.includes(collection.id)}
              onClick={() => onClick(collection.id)}
              onUserClick={() => onUserClick(collection.creator.id)}
              onLikeToggle={(e) => {
                e.stopPropagation();
                onLikeToggle(collection.id);
              }}
              onCommentClick={() => onCommentClick(collection)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
