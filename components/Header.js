import Link from "next/link";
import { useRouter } from "next/router";
import {
  Search,
  Menu,
  X,
  Library,
  Compass,
  Activity,
  LogOut,
  Home,
  MessageCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../reducers/user";
import { LoginModal } from "./login-modal";
import { SignupModal } from "./signup-modal";
import axios from "axios";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const router = useRouter();

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.value);
  const { pathname } = useRouter();

  const navigateTo = (path) => {
    router.push(path);
    setIsMenuOpen(false);
    setIsSearchVisible(false);
  };

  const navLinkClass = (path) =>
    `px-5 py-3 rounded-xl text-sm font-semibold transition-colors ${
      pathname === path
        ? "bg-arcanaBackgroundDarker text-arcanaBlue shadow-lg"
        : "text-white hover:bg-arcanaBackgroundLighter"
    }`;

  const mobileNavLinkClass = (path) =>
    `flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium transition-colors w-full ${
      pathname === path
        ? "bg-arcanaBackgroundDarker text-arcanaBlue"
        : "text-white hover:bg-arcanaBackgroundLighter"
    }`;

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e) => {
      if (
        !e.target.closest(".mobile-menu") &&
        !e.target.closest(".menu-button")
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const fetchData = async () => {
      if (user.userId) {
        try {
          const userResponse = await fetch(
            `https://back-arcana.vercel.app/users/${user.userId}`
          );
          const userData = await userResponse.json();
          if (userData.result) {
            const formattedUserData = userData.user;
            setUserInfo(formattedUserData);
          } else {
            console.error("User data fetch failed:", userData);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données :", error);
        }
      }
    };

    fetchData();
  }, [user.userId]);

  useEffect(() => {
    if (!user.userId) return;

    const checkUnreadMessages = async () => {
      try {
        const response = await fetch(
          `https://back-arcana.vercel.app/messages/${user.userId}/unread/total`
        );
        const { total } = await response.json();
        setUnreadMessagesCount(total);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des messages non lus:",
          error
        );
      }
    };

    checkUnreadMessages();
    const interval = setInterval(checkUnreadMessages, 10000);
    return () => clearInterval(interval);
  }, [user.userId]);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen((o) => !o);
    setIsSearchVisible(false);
  };

  const toggleSearch = () => {
    setIsSearchVisible((v) => !v);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
    setIsSearchVisible(false);
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsSignupModalOpen(false);
    setIsMenuOpen(false);
  };

  const closeLoginModal = () => setIsLoginModalOpen(false);

  const openSignupModal = () => {
    setIsSignupModalOpen(true);
    setIsLoginModalOpen(false);
    setIsMenuOpen(false);
  };

  const closeSignupModal = () => setIsSignupModalOpen(false);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      const { data } = await axios.post(
        "https://back-arcana.vercel.app/users/logout",
        {
          token,
        }
      );
      if (data.result) {
        localStorage.removeItem("token");
        dispatch(logout());
        setIsMenuOpen(false);
        navigateTo("/");
      } else {
        console.error("Erreur backend :", data.error);
      }
    } catch (err) {
      console.error("Erreur réseau :", err);
    }
  };

  const getAvatarUrl = () => {
    return userInfo?.avatar;
  };

  return (
    <>
      <header className="custom-header bg-arcanaBackgroundDarker text-white py-3 font-jakarta font-medium sticky top-0 z-40 shadow-md">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 flex-shrink-0">
              <Link href="/" passHref>
                <a>
                  <img
                    src="/assets/logo-simple.png"
                    alt="logo Arcana"
                    className="h-6 md:h-6 mr-2"
                  />
                </a>
              </Link>

              <div className="hidden md:block relative w-[200px]">
                <form onSubmit={handleSearch}>
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-arcanaBackgroundLighter rounded-xl py-1 px-4 w-full text-white text-sm focus:outline-none h-9"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-arcanaBlue transition-colors"
                  >
                    <Search size={16} />
                  </button>
                </form>
              </div>

              <div className="hidden md:flex items-center space-x-0 flex-grow justify-end pr-5">
                <Link href="/library" passHref>
                  <a className={navLinkClass("/library")}>Bibliothèque</a>
                </Link>
                <Link href="/discover" passHref>
                  <a className={navLinkClass("/discover")}>Découvrir</a>
                </Link>
                <Link href="/activity" passHref>
                  <a className={navLinkClass("/activity")}>Activité</a>
                </Link>
                <Link href="/message" passHref>
                  <a
                    className={navLinkClass("/message")}
                    style={{ position: "relative" }}
                  >
                    <MessageCircle size={20} />
                    {unreadMessagesCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                      </span>
                    )}
                  </a>
                </Link>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-2">
              {user.token ? (
                <>
                  <Link href={`/userProfile/${user.userId}`} passHref>
                    <a className="flex items-center justify-center w-10 h-10 bg-arcanaBackgroundLighter text-white rounded-full hover:bg-zinc-700 transition-colors">
                      <img
                        src={getAvatarUrl()}
                        alt={user.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </a>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-semibold px-5 py-3 rounded-xl hover:bg-arcanaBackgroundLighter transition-colors"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={openLoginModal}
                    className="text-sm font-semibold px-5 py-3 rounded-xl hover:bg-arcanaBackgroundLighter transition-colors"
                  >
                    Connexion
                  </button>
                  <button
                    onClick={openSignupModal}
                    className="text-sm font-semibold px-5 py-3 rounded-xl bg-arcanaBlue text-arcanaBackgroundDarker hover:opacity-90 transition-colors"
                  >
                    Inscription
                  </button>
                </>
              )}
            </div>

            <div className="flex md:hidden items-center space-x-4">
              {/* Badge pour mobile */}
              {user.token && unreadMessagesCount > 0 && (
                <Link href="/message" passHref>
                  <a className="relative">
                    <MessageCircle size={20} />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                    </span>
                  </a>
                </Link>
              )}
              <button
                onClick={toggleSearch}
                aria-label="Rechercher"
                className="text-white focus:outline-none p-2 hover:bg-arcanaBackgroundLighter rounded-lg transition-colors"
              >
                <Search size={20} />
              </button>
              <button
                className="menu-button text-white focus:outline-none p-2 hover:bg-arcanaBackgroundLighter rounded-lg transition-colors"
                onClick={toggleMenu}
                aria-label="Basculer le menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {isSearchVisible && (
            <div className="md:hidden pt-3 pb-2 animate-fadeIn">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="bg-arcanaBackgroundLighter rounded-xl py-2 px-4 w-full text-white text-sm focus:outline-none focus:ring-1 focus:ring-arcanaBlue"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-arcanaBlue transition-colors"
                >
                  <Search size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 md:hidden">
          <div
            className="mobile-menu fixed right-0 top-0 h-full w-4/5 max-w-xs bg-arcanaBackgroundDarker shadow-lg overflow-y-auto transition-transform duration-300 ease-in-out border-l border-white/10"
            style={{
              animation: "slideInRight 0.3s forwards",
            }}
          >
            <div className="p-5">
              {user.token ? (
                <div
                  className="flex items-center gap-3 border-b border-white/10 pb-5 mb-5"
                  onClick={() => navigateTo(`/userProfile/${user.userId}`)}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img
                      src={getAvatarUrl()}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{user.username}</h3>
                    <p className="text-sm text-gray-400">Mon Compte</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 border-b border-white/10 pb-5 mb-5">
                  <button
                    onClick={openLoginModal}
                    className="w-full text-sm font-semibold px-4 py-3 rounded-xl bg-arcanaBackgroundLighter text-white hover:bg-arcanaBackgroundLighter/70 transition-colors"
                  >
                    Connexion
                  </button>
                  <button
                    onClick={openSignupModal}
                    className="w-full text-sm font-semibold px-4 py-3 rounded-xl bg-arcanaBlue text-arcanaBackgroundDarker hover:opacity-90 transition-colors"
                  >
                    Inscription
                  </button>
                </div>
              )}

              <nav className="flex flex-col gap-2">
                <button
                  onClick={() => navigateTo("/")}
                  className={mobileNavLinkClass("/")}
                >
                  <Home
                    size={20}
                    className={
                      pathname === "/" ? "text-arcanaBlue" : "text-gray-400"
                    }
                  />
                  Accueil
                </button>
                <button
                  onClick={() => navigateTo("/library")}
                  className={mobileNavLinkClass("/library")}
                >
                  <Library
                    size={20}
                    className={
                      pathname === "/library"
                        ? "text-arcanaBlue"
                        : "text-gray-400"
                    }
                  />
                  Bibliothèque
                </button>
                <button
                  onClick={() => navigateTo("/discover")}
                  className={mobileNavLinkClass("/discover")}
                >
                  <Compass
                    size={20}
                    className={
                      pathname === "/discover"
                        ? "text-arcanaBlue"
                        : "text-gray-400"
                    }
                  />
                  Découvrir
                </button>
                <button
                  onClick={() => navigateTo("/activity")}
                  className={mobileNavLinkClass("/activity")}
                >
                  <Activity
                    size={20}
                    className={
                      pathname === "/activity"
                        ? "text-arcanaBlue"
                        : "text-gray-400"
                    }
                  />
                  Activité
                </button>
                {/* Option de menu pour les messages avec badge sur mobile */}
                <button
                  onClick={() => navigateTo("/message")}
                  className={mobileNavLinkClass("/message")}
                >
                  <div className="relative">
                    <MessageCircle
                      size={20}
                      className={
                        pathname === "/message"
                          ? "text-arcanaBlue"
                          : "text-gray-400"
                      }
                    />
                    {unreadMessagesCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                      </span>
                    )}
                  </div>
                  Messages
                  {unreadMessagesCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                      {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                    </span>
                  )}
                </button>
              </nav>

              {user.token && (
                <div className="mt-auto pt-5 border-t border-white/10 mt-5">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium transition-colors w-full text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut size={20} className="text-red-400" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s forwards;
        }
      `}</style>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        openSignupModal={openSignupModal}
      />

      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={closeSignupModal}
        openLoginModal={openLoginModal}
      />
    </>
  );
}

export default Header;
