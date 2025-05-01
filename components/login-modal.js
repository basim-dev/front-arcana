import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { login as loginAction } from "../reducers/user";
import { toast } from "react-toastify";

export function LoginModal({ isOpen, onClose, openSignupModal }) {
  const modalRef = useRef(null);
  const [formData, setFormData] = useState({
    identification: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
    // Clear error when user starts typing again
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await axios.post(
        "https://back-arcana.vercel.app/users/signin",
        formData
      );

      if (response.data.result) {
        localStorage.setItem("token", response.data.token);
        dispatch(loginAction(response.data));
        toast.success("Connexion réussie !");
        onClose();
      } else {
        setError(response.data.error || "Identifiants incorrects");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
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
          <h2 className="mb-2 text-xl font-semibold text-white">
            Connectez-vous à{" "}
            <span className="inline-flex items-center">
              <a>
                <img
                  src="/assets/logo-simple.png"
                  alt="logo Arcana"
                  className="h-6 md:h-6 mr-2"
                />
              </a>
            </span>
          </h2>
          <p className="text-gray-300 text-sm">
            Accédez à votre bibliothèque personnalisée
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            <p className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="identification"
              className="mb-2 block text-sm font-medium text-gray-200"
            >
              Nom d'utilisateur ou Email
            </label>
            <input
              type="text"
              id="identification"
              value={formData.identification}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-white placeholder-gray-400 focus:border-arcanaBlue focus:outline-none transition-colors duration-200"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-200"
            >
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-white placeholder-gray-400 focus:border-arcanaBlue focus:outline-none transition-colors duration-200"
            />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                className="text-xs text-arcanaBlue hover:text-arcanaBlue/80 transition-colors duration-200"
              >
                Mot de passe oublié ?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-arcanaBlue py-3 font-medium text-arcanaBackgroundDarker hover:bg-arcanaBlue/90 focus:outline-none transition-all duration-300 flex items-center justify-center"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-arcanaBackgroundDarker border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <svg
                className="w-5 h-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            )}
            Se connecter
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-gray-300 mb-3">Pas de compte ?</p>
          <button
            onClick={openSignupModal}
            className="w-full py-2.5 rounded-lg border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors duration-300 flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            Créer un compte
          </button>
        </div>
      </div>
    </div>
  );
}
