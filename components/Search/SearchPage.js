import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import GrainOverlay from "../GrainOverlay";
import SearchResults from "./SearchResults";
import PopularTags from "./PopularTags";
import { Search as SearchIcon } from "lucide-react";

export default function Search() {
  const router = useRouter();
  const { q } = router.query;
  const [collections, setCollections] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) return;

    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `https://back-arcana.vercel.app/search?q=${q}`
        );
        if (res.data.result) {
          setCollections(res.data.collections || []);
          setUsers(res.data.users || []);
        }
      } catch (err) {
        console.error("Erreur de recherche:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [q]);

  return (
    <>
      <GrainOverlay />
      <div className="flex flex-col min-h-screen bg-gradient-to-t from-arcanaBackgroundDarker to-arcanaBackgroundLighter cursor-default">
        <div className="flex flex-1">
          <aside className="hidden md:block w-1/6 p-4"></aside>

          <main className="w-full md:w-4/6 max-w-[1200px] mx-auto flex flex-col space-y-10 py-8 md:py-16 px-4 md:px-0 font-jakarta">
            {/* Header */}
            <div className="flex items-center justify-center mb-8">
              <SearchIcon className="w-6 h-6 text-arcanaBlue mr-3" />
              <h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
                Résultats pour "{q}"
              </h1>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-16">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-t-transparent border-arcanaBlue rounded-full animate-spin mb-4"></div>
                  <p className="text-white font-medium">
                    Chargement des résultats...
                  </p>
                </div>
              </div>
            )}

            {/* Results with Tags */}
            {!loading && (
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-3/4">
                  <SearchResults users={users} collections={collections} />
                </div>

                <div className="w-full lg:w-1/4 flex flex-col gap-6">
                  <PopularTags />
                </div>
              </div>
            )}
          </main>

          <aside className="hidden md:block w-1/6 p-4"></aside>
        </div>
      </div>
    </>
  );
}
