import api from "../../../api/api";

export async function sendContactMessage({ name, email, phone, message }) {
  const response = await api.post("/contactus", {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    message: message.trim(),
  });

  return response.data;
}

const contactService = {
  sendContactMessage,
};

export default contactService;
