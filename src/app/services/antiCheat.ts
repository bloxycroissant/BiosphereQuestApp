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
  minAllowedDurationMs = 5000, 
}: GameValidationPayload): { isValid: boolean; reason?: string } => {
  const duration = endTime - startTime;

  if (duration < minAllowedDurationMs) {
    return { 
      isValid: false, 
      reason: 'Suspicious activity detected: Game completed abnormally fast.' 
    };
  }

  if (claimedXp > maxAllowedXp || claimedXp < 0) {
    return { 
      isValid: false, 
      reason: 'Invalid XP score parameter detected.' 
    };
  }

  return { isValid: true };
};