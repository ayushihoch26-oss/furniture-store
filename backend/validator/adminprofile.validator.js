export const validateUpdate = (data = {}) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw Object.assign(new Error("Invalid admin profile data"), {
      statusCode: 400,
    });
  }

  const clean = {};

  for (const field of ["firstName", "lastName"]) {
    const value = String(data[field] ?? "").trim();

    if (!value) {
      throw Object.assign(new Error(`${field} is required`), {
        statusCode: 400,
      });
    }

    clean[field] = value;
  }

  const email = String(data.email ?? "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw Object.assign(new Error("Enter a valid email"), { statusCode: 400 });
  }

  clean.email = email;

  const bio = String(data.bio ?? "");

  if (bio.length > 250) {
    throw Object.assign(
      new Error("Biography must be 250 characters or less"),
      { statusCode: 400 },
    );
  }

  clean.bio = bio;
  clean.countryCode = String(data.countryCode || "+1").trim();
  clean.phone = String(data.phone ?? "").trim();
  clean.location = String(data.location ?? "").trim();
  clean.card = String(data.card ?? "").trim();
  clean.birthDate = data.birthDate ? String(data.birthDate) : null;

  return clean;
};

export const validateImage = (file) => {
  if (!file) {
    throw Object.assign(
      new Error("No image received. Use the field name 'image'."),
      { statusCode: 400 },
    );
  }

  if (!file.mimetype?.startsWith("image/")) {
    throw Object.assign(new Error("Please choose an image file"), {
      statusCode: 400,
    });
  }

  if (file.size > 2 * 1024 * 1024) {
    throw Object.assign(new Error("Image must be smaller than 2 MB"), {
      statusCode: 400,
    });
  }
};

export const validateSocial = (key, linked) => {
  const socialFields = {
    google: "linkedGoogle",
    facebook: "linkedFacebook",
    x: "linkedX",
  };

  if (!Object.hasOwn(socialFields, key)) {
    throw Object.assign(new Error("Unknown social account"), {
      statusCode: 400,
    });
  }

  const field = socialFields[key];

  return {
    field,
    linked: linked === true || linked === "true",
  };
};

export default {
  validateUpdate,
  validateImage,
  validateSocial,
};