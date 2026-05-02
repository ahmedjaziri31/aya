export interface SignMapping {
  name: string;
  nameFr: string;
  description: string;
}

export const signDictionary: Record<string, SignMapping> = {
  open_palm: {
    name: "Hello",
    nameFr: "Bonjour",
    description: "Main ouverte - Salutation",
  },
  fist: {
    name: "Yes",
    nameFr: "Oui",
    description: "Poing fermé - Affirmation",
  },
  thumbs_up: {
    name: "Good / OK",
    nameFr: "Bien / D'accord",
    description: "Pouce levé - Approbation",
  },
  peace: {
    name: "Peace / Two",
    nameFr: "Paix / Deux",
    description: "Signe de paix - Deux doigts",
  },
  point: {
    name: "You / There",
    nameFr: "Toi / Là-bas",
    description: "Index pointé - Désignation",
  },
  i_love_you: {
    name: "I love you",
    nameFr: "Je t'aime",
    description: "Pouce + index + auriculaire - Amour (ASL)",
  },
  ok_sign: {
    name: "OK",
    nameFr: "D'accord",
    description: "Cercle pouce-index - Accord",
  },
  call_me: {
    name: "Call me",
    nameFr: "Appelle-moi",
    description: "Pouce + auriculaire - Téléphone",
  },
};

interface Landmark {
  x: number;
  y: number;
  z: number;
}

function dist2d(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function dist3d(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function isFingerExtended(
  tip: Landmark,
  pip: Landmark,
  mcp: Landmark,
  wrist: Landmark
): boolean {
  const tipToWrist = dist2d(tip, wrist);
  const mcpToWrist = dist2d(mcp, wrist);
  const tipToPip = dist2d(tip, pip);
  const pipToMcp = dist2d(pip, mcp);

  // Tip should be farther from wrist than MCP
  const extendedFromWrist = tipToWrist > mcpToWrist * 1.1;
  // Tip-to-pip should indicate straightness
  const straightFinger = tipToPip > pipToMcp * 0.8;

  return extendedFromWrist && straightFinger;
}

function isThumbExtended(
  thumbTip: Landmark,
  thumbIp: Landmark,
  thumbMcp: Landmark,
  indexMcp: Landmark
): boolean {
  const tipToIndex = dist2d(thumbTip, indexMcp);
  const mcpToIndex = dist2d(thumbMcp, indexMcp);
  return tipToIndex > mcpToIndex * 1.2;
}

function palmSize(landmarks: Landmark[]): number {
  return dist2d(landmarks[0], landmarks[9]);
}

export function classifyGesture(landmarks: Landmark[]): string | null {
  if (!landmarks || landmarks.length < 21) return null;

  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const thumbMcp = landmarks[2];
  const indexTip = landmarks[8];
  const indexPip = landmarks[6];
  const indexMcp = landmarks[5];
  const middleTip = landmarks[12];
  const middlePip = landmarks[10];
  const middleMcp = landmarks[9];
  const ringTip = landmarks[16];
  const ringPip = landmarks[14];
  const ringMcp = landmarks[13];
  const pinkyTip = landmarks[20];
  const pinkyPip = landmarks[18];
  const pinkyMcp = landmarks[17];

  const palm = palmSize(landmarks);
  if (palm < 0.03) return null; // Hand too far / noise

  const indexUp = isFingerExtended(indexTip, indexPip, indexMcp, wrist);
  const middleUp = isFingerExtended(middleTip, middlePip, middleMcp, wrist);
  const ringUp = isFingerExtended(ringTip, ringPip, ringMcp, wrist);
  const pinkyUp = isFingerExtended(pinkyTip, pinkyPip, pinkyMcp, wrist);
  const thumbOut = isThumbExtended(thumbTip, thumbIp, thumbMcp, indexMcp);

  const allUp = indexUp && middleUp && ringUp && pinkyUp;
  const allDown = !indexUp && !middleUp && !ringUp && !pinkyUp;

  // OK sign: thumb tip touches index tip (circle)
  const thumbIndexDist = dist3d(thumbTip, indexTip);
  if (thumbIndexDist < palm * 0.3 && middleUp && ringUp && pinkyUp && !indexUp) {
    return "ok_sign";
  }

  // Open palm: all fingers extended + thumb out
  if (allUp && thumbOut) return "open_palm";

  // Fist: all fingers curled + thumb tucked
  if (allDown && !thumbOut) return "fist";

  // Thumbs up: thumb pointing up, all fingers curled
  if (allDown && thumbOut && thumbTip.y < thumbMcp.y) return "thumbs_up";

  // I love you (ASL): thumb + index + pinky extended, middle + ring down
  if (indexUp && !middleUp && !ringUp && pinkyUp && thumbOut) return "i_love_you";

  // Call me: thumb + pinky extended, others down
  if (!indexUp && !middleUp && !ringUp && pinkyUp && thumbOut) return "call_me";

  // Peace sign: index + middle up, ring + pinky down
  if (indexUp && middleUp && !ringUp && !pinkyUp) return "peace";

  // Point: only index up
  if (indexUp && !middleUp && !ringUp && !pinkyUp) return "point";

  return null;
}
