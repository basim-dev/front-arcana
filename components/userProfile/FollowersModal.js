import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/router";

const FollowersModal = ({ isOpen, onClose, followers }) => {
  const modalRef = React.useRef(null);
  const [followerDetails, setFollowerDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const getAvatarUrl = (user) => {
    if (!user || !user.avatar) {
      return "/assets/default-avatar.png";
    }
    return user.avatar.includes("default-avatar.png")
      ? "/assets/default-avatar.png"
      : user.avatar;
  };

  useEffect(() => {
    const fetchFollowerDetails = async () => {
      setIsLoading(true);
      if (followers && followers.length > 0) {
        try {
          const details = await Promise.all(
            followers.map(async (follower) => {
              const response = await fetch(
                `https://back-arcana.vercel.app/users/${follower.userId}`
              );
              const data = await response.json();
              if (data.result) {
                return {
                  ...data.user,
                  avatar: getAvatarUrl(data.user),
                };
              }
              return null;
            })
          );
          setFollowerDetails(details.filter(Boolean));
        } catch (error) {
          console.error("Error fetching follower details:", error);
        }
      }
      setIsLoading(false);
    };

    if (isOpen && followers) {
      fetchFollowerDetails();
    }
  }, [isOpen, followers]);

  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  const handleNavigateToUserProfile = (userId) => {
    if (!userId) return;
    onClose();
    router.push(`/userProfile/${userId}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-arcanaBackgroundDarker backdrop-blur-sm border border-white/10 rounded-xl p-8 text-white shadow-2xl transform transition-all duration-300"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-arcanaBlue transition-colors duration-200"
          aria-label="Fermer"
        >
          <X size={24} />
        </button>

        <div className="mb-8 text-center">
          <h2 className="mb-2 text-xl font-semibold text-white">Followers</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-t-transparent border-arcanaBlue rounded-full animate-spin"></div>
          </div>
        ) : (
          <ul className="space-y-4 max-h-80 overflow-y-auto">
            {followerDetails.length > 0 ? (
              followerDetails.map((user) => (
                <li
                  key={user._id}
                  className="flex items-center space-x-4 p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  onClick={() => handleNavigateToUserProfile(user._id)}
                >
                  <img
                    src={user?.avatar || "/assets/default-avatar.png"}
                    alt={`${user.username} avatar`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="text-white font-medium">
                    {user.username}
                  </span>
                </li>
              ))
            ) : (
              <p className="text-center text-gray-400">Aucun follower trouvé</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FollowersModal;
