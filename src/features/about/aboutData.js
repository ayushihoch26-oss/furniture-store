import { Chair, EventSeat, Kitchen, Weekend } from "@mui/icons-material";
import bg1 from "../../assets/aboutus-bg.jpg";
import sofa from "../../assets/banner.jpg";
import featureleft from "../../assets/aboutpage-fea.png";
import images from "../../assets/images.jpg";
import { createAboutImage } from "../../utils/aboutImages";

export const IMAGES = {
  hero: { src: bg1, fallback: bg1 },
  banner: { src: sofa, fallback: sofa },
  featureLeft: { src: featureleft, fallback: featureleft },
  featureRight: { src: images, fallback: images },
  video: createAboutImage("photo-1600607687939-ce8a6c25118c"),

  collections: [
    createAboutImage("photo-1530018607912-eff2daa1bac4"),
    createAboutImage("photo-1615066390971-03e4e1c36ddf"),
  ],

  instagram: [
    createAboutImage("photo-1616486338812-3dadae4b4ace"),
    createAboutImage("photo-1600607687920-4e2a09cf159d"),
    createAboutImage("photo-1555041469-a586c61ea9bc"),
    createAboutImage("photo-1600210492486-724fe5c67fb0"),
    createAboutImage("photo-1586023492125-27b2c045efd7"),
  ],
};

export const STATS = [
  { icon: Chair, value: "860+", label: "Armchairs" },
  { icon: Kitchen, value: "1800", label: "Cabinets" },
  { icon: Weekend, value: "2k+", label: "Sofas" },
  { icon: EventSeat, value: "2500", label: "Chairs" },
];

export const TEAM = [
  { name: "Ian Dyer", role: "Consultant" },
  { name: "Brianna Fitzgerald", role: "Manager" },
  { name: "Heath Barry", role: "Consultant" },
];

export const COLLECTIONS = [
  {
    title: "New Collection Quisque Libero",
    text: "Est nulla tincidunt commodo massa. Nunc interdum cras id augue. Tortor cras pharetra ac dignissim hendrerit fames fermentum.",
  },
  {
    title: "New Collection Nisi Imperdiet",
    text: "Ultrices porttitor lacus sed condimentum nulla viverra. Maecenas sed nisi imperdiet sed lorem sed quis sagittis in.",
  },
];
