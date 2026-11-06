import { Readable } from "node:stream";
import adminProfileRepository from "../repository/adminprofile.repository.js";
import cloudinary from "../config/cloudinary.js";
import {
  validateImage,
  validateSocial,
  validateUpdate,
} from "../validator/adminprofile.validator.js";

// Get Admin Profile
export const get = async (user) => {
  let profile = await adminProfileRepository.findByUserId(user.id);

  if (!profile) {
    profile = await adminProfileRepository.create({
      userId: user.id,
      email: user.email || null,
    });
  }

  return {
    image: profile.image || "",
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email || "",
    password: "**********",
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
  };
};

// Update Admin Profile
export const update = async (user, data) => {
  const clean = validateUpdate(data);
  let profile = await adminProfileRepository.findByUserId(user.id);

  if (!profile) {
    profile = await adminProfileRepository.create({
      userId: user.id,
      email: user.email || null,
    });
  }

  await adminProfileRepository.update(profile, clean);

  return {
    image: profile.image || "",
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email || "",
    password: "**********",
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
  };
};

// Upload Profile Image
export const uploadImage = async (user, file) => {
  validateImage(file);

  let profile = await adminProfileRepository.findByUserId(user.id);

  if (!profile) {
    profile = await adminProfileRepository.create({
      userId: user.id,
      email: user.email || null,
    });
  }

  const uploaded = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "furniture/admin-profiles",
        resource_type: "image",
      },
      (error, uploaded) => {
        if (error) reject(error);
        else resolve(uploaded);
      },
    );

    Readable.from(file.buffer).pipe(stream);
  });

  await adminProfileRepository.update(profile, {
    image: uploaded.secure_url,
  });

  return {
    image: profile.image || "",
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email || "",
    password: "**********",
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
  };
};

// Delete Profile Image
export const deleteImage = async (user) => {
  let profile = await adminProfileRepository.findByUserId(user.id);

  if (!profile) {
    profile = await adminProfileRepository.create({
      userId: user.id,
      email: user.email || null,
    });
  }

  await adminProfileRepository.update(profile, {
    image: null,
  });

  return {
    image: "",
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email || "",
    password: "**********",
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
  };
};

// Social Account
export const setSocial = async (user, key, linked) => {
  const { field, linked: linkedValue } = validateSocial(key, linked);

  let profile = await adminProfileRepository.findByUserId(user.id);

  if (!profile) {
    profile = await adminProfileRepository.create({
      userId: user.id,
      email: user.email || null,
    });
  }

  await adminProfileRepository.update(profile, {
    [field]: linkedValue,
  });

  return {
    image: profile.image || "",
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email || "",
    password: "**********",
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
  };
};

// Default Export
export default {
  get,
  update,
  uploadImage,
  deleteImage,
  setSocial,
};
