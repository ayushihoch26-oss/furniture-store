import api from "../api/api";

// Send Contact Us message to backend
export const sendContactMessage = async ({ name, email, phone, message }) => {
  const response = await api.post("/contactus", {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    message: message.trim(),
  });

  return response.data;
};

export default {
  sendContactMessage,
};
