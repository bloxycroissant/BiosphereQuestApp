// src/app/services/gameService.ts
// Import your Supabase client instance here, e.g.:
// import { supabase } from '../utils/supabaseClient';

interface GameValidationPayload {
  startTime: number;
  endTime: number;
  claimedXp: number;
  maxAllowedXp: number;
  minAllowedDurationMs?: number;
}

export const validateGameSubmission = ({
  startTime,
  endTime,
  claimedXp,
  maxAllowedXp,
  minAllowedDurationMs = 2000, 
}: GameValidationPayload): { isValid: boolean; reason?: string } => {
  const duration = endTime - startTime;

  // 1. Time-Delta Check: Prevent botting/scripted instant completion
  if (duration < minAllowedDurationMs) {
    return { 
      isValid: false, 
      reason: 'Suspicious activity detected: Game completed abnormally fast.' 
    };
  }

  // 2. Score Sanity Check: Prevent XP inflation beyond allowed caps
  if (claimedXp > maxAllowedXp || claimedXp < 0) {
    return { 
      isValid: false, 
      reason: 'Invalid XP score parameter detected.' 
    };
  }

  return { isValid: true };
};

interface SubmitScoreParams {
  userId: string;
  gameType: string;
  startTime: number;
  endTime: number;
  earnedXp: number;
  maxAllowedXp: number;
}

export const submitGameScore = async ({
  userId,
  gameType,
  startTime,
  endTime,
  earnedXp,
  maxAllowedXp,
}: SubmitScoreParams) => {
  // Step 1: Run anti-cheat validation checks
  const validation = validateGameSubmission({
    startTime,
    endTime,
    claimedXp: earnedXp,
    maxAllowedXp,
  });

  if (!validation.isValid) {
    throw new Error(`Anti-Cheat Validation Failed: ${validation.reason}`);
  }

  try {
    // Step 2: Securely submit score via Supabase RPC function (Server-side validation)
    /* 
      Uncomment this once your Supabase RPC function is set up:
      
      const { data, error } = await supabase.rpc('secure_add_user_xp', {
        p_user_id: userId,
        p_game_type: gameType,
        p_xp_earned: earnedXp,
      });

      if (error) throw error;
      return data;
    */

    console.log(`[SECURE SYNC] Game '${gameType}' passed validation for user ${userId}. Awarded ${earnedXp} XP.`);
    
    return {
      success: true,
      message: 'Score successfully validated and recorded.',
      xpAwarded: earnedXp,
    };

  } catch (error: any) {
    console.error('Error submitting secure score:', error.message);
    throw error;
  }
};