import { Readable } from "node:stream";
import adminProfileRepository from "../repository/adminProfile.repository.js";
import cloudinary from "../config/cloudinary.js";

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

const BIO_LIMIT = 250;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SOCIAL_FIELDS = {
  google: "linkedGoogle",
  facebook: "linkedFacebook",
  x: "linkedX",
};

const log = (...args) => console.log("[adminProfile]", ...args);

// Shape sent to the frontend (same field names the page already uses)
const formatProfile = (profile) => ({
  image: profile.image || "",
  firstName: profile.firstName,
  lastName: profile.lastName,
  email: profile.email || "",
  password: "**********", // the real password is never sent
  countryCode: profile.countryCode,
  phone: profile.phone || "",
  birthDate: profile.birthDate || "",
  location: profile.location || "",
  card: profile.card || "",
  bio: profile.bio || "",
  linked: {
    google: profile.linkedGoogle,
    facebook: profile.linkedFacebook,
    x: profile.linkedX,
  },
});

// Get the profile, creating an empty one the first time
const getOrCreate = async (user) => {
  let profile = await adminProfileRepository.findByUserId(user.id);

  if (!profile) {
    profile = await adminProfileRepository.create({
      userId: user.id,
      email: user.email || null,
    });
    log("created profile for user", user.id);
  }

  return profile;
};

// Validate + clean the editable fields
const validateProfile = (data = {}) => {
  const clean = {};

  for (const field of ["firstName", "lastName"]) {
    const value = String(data[field] ?? "").trim();
    if (!value) throw new AppError(`${field} is required`, 400);
    clean[field] = value;
  }

  const email = String(data.email ?? "").trim();
  if (!EMAIL_REGEX.test(email)) throw new AppError("Enter a valid email", 400);
  clean.email = email;

  const bio = String(data.bio ?? "");
  if (bio.length > BIO_LIMIT) {
    throw new AppError(
      `Biography must be ${BIO_LIMIT} characters or less`,
      400,
    );
  }
  clean.bio = bio;

  clean.countryCode = String(data.countryCode || "+1").trim();
  clean.phone = String(data.phone ?? "").trim();
  clean.location = String(data.location ?? "").trim();
  clean.card = String(data.card ?? "").trim();
  clean.birthDate = data.birthDate ? String(data.birthDate) : null; // YYYY-MM-DD

  return clean;
};

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "furniture/admin-profiles", resource_type: "image" },
      (error, uploaded) => (error ? reject(error) : resolve(uploaded)),
    );
    Readable.from(buffer).pipe(stream);
  });

const adminProfileService = {
  async get(user) {
    const profile = await getOrCreate(user);
    return formatProfile(profile);
  },

  async update(user, data) {
    const profile = await getOrCreate(user);
    await adminProfileRepository.update(profile, validateProfile(data));
    log("profile updated for user", user.id);
    return formatProfile(profile);
  },

  async uploadImage(user, file) {
    if (!file)
      throw new AppError("No image received. Use the field name 'image'.", 400);
    if (!file.mimetype?.startsWith("image/")) {
      throw new AppError("Please choose an image file", 400);
    }
    if (file.size > 2 * 1024 * 1024) {
      throw new AppError("Image must be smaller than 2 MB", 400);
    }

    const profile = await getOrCreate(user);
    const uploaded = await uploadToCloudinary(file.buffer);

    await adminProfileRepository.update(profile, {
      image: uploaded.secure_url,
    });
    log("photo updated for user", user.id);
    return formatProfile(profile);
  },

  async deleteImage(user) {
    const profile = await getOrCreate(user);
    await adminProfileRepository.update(profile, { image: null });
    log("photo removed for user", user.id);
    return formatProfile(profile);
  },

  // key: google | facebook | x
  async setSocial(user, key, linked) {
    const field = SOCIAL_FIELDS[key];
    if (!field) throw new AppError("Unknown social account", 400);

    const profile = await getOrCreate(user);
    await adminProfileRepository.update(profile, {
      [field]: linked === true || linked === "true",
    });
    return formatProfile(profile);
  },
};

export default adminProfileService;
