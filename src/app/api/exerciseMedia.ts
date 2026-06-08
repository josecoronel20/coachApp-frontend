const API_BASE = "";
const EXERCISE_MEDIA_FETCH_TIMEOUT_MS = 7000;

export type ExerciseMediaDto = {
  normalizedName: string;
  gifUrl: string;
  targetMuscle: string;
  secondaryMuscles: string[];
  instructions: string[];
};

export type ExerciseSuggestion = {
  id: string;
  name: string;
  muscleGroup: string;
};

const LEGACY_FREE_EXERCISE_DB_IMAGE_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/images/";
const FREE_EXERCISE_DB_IMAGE_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

const FREE_EXERCISE_DB_FALLBACK_IMAGES: Record<string, string> = {
  "barbell bench press": "Barbell_Bench_Press_-_Medium_Grip/0.jpg",
  "incline barbell bench press": "Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg",
  "dumbbell bench press": "Dumbbell_Bench_Press/0.jpg",
  "chest fly": "Dumbbell_Flyes/0.jpg",
  "push up": "Pushups/0.jpg",
  "pull up": "Pullups/0.jpg",
  "barbell row": "Bent_Over_Barbell_Row/0.jpg",
  "lat pulldown": "Wide-Grip_Lat_Pulldown/0.jpg",
  "seated cable row": "Seated_Cable_Rows/0.jpg",
  deadlift: "Barbell_Deadlift/0.jpg",
  squat: "Barbell_Full_Squat/0.jpg",
  "leg press": "Leg_Press/0.jpg",
  "leg extension": "Leg_Extensions/0.jpg",
  "leg curl": "Lying_Leg_Curls/0.jpg",
  "hip thrust": "Barbell_Hip_Thrust/0.jpg",
  lunge: "Barbell_Lunge/0.jpg",
  "romanian deadlift": "Romanian_Deadlift/0.jpg",
  "military press": "Standing_Military_Press/0.jpg",
  "dumbbell shoulder press": "Arnold_Dumbbell_Press/0.jpg",
  "lateral raise": "Side_Lateral_Raise/0.jpg",
  "face pull": "Face_Pull/0.jpg",
  "barbell curl": "Barbell_Curl/0.jpg",
  "dumbbell curl": "Alternate_Hammer_Curl/0.jpg",
  "hammer curl": "Alternate_Hammer_Curl/0.jpg",
  "triceps pushdown": "Triceps_Pushdown_-_Rope_Attachment/0.jpg",
  "skull crusher": "Decline_Close-Grip_Bench_To_Skull_Crusher/0.jpg",
  dip: "Bench_Dips/0.jpg",
  plank: "Plank/0.jpg",
  crunch: "Crunch_-_Hands_Overhead/0.jpg",
  "ab wheel": "Ab_Roller/0.jpg",
  "glute bridge": "Barbell_Glute_Bridge/0.jpg",
  burpee: "Burpee/0.jpg",
  "box jump": "Box_Jump_(Multiple_Response)/0.jpg",
  shrug: "Barbell_Shrug/0.jpg",
  "front squat": "Barbell_Full_Squat/0.jpg",
  "goblet squat": "Goblet_Squat/0.jpg",
  "cable row": "Seated_Cable_Rows/0.jpg",
  "seated calf raise": "Calf_Raise_On_A_Dumbbell/0.jpg",
};

export function normalizeExerciseMediaUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";

  const fixedLegacyPath = trimmed.startsWith(LEGACY_FREE_EXERCISE_DB_IMAGE_BASE)
    ? trimmed.replace(
        LEGACY_FREE_EXERCISE_DB_IMAGE_BASE,
        FREE_EXERCISE_DB_IMAGE_BASE
      )
    : trimmed;

  return encodeURI(fixedLegacyPath);
}

function titleCaseExerciseDbPath(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join("_");
}

function getFallbackExerciseMediaUrl(media: ExerciseMediaDto) {
  const normalizedName = media.normalizedName.trim();
  if (!normalizedName) return "";

  const mappedImage = FREE_EXERCISE_DB_FALLBACK_IMAGES[normalizedName];
  if (mappedImage) return `${FREE_EXERCISE_DB_IMAGE_BASE}${mappedImage}`;

  return `${FREE_EXERCISE_DB_IMAGE_BASE}${titleCaseExerciseDbPath(normalizedName)}/0.jpg`;
}

function normalizeExerciseMediaDto(media: ExerciseMediaDto): ExerciseMediaDto {
  const gifUrl = normalizeExerciseMediaUrl(media.gifUrl);

  return {
    ...media,
    gifUrl: gifUrl || getFallbackExerciseMediaUrl(media),
  };
}

async function fetchWithTimeout(url: string, init: RequestInit = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    EXERCISE_MEDIA_FETCH_TIMEOUT_MS
  );

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Lookup multimedia para el modal de info. Devuelve null si no existe. */
export async function getExerciseMedia(
  name: string
): Promise<ExerciseMediaDto | null> {
  try {
    const url = `${API_BASE}/api/exercise-media/lookup?name=${encodeURIComponent(name)}`;
    const res = await fetchWithTimeout(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { media: ExerciseMediaDto | null };
    return data.media ? normalizeExerciseMediaDto(data.media) : null;
  } catch {
    return null;
  }
}

/** Busqueda de sugerencias para el builder de rutinas. */
export async function searchExerciseMedia(
  query: string
): Promise<ExerciseSuggestion[]> {
  try {
    const url = `${API_BASE}/api/exercise-media/search?q=${encodeURIComponent(query)}`;
    const res = await fetchWithTimeout(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { exercises: ExerciseSuggestion[] };
    return data.exercises ?? [];
  } catch {
    return [];
  }
}
