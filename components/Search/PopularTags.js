import { useRouter } from "next/router";
import { Tag } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function PopularTags() {
  const router = useRouter();
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularTags = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://back-arcana.vercel.app/search/popular-tags"
        );
        if (response.data.result) {
          setPopularTags(response.data.popularTags);
        }
      } catch (error) {
        console.error("Error fetching popular tags:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularTags();
  }, []);

  const handleTagClick = (tag) => {
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  };

  if (popularTags.length === 0 && !loading) {
    return null;
  }

  return (
    <div className="bg-arcanaBackgroundDarker p-6 backdrop-blur-sm rounded-xl border border-white/10">
      <h2 className="mb-4 font-jakarta text-xl font-semibold text-white flex items-center">
        <Tag className="w-5 h-5 text-arcanaBlue mr-2" />
        Tags populaires
      </h2>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-t-transparent border-arcanaBlue rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <div
              key={tag._id}
              onClick={() => handleTagClick(tag._id)}
              className="bg-gray-800 text-gray-400 rounded px-3 py-1 text-xs inline-flex items-center cursor-pointer hover:bg-gray-700 transition-colors duration-200"
            >
              <Tag className="mr-1.5 w-[12px] h-[12px]" />
              <span>{tag._id}</span>
              <span className="ml-1.5 bg-arcanaBlue/20 text-xs px-2 py-0.5 rounded-full">
                {tag.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
