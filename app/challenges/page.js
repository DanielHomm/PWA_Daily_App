"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ChallengesList from "@/components/challenges/ChallengesList";

export default function ChallengesPage() {
  return (
    <ProtectedRoute>
      <ChallengesList />
    </ProtectedRoute>
  );
}
