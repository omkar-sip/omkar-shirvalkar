/**
 * Plays a sound effect.
 * @param src Path to the sound file (should be in the `public` directory).
 * @param volume Volume from 0.0 to 1.0.
 */
export const playSound = (src: string, volume = 0.5) => {
  const basePath = import.meta.env.BASE_URL || "/";
  const resolvedSrc = src.startsWith("/") && basePath !== "/" 
    ? `${basePath}${src.slice(1)}` 
    : src;

  const audio = new Audio(resolvedSrc);
  audio.volume = volume;
  audio.play().catch(error => {
    console.error(`Error playing sound: ${resolvedSrc}`, error);
  });
};
