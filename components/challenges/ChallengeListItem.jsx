import { useQueryClient } from "@tanstack/react-query";
import { fetchChallengesList } from "@/lib/data/challenge/challengesList.queries";

export default function ChallengeListItem({
  challenge,
  onOpen,
  onDelete,
  isDeleting,
  deletingId,
}) {
  const queryClient = useQueryClient();
  const isOwner = challenge.userRole === "owner";
  const deleting = isDeleting && deletingId === challenge.id;

  const prefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ["challenge", challenge.id],
      queryFn: () => fetchChallengesList(), // Note: verify this fetcher usage, seems generic
      staleTime: 1000 * 60,
    });
  };

  return (
    <div
      onMouseEnter={prefetch}
      onClick={() => onOpen(challenge.id)}
      className="
        glass glass-hover rounded-2xl p-6 
        flex flex-col justify-between h-full min-h-[180px]
        cursor-pointer group relative overflow-hidden
      "
    >
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-xl text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
            {challenge.name}
          </h3>
          {isOwner && (
            <button
              disabled={deleting}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(challenge.id);
              }}
              className="
                text-gray-500 hover:text-red-500 p-1 -mr-2 -mt-2 rounded-full hover:bg-white/10 transition
              "
              title="Delete Challenge"
            >
              {deleting ? "⏳" : "🗑️"}
            </button>
          )}
        </div>

        <p className="text-sm text-gray-400 line-clamp-3 mb-4">
          {challenge.description || "No description provided."}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-4 border-t border-white/5">
        <span className={`px-2 py-1 rounded-md bg-white/5 border border-white/10 ${isOwner ? 'text-emerald-400' : 'text-blue-400'}`}>
          {challenge.userRole === 'owner' ? '👑 Owner' : '👤 Member'}
        </span>
        <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          View Details →
        </span>
      </div>
    </div>
  );
}
