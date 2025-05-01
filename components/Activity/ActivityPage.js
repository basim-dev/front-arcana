import { useEffect, useState } from "react";
import axios from "axios";
import GrainOverlay from "../GrainOverlay";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Heart,
  MessageCircle,
  FolderPlus,
  Earth,
  CornerDownRight,
} from "lucide-react";

dayjs.extend(relativeTime);

export default function Activity() {
  const [activityFeed, setActivityFeed] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchActivity();
  }, [filterType, router.asPath]);

  const fetchActivity = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return setIsLoading(false);

      const query = filterType !== "all" ? `?type=${filterType}` : "";
      const res = await axios.get(
        `https://back-arcana.vercel.app/activity/feed/${token}${query}`
      );

      if (res.data.result) {
        const formatted = res.data.activities.map((a) => {
          const user = a.userId || {
            username: "Inconnu",
            _id: "inconnu",
            avatar: a.avatar || "/assets/default-avatar.png",
          };

          return {
            ...a,
            userId: {
              ...user,
              avatar:
                !user.avatar || user.avatar.includes("default-avatar.png")
                  ? "/assets/default-avatar.png"
                  : user.avatar,
            },
            relativeTime: dayjs(a.createdAt).fromNow(),
          };
        });
        setActivityFeed(formatted);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération du fil d'activité:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToUser = (id) => {
    router.push(`/userProfile/${id}`);
  };

  const handleNavigateToCollection = (id) => {
    router.push(`/collections/${id}`);
  };

  const groupByDate = (activities) => {
    const groups = {};
    const today = dayjs();
    const yesterday = today.subtract(1, "day");

    activities.forEach((a) => {
      const created = dayjs(a.createdAt);
      const label = created.isSame(today, "day")
        ? "Aujourd'hui"
        : created.isSame(yesterday, "day")
        ? "Hier"
        : created.format("MMMM D, YYYY");
      groups[label] = groups[label] || [];
      groups[label].push(a);
    });

    return groups;
  };

  const grouped = groupByDate(activityFeed);
  const sortedGroups = Object.keys(grouped).sort((a, b) =>
    a === "Aujourd'hui"
      ? -1
      : b === "Aujourd'hui"
      ? 1
      : new Date(b) - new Date(a)
  );

  return (
    <>
      <GrainOverlay />
      <div className="flex flex-col min-h-screen bg-gradient-to-t from-arcanaBackgroundDarker to-arcanaBackgroundLighter cursor-default">
        <div className="flex flex-1">
          <aside className="w-1/6 p-4"></aside>

          <main className="w-4/6 max-w-[1200px] mx-auto flex flex-col space-y-10 py-16 font-jakarta">
            <div className="w-full max-w-[1200px] mx-auto px-6 pb-6 text-center">
              <h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
                Voyez ce que vos amis font.
              </h1>
            </div>

            <ActivityFilter
              filterType={filterType}
              setFilterType={setFilterType}
            />

            {isLoading && (
              <div className="flex justify-center items-center py-16">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-t-transparent border-arcanaBlue rounded-full animate-spin mb-4"></div>
                  <p className="text-white font-medium">
                    Chargement des activités...
                  </p>
                </div>
              </div>
            )}

            {!isLoading && activityFeed.length === 0 && (
              <div className="text-center text-gray-400 py-16">
                Aucune activité pour l'instant.
              </div>
            )}

            {!isLoading &&
              sortedGroups.map((label) => (
                <div key={label}>
                  <h2 className="text-lg font-semibold text-white mb-4">
                    {label}
                  </h2>
                  <div className="space-y-4">
                    {grouped[label].map((a) => (
                      <div
                        key={a._id}
                        className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-blue-500/30 rounded-xl p-4 transition-all duration-300 shadow-lg hover:shadow-blue-500/10"
                      >
                        <div className="flex gap-4 items-start">
                          <img
                            src={a.userId?.avatar}
                            alt={a.userId?.username}
                            onClick={() => handleNavigateToUser(a.userId?._id)}
                            className="w-10 h-10 rounded-full cursor-pointer hover:ring-2 ring-arcanaBlue transition"
                          />
                          <div className="flex-1 text-gray-300">
                            <div className="flex items-center gap-2 text-white font-medium">
                              <span
                                className="cursor-pointer hover:text-arcanaBlue"
                                onClick={() =>
                                  handleNavigateToUser(a.userId?._id)
                                }
                              >
                                {a.userId?.username}
                              </span>
                              {a.type === "like" && (
                                <Heart className="w-4 h-4 text-arcanaBlue" />
                              )}
                              {a.type === "comment" && (
                                <MessageCircle className="w-4 h-4 text-blue-400" />
                              )}
                              {a.type === "reply" && (
                                <CornerDownRight className="w-4 h-4 text-arcanaBlue" />
                              )}
                              {a.type === "create-collection" && (
                                <FolderPlus className="w-4 h-4 text-arcanaBlue" />
                              )}
                              <span className="text-sm text-gray-400">
                                {a.relativeTime}
                              </span>
                            </div>

                            {a.type === "like" && (
                              <p>
                                a aimé{" "}
                                <span
                                  className="text-white hover:text-arcanaBlue cursor-pointer"
                                  onClick={() =>
                                    handleNavigateToCollection(
                                      a.collectionId?._id
                                    )
                                  }
                                >
                                  {a.collectionId?.title}
                                </span>
                              </p>
                            )}

                            {a.type === "create-collection" && (
                              <p>
                                a créé{" "}
                                <span
                                  className="text-white hover:text-arcanaBlue cursor-pointer"
                                  onClick={() =>
                                    handleNavigateToCollection(
                                      a.collectionId?._id
                                    )
                                  }
                                >
                                  {a.collectionId?.title}
                                </span>
                              </p>
                            )}

                            {a.type === "comment" && (
                              <>
                                <p>
                                  a commenté sur{" "}
                                  <span
                                    className="text-white hover:text-arcanaBlue cursor-pointer"
                                    onClick={() =>
                                      handleNavigateToCollection(
                                        a.collectionId?._id
                                      )
                                    }
                                  >
                                    {a.collectionId?.title}
                                  </span>
                                </p>
                                <div className="mt-2 p-3 bg-white/10 rounded-lg text-sm text-gray-300">
                                  "{a.comment}"
                                </div>
                              </>
                            )}

                            {a.type === "reply" && (
                              <>
                                <p>
                                  a répondu à{" "}
                                  <span
                                    className="text-white hover:text-arcanaBlue cursor-pointer"
                                    onClick={() =>
                                      handleNavigateToCollection(
                                        a.collectionId?._id
                                      )
                                    }
                                  >
                                    {a.collectionId?.title}
                                  </span>
                                </p>
                                <div className="mt-2 p-3 bg-white/10 rounded-lg text-sm text-gray-300">
                                  "{a.comment}"{" "}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </main>

          <aside className="w-1/6 p-4"></aside>
        </div>
      </div>
    </>
  );
}

function ActivityFilter({ filterType, setFilterType }) {
  const filters = [
    { type: "all", label: "Toute Activité", icon: Earth },
    { type: "create-collection", label: "Collections", icon: FolderPlus },
    { type: "comment", label: "Commentaires", icon: MessageCircle },
    { type: "reply", label: "Réponses", icon: CornerDownRight },
    { type: "like", label: "J'aime", icon: Heart },
  ];

  return (
    <div className="flex flex-wrap gap-4">
      {filters.map(({ type, label, icon: Icon }) => (
        <button
          key={type}
          onClick={() => {
            setFilterType(type);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            filterType === type
              ? "bg-arcanaBlue text-arcanaBackgroundDarker"
              : "bg-arcanaBackgroundDarker text-gray-300 hover:bg-zinc-800"
          }`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
