import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Library,
  PlusCircle,
  LayoutGrid,
  Users,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { LoginModal } from "./login-modal";
import { SignupModal } from "./signup-modal";
import GrainOverlay from "./GrainOverlay";

const Home = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsSignupModalOpen(false);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const openSignupModal = () => {
    setIsSignupModalOpen(true);
    setIsLoginModalOpen(false);
  };

  const closeSignupModal = () => {
    setIsSignupModalOpen(false);
  };

  return (
    <>
      <GrainOverlay />
      <div className="min-h-screen flex flex-col bg-gradient-to-t from-arcanaBackgroundDarker to-arcanaBackgroundLighter cursor-default font-jakarta">
        {/* Hero Section */}
        <section className="py-16 md:py-24 relative px-4 md:px-0">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
            <div className="z-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
                Organisez, partagez et découvrez vos passions avec Arcana
              </h1>
              <p className="text-gray-300 mb-8 text-lg">
                Créez des listes personnalisées, suivez vos séries, films,
                livres et bien plus, tout en restant connecté à votre
                communauté.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/start">
                  <span className="bg-arcanaBlue text-arcanaBackgroundDarker px-6 py-3 rounded-xl text-base font-medium shadow-lg transition-all duration-300 inline-block hover:opacity-90">
                    Commencez dès maintenant
                  </span>
                </Link>
                <Link href="/features">
                  <span className="bg-white/10 backdrop-blur-sm border border-white/10 hover:border-arcanaBlue/50 text-white px-6 py-3 rounded-xl text-base font-medium shadow-lg hover:shadow-arcanaBlue/10 transition-all duration-300 inline-block">
                    Explorez les fonctionnalités
                  </span>
                </Link>
              </div>
            </div>
            <div className="relative h-[300px] md:h-auto">
              <div className="absolute -inset-4 bg-arcanaBlue/20 blur-xl rounded-2xl"></div>
              <div className="w-full h-[400px] bg-arcanaBackgroundDarker p-6 backdrop-blur-sm rounded-xl border border-white/10 hover:border-arcanaBlue/50 transition-all duration-300 shadow-lg hover:shadow-arcanaBlue/10 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <img src="/assets/heroImage.png" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-arcanaBackgroundDarker/50 backdrop-blur-sm border-y border-white/10">
          <div className="max-w-6xl mx-auto px-4 md:px-0 text-center mb-12">
            <Link href="/library">
              <span className="text-arcanaBlue hover:text-arcanaBlue/80 text-sm transition-colors duration-300">
                Découvrez vos nouvelles possibilités
              </span>
            </Link>
            <h2 className="text-3xl font-bold mt-4 mb-8 text-white tracking-tight">
              Créez vos listes personnalisées facilement
            </h2>
            <p className="max-w-2xl mx-auto text-gray-300">
              Arcana vous permet une gestion de liste combinant simplicité et
              créativité. Accédez à une vaste bibliothèque de modèles,
              personnalisez selon vos besoins, et restez organisé efficacement.
            </p>
          </div>

          <div className="max-w-6xl mx-auto px-4 md:px-0 grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-arcanaBackgroundDarker p-6 backdrop-blur-sm rounded-xl border border-white/10 hover:border-arcanaBlue/50 transition-all duration-300 shadow-lg hover:shadow-arcanaBlue/10">
              <h3 className="text-xl font-bold mb-6 text-white flex items-center">
                <LayoutGrid className="w-6 h-6 text-arcanaBlue mr-3" />
                Créez vos listes selon vos envies
              </h3>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 text-arcanaBlue">
                    <div className="w-6 h-6 border border-arcanaBlue rounded-full flex items-center justify-center">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1 text-white">
                      Création sur mesure :
                    </h4>
                    <p className="text-gray-300 text-sm">
                      Créez des listes totalement personnalisées, adaptées à vos
                      goûts. Ajoutez des titres, des descriptions, des tags et
                      assurez-vous que chaque liste correspond parfaitement à
                      vos attentes.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 text-arcanaBlue">
                    <div className="w-6 h-6 border border-arcanaBlue rounded-full flex items-center justify-center">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1 text-white">
                      Templates prêts à l'emploi :
                    </h4>
                    <p className="text-gray-300 text-sm">
                      Pour chaque élément ajouté à vos listes, vous aurez la
                      possibilité d'utiliser des templates pré-définis. Gagnez
                      du temps et commencez à organiser votre contenu
                      immédiatement.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 text-arcanaBlue">
                    <div className="w-6 h-6 border border-arcanaBlue rounded-full flex items-center justify-center">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1 text-white">
                      Ajout rapide :
                    </h4>
                    <p className="text-gray-300 text-sm">
                      Ajoutez facilement de nouveaux contenus à vos listes, que
                      ce soit manuellement ou grâce à des suggestions
                      automatiques.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-arcanaBackgroundDarker p-6 backdrop-blur-sm rounded-xl border border-white/10 hover:border-arcanaBlue/50 transition-all duration-300 shadow-lg hover:shadow-arcanaBlue/10">
              <h3 className="text-xl font-bold mb-6 text-white flex items-center">
                <Sparkles className="w-6 h-6 text-arcanaBlue mr-3" />
                Restez organisé et suivez vos progrès
              </h3>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 text-arcanaBlue">
                    <div className="w-6 h-6 border border-arcanaBlue rounded-full flex items-center justify-center">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1 text-white">
                      Suivi de progression :
                    </h4>
                    <p className="text-gray-300 text-sm">
                      Marquez vos contenus comme terminés pour ne rien oublier.
                      Visualisez vos progrès avec des indicateurs clairs et
                      suivez vos objectifs de manière intuitive.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 text-arcanaBlue">
                    <div className="w-6 h-6 border border-arcanaBlue rounded-full flex items-center justify-center">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1 text-white">
                      Gestion avancée des listes :
                    </h4>
                    <p className="text-gray-300 text-sm">
                      Organisez vos contenus par catégories (par exemple, "À
                      voir", "En cours", "Terminé") et ajustez vos listes à tout
                      moment selon vos préférences.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 text-arcanaBlue">
                    <div className="w-6 h-6 border border-arcanaBlue rounded-full flex items-center justify-center">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1 text-white">
                      Filtres et catégories :
                    </h4>
                    <p className="text-gray-300 text-sm">
                      Affichez vos listes en fonction de critères spécifiques
                      (genre, année, notes, etc.) et retrouvez rapidement ce que
                      vous cherchez.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link href="/library">
              <span className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition bg-arcanaBlue text-arcanaBackgroundDarker hover:opacity-90 mx-auto inline-flex">
                <PlusCircle className="w-4 h-4" />
                Créer ma première collection
              </span>
            </Link>
          </div>
        </section>

        {/* Community Section */}
        <section className="py-16 md:py-24 px-4 md:px-0">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center mb-6">
                <Users className="w-8 h-8 text-arcanaBlue mr-3" />
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Rejoignez une communauté passionnée
                </h2>
              </div>

              <div className="space-y-6 mt-8 bg-arcanaBackgroundDarker p-6 backdrop-blur-sm rounded-xl border border-white/10 hover:border-arcanaBlue/50 transition-all duration-300 shadow-lg hover:shadow-arcanaBlue/10">
                <div>
                  <h4 className="font-medium mb-1 text-arcanaBlue">
                    Explorez des listes populaires :
                  </h4>
                  <p className="text-gray-300">
                    Découvrez ce que les autres ont créé et voyez ce qui est
                    tendance dans vos catégories préférées.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1 text-arcanaBlue">
                    Likez et sauvegardez :
                  </h4>
                  <p className="text-gray-300">
                    Aimez les listes qui vous inspirent et enregistrez-les pour
                    plus tard.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1 text-arcanaBlue">
                    Restez connecté avec ceux qui partagent vos passions :
                  </h4>
                  <p className="text-gray-300">
                    Partagez vos propres listes avec vos amis, et échangez des
                    recommandations en toute simplicité.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <Link href="/community">
                    <span className="bg-arcanaBlue text-arcanaBackgroundDarker px-6 py-3 rounded-xl text-base font-medium shadow-lg transition-all duration-300 inline-flex items-center gap-2 hover:opacity-90">
                      Rejoindre la communauté
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        →
                      </span>
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-arcanaBlue/20 blur-xl rounded-2xl"></div>
              <div className="w-full h-[400px] bg-arcanaBackgroundDarker p-6 backdrop-blur-sm border border-white/10 hover:border-arcanaBlue/50 relative overflow-hidden rounded-xl shadow-lg hover:shadow-arcanaBlue/10 transition-all duration-300">
                <div className="grid grid-cols-2 grid-rows-2 gap-2 p-2 h-full">
                  {[
                    "Activity.png",
                    "Discover.png",
                    "Library.png",
                    "PageCollection.png",
                  ].map((image, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-arcanaBackgroundDarker to-arcanaBackgroundLighter rounded-lg overflow-hidden relative"
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img
                          src={`/assets/${image}`}
                          alt={`Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-arcanaBackgroundDarker/50 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 md:px-0 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white tracking-tight">
              Prêt à commencer votre aventure avec Arcana ?
            </h2>
            <p className="max-w-2xl mx-auto text-gray-300 mb-8">
              Rejoignez des milliers d'utilisateurs qui organisent leurs
              passions et découvrent de nouvelles inspirations chaque jour.
            </p>
          </div>
        </section>
      </div>

      {/* Modals */}
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
};

export default Home;
