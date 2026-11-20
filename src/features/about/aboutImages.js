import { U, ROOM } from "../../assets/furnitureImages";

export function createAboutImage(id) {
  const src = U(id, 1200, 800);

  return {
    src,
    fallback: U(ROOM.showroom, 1200, 800),
  };
}
