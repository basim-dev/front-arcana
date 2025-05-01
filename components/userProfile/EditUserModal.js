import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { X, Upload } from "lucide-react";
import axios from "axios";

const EditUserModal = ({ isOpen, onClose, userInfo, onUpdate }) => {
  const modalRef = useRef(null);
  const userId = useSelector((state) => state.user.value.userId);

  const [formData, setFormData] = useState({
    username: userInfo?.username || "",
    email: userInfo?.email || "",
    firstName: userInfo?.firstName || "",
    lastName: userInfo?.lastName || "",
    bio: userInfo?.bio || "",
    avatar: userInfo?.avatar || "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(userInfo?.avatar || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const maxFileNameLength = 20;

    if (file) {
      if (file.name.length > maxFileNameLength) {
        setErrorMessage(
          `Le nom de l'image ne doit pas dépasser ${maxFileNameLength} caractères.`
        );
        setAvatarFile(null);
        setAvatarPreview(null);
      } else {
        setErrorMessage("");
        setAvatarFile(file);
        const previewUrl = URL.createObjectURL(file);
        setAvatarPreview(previewUrl);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let avatarUrl = userInfo?.avatar || ""; // Si aucun fichier n'est sélectionné, garder l'ancienne URL

      // Étape 1 : Upload vers Cloudinary si un nouveau fichier est sélectionné
      if (avatarFile) {
        const formDataImage = new FormData();
        formDataImage.append("file", avatarFile);
        formDataImage.append("upload_preset", "arcana_unsigned");
        formDataImage.append("cloud_name", "dkj6slmwt");
        formDataImage.append("folder", "avatars");

        const cloudinaryRes = await fetch(
          "https://api.cloudinary.com/v1_1/dkj6slmwt/image/upload",
          {
            method: "POST",
            body: formDataImage,
          }
        );

        const cloudinaryData = await cloudinaryRes.json();

        if (cloudinaryData.secure_url) {
          avatarUrl = cloudinaryData.secure_url; // Met à jour avatarUrl si le fichier est téléchargé avec succès
        } else {
          console.error("Erreur Cloudinary : Pas d'URL sécurisée retournée");
          return; // Ne continue pas si l'upload échoue
        }
      }

      // Étape 2 : Envoyer l'objet JSON à ton backend pour mettre à jour les informations de l'utilisateur
      const response = await axios.put(
        `https://back-arcana.vercel.app/users/${userId}`,
        {
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          bio: formData.bio,
          avatar: avatarUrl, // Envoie l'URL de l'avatar (nouvelle ou ancienne)
        }
      );

      if (response.data.result) {
        if (avatarPreview && avatarPreview.startsWith("blob:")) {
          URL.revokeObjectURL(avatarPreview); // Libère la mémoire si un aperçu était généré
        }
        onUpdate(response.data.user); // Met à jour l'utilisateur côté frontend
        onClose(); // Ferme la modal ou réinitialise l'état
      } else {
        console.error(
          "Erreur lors de la mise à jour des informations:",
          response.data.error
        );
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des informations : ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative w-full max-w-md max-h-[90vh] bg-arcanaBackgroundDarker backdrop-blur-sm border border-white/10 rounded-xl text-white shadow-2xl transform transition-all duration-300 flex flex-col"
      >
        {/* Header */}
        <div className="relative p-8">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-arcanaBlue transition-colors duration-200"
            aria-label="Fermer"
          >
            <X size={24} />
          </button>
          <div className="text-center mt-4">
            <h2 className="text-xl font-semibold text-white">
              Modifier mes informations
            </h2>
          </div>
        </div>

        {/* Scrollable Form */}
        <div className="overflow-y-auto px-8 pb-6 space-y-6 flex-1">
          <form
            id="edit-user-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-gray-200"
              >
                Nom d'utilisateur
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-white placeholder-gray-400 focus:border-arcanaBlue focus:outline-none transition-colors duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-200"
              >
                Adresse e-mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-white placeholder-gray-400 focus:border-arcanaBlue focus:outline-none transition-colors duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-medium text-gray-200"
              >
                Prénom
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-white placeholder-gray-400 focus:border-arcanaBlue focus:outline-none transition-colors duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-sm font-medium text-gray-200"
              >
                Nom
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-white placeholder-gray-400 focus:border-arcanaBlue focus:outline-none transition-colors duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="bio"
                className="mb-2 block text-sm font-medium text-gray-200"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-white placeholder-gray-400 focus:border-arcanaBlue focus:outline-none transition-colors duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="avatar"
                className="mb-2 block text-sm font-medium text-gray-200"
              >
                Avatar
              </label>
              <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-white/10 border-dashed rounded-lg hover:border-arcanaBlue/50 transition-colors duration-200">
                <div className="space-y-2 text-center">
                  {!avatarPreview ? (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-400">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-medium text-arcanaBlue hover:text-arcanaBlue/80"
                        >
                          <span>Télécharger une image</span>
                          <input
                            id="file-upload"
                            name="avatar"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">ou glisser-déposer</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF jusqu'à 10MB
                      </p>
                      {errorMessage && (
                        <p className="text-red-500 text-xs">{errorMessage}</p>
                      )}
                    </>
                  ) : (
                    <div className="relative">
                      <img
                        src={avatarPreview}
                        alt="Aperçu de l'avatar"
                        className="h-40 w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarPreview(null);
                          setAvatarFile(null);
                        }}
                        className="absolute top-2 right-2 bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors duration-200"
                      >
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer fixe */}
        <div className="border-t border-white/10 px-8 py-4 bg-arcanaBackgroundDarker sticky bottom-0">
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-400 px-4 py-2 text-white hover:bg-gray-400 transition-colors duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="edit-user-form"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-arcanaBlue py-3 font-medium text-arcanaBackgroundDarker hover:bg-arcanaBlue/90 focus:outline-none transition-all duration-300 flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-arcanaBackgroundDarker border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <span>Sauvegarder</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
