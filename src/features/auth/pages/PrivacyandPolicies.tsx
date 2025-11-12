import { useEffect, useState } from "react";
import {
  getLegalPolicies,
  type Policy,
} from "../../../api/termscondition/policiesApi";
import bgImage from "../../../assets/commonbackground.png";

export default function LegalPolicies() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [activePolicy, setActivePolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const data = await getLegalPolicies();
        console.log("📜 API Response for policies:", data);

        // ✅ Ensure the data is an array before setting
        if (Array.isArray(data)) {
          setPolicies(data);
          setActivePolicy(data[0] || null);
        } else if (data?.results && Array.isArray(data.results)) {
          // Some APIs return { results: [...] }
          setPolicies(data.results);
          setActivePolicy(data.results[0] || null);
        } else {
          console.warn("⚠️ Unexpected API response structure:", data);
          setPolicies([]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch legal policies:", err);
        setPolicies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-500 text-lg">Loading policies...</p>
      </div>
    );
  }

  if (!policies.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-500 text-lg">
          No legal policies found. Please check API response.
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex w-full min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* ✅ Left Sidebar */}
      <div className="w-1/4 border-r border-gray-300 py-16 px-8 relative">
        <div className="absolute top-0 right-0 h-full w-[1px] bg-[#7658A06E]"></div>
        <img src="/logo.svg" alt="ShopSynco" className="w-36 mb-12 mx-auto" />

        <nav className="flex flex-col gap-4 text-[#4A5C74] text-sm font-medium">
          {policies.map((policy) => (
            <button
              key={policy.id}
              onClick={() => setActivePolicy(policy)}
              className={`text-left transition ${
                activePolicy?.id === policy.id
                  ? "text-[#6A9ECF] font-semibold"
                  : "hover:text-[#6A9ECF]"
              }`}
            >
              {policy.title}
            </button>
          ))}
        </nav>
      </div>

      {/* ✅ Right Content */}
      <div className="w-3/4 py-16 px-20 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#4A5C74] mb-4">
            {activePolicy?.title || "No Title"}
          </h2>

          <div
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: activePolicy?.content || "<p>No content available.</p>",
            }}
          />
        </div>

        {/* ✅ Footer Button */}
        <div className="mt-10 flex justify-end">
          <button
            className="px-10 py-3 rounded-xl font-semibold text-white 
              bg-[#7658A0] hover:bg-[#5c91c4] transition shadow-lg"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
