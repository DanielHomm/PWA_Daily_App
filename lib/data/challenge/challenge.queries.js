// lib/data/challenge/challenge.queries.js

import {
  fetchChallengeById,
  fetchSubChallenges,
  fetchChallengeMembers,
  fetchUserCheckins,
  fetchAllCheckins,
} from "./challenge.api";

export async function fetchFullChallengeData({
  challengeId,
  userId,
}) {
  const [
    challengeRes,
    subChallengesRes,
    membersRes,
    myCheckinsRes,
    allCheckinsRes,
  ] = await Promise.all([
    fetchChallengeById(challengeId),
    fetchSubChallenges(challengeId),
    fetchChallengeMembers(challengeId),
    fetchUserCheckins(challengeId, userId),
    fetchAllCheckins(challengeId),
  ]);

  if (challengeRes.error) throw challengeRes.error;
  // Note: subChallengesRes may be empty but shouldn't error 404 if table exists
  if (subChallengesRes.error) throw subChallengesRes.error;
  if (membersRes.error) throw membersRes.error;
  if (myCheckinsRes.error) throw myCheckinsRes.error;
  if (allCheckinsRes.error) throw allCheckinsRes.error;

  return {
    challenge: challengeRes.data,
    subChallenges: subChallengesRes.data || [],
    members: membersRes.data || [],
    myCheckins: myCheckinsRes.data || [],
    allCheckins: allCheckinsRes.data || [],
  };
}
