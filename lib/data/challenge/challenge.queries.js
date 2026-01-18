// lib/data/challenge/challenge.queries.js

import {
  fetchChallengeById,
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
    membersRes,
    myCheckinsRes,
    allCheckinsRes,
  ] = await Promise.all([
    fetchChallengeById(challengeId),
    fetchChallengeMembers(challengeId),
    fetchUserCheckins(challengeId, userId),
    fetchAllCheckins(challengeId),
  ]);

  if (challengeRes.error) throw challengeRes.error;
  if (membersRes.error) throw membersRes.error;
  if (myCheckinsRes.error) throw myCheckinsRes.error;
  if (allCheckinsRes.error) throw allCheckinsRes.error;

  return {
    challenge: challengeRes.data,
    members: membersRes.data || [],
    myCheckins: myCheckinsRes.data || [],
    allCheckins: allCheckinsRes.data || [],
  };
}
