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
      queryFn: () => fetchChallengesList(),
      staleTime: 1000 * 60,
    });
  };

  return (
    <li
      onMouseEnter={prefetch}
      onClick={() => onOpen(challenge.id)}
      className="
        group p-4 border rounded-lg flex justify-between items-center
        hover:shadow-md hover:bg-gray-50 transition cursor-pointer
      "
    >
      <div>
        <p className="font-semibold">{challenge.name}</p>
        {challenge.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {challenge.description}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Role: {challenge.userRole}
        </p>
      </div>

      {isOwner && (
        <button
          disabled={deleting}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(challenge.id);
          }}
          className="
            ml-4 px-2 py-1 text-sm rounded
            bg-red-500 text-white
            hover:bg-red-600
            disabled:opacity-50
          "
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      )}
    </li>
  );
}
