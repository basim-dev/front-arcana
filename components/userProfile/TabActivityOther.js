import React, { useEffect, useState } from "react";
import { useRouter } from "next/router"; // Import useRouter
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Heart,
  MessageCircle,
  FolderPlus,
  Calendar,
  CornerDownRight,
} from "lucide-react";

dayjs.extend(relativeTime);

const TabActivityOther = ({ userId }) => {
  const [activities, setActivities] = useState([]);
  const router = useRouter(); // Initialize useRouter

  // Avatar logic
  const getAvatarUrl = (user) => {
    if (!user || !user.avatar) {
      return "/assets/default-avatar.png";
    }
    return user.avatar.includes("default-avatar.png")
      ? "/assets/default-avatar.png"
      : user.avatar;
  };

  useEffect(() => {
    const fetchActivities = async () => {
      if (userId) {
        try {
          const activitiesResponse = await fetch(
            `https://back-arcana.vercel.app/activity/user/${userId}`
          );
          const activitiesData = await activitiesResponse.json();

          if (activitiesData.result) {
            const activitiesWithAvatars = activitiesData.activities.map(
              (activity) => {
                if (activity.userId) {
                  activity.userId.avatar = getAvatarUrl(activity.userId);
                }
                return activity;
              }
            );

            setActivities(activitiesWithAvatars);
          } else {
            console.error("Activity not found");
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données :", error);
        }
      }
    };

    fetchActivities();
  }, [userId]);

  const handleNavigateToCollection = (id) => {
    router.push(`/collections/${id}`);
  };

  const groupByDate = (activities) => {
    const groups = {};
    const today = dayjs();
    const yesterday = dayjs().subtract(1, "day");

    activities.forEach((activity) => {
      const created = dayjs(activity.createdAt);
      let label = created.format("MMMM D, YYYY");

      if (created.isSame(today, "day")) {
        label = "Today";
      } else if (created.isSame(yesterday, "day")) {
        label = "Yesterday";
      }

      if (!groups[label]) groups[label] = [];
      groups[label].push({
        ...activity,
        relativeTime: created.fromNow(),
      });
    });

    return groups;
  };

  const grouped = groupByDate(activities);
  const groupedKeys = Object.keys(grouped).sort((a, b) => {
    if (a === "Today") return -1;
    if (b === "Today") return 1;
    if (a === "Yesterday") return -1;
    if (b === "Yesterday") return 1;
    return new Date(b) - new Date(a);
  });

  return (
    <div className="bg-arcanaBackgroundDarker rounded-xl px-12 py-8 drop-shadow-xl w-[90%]">
      <div className="overflow-x-auto whitespace-nowrap space-y-8">
        {activities.length === 0 ? (
          <p className="text-gray-100">Pas encore d&apos;activité.</p>
        ) : (
          groupedKeys.map((label) => (
            <div key={label} className="mb-10">
              <div className="flex items-center mb-5">
                <div className="h-px flex-1 bg-white/10"></div>
                <h2 className="text-lg font-semibold text-white px-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                  {label}
                </h2>
                <div className="h-px flex-1 bg-white/10"></div>
              </div>
              <ul className="space-y-4">
                {grouped[label].map((activity) => (
                  <li
                    key={activity._id}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-blue-500/30 rounded-xl p-4 transition-all duration-300 shadow-lg hover:shadow-blue-500/10"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={activity.userId.avatar}
                          className="w-full h-full object-cover"
                          alt={`${activity.userId.username}'s avatar`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-white">
                            {activity.userId.username}
                          </span>

                          {/* Activity type icon */}
                          {activity.type === "like" && (
                            <Heart className="w-4 h-4 text-blue-500" />
                          )}
                          {activity.type === "comment" && (
                            <MessageCircle className="w-4 h-4 text-blue-400" />
                          )}
                          {activity.type === "create-collection" && (
                            <FolderPlus className="w-4 h-4 text-purple-400" />
                          )}
                          {activity.type === "reply" && (
                            <CornerDownRight className="w-4 h-4 text-blue-400" />
                          )}

                          <span className="text-gray-400 text-sm">
                            {activity.relativeTime}
                          </span>
                        </div>

                        {/* Activity details */}
                        <div className="text-gray-300">
                          {activity.type === "like" && (
                            <p>
                              a aimé la collection{" "}
                              <span
                                className="font-medium text-white cursor-pointer"
                                onClick={() =>
                                  handleNavigateToCollection(
                                    activity.collectionId?._id
                                  )
                                }
                              >
                                "{activity.collectionId?.title}"
                              </span>
                            </p>
                          )}

                          {activity.type === "create-collection" && (
                            <p>
                              a créé une nouvelle collection{" "}
                              <span
                                className="font-medium text-white cursor-pointer"
                                onClick={() =>
                                  handleNavigateToCollection(
                                    activity.collectionId?._id
                                  )
                                }
                              >
                                "{activity.collectionId?.title}"
                              </span>
                            </p>
                          )}

                          {activity.type === "comment" && (
                            <div>
                              <p>
                                a commenté sur{" "}
                                <span
                                  className="font-medium text-white cursor-pointer"
                                  onClick={() =>
                                    handleNavigateToCollection(
                                      activity.collectionId?._id
                                    )
                                  }
                                >
                                  "{activity.collectionId?.title}"
                                </span>
                              </p>
                              <div className="mt-2 p-3 bg-white/5 rounded-lg text-gray-300">
                                "{activity.comment}"
                              </div>
                            </div>
                          )}

                          {activity.type === "reply" && (
                            <div>
                              <p>
                                a répondu à{" "}
                                <span
                                  className="font-medium text-white cursor-pointer"
                                  onClick={() =>
                                    handleNavigateToCollection(
                                      activity.collectionId?._id
                                    )
                                  }
                                >
                                  "{activity.collectionId?.title}"
                                </span>
                              </p>
                              <div className="mt-2 p-3 bg-white/5 rounded-lg text-gray-300">
                                "{activity.comment}"{" "}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TabActivityOther;
