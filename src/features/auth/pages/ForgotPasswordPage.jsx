import AuthLayout from "../../../components/layout/AuthLayout";
import ForgotPasswordForm from "../components/ForgotPasswordForm";
import useForgotPassword from "../hooks/useForgotPassword";

export default function ForgotPassword() {
  const forgotPassword = useForgotPassword();

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email and we will send you a link to reset your password."
    >
      <ForgotPasswordForm
        email={forgotPassword.email}
        fieldError={forgotPassword.fieldError}
        serverError={forgotPassword.serverError}
        sentTo={forgotPassword.sentTo}
        loading={forgotPassword.loading}
        handleChange={forgotPassword.handleChange}
        handleSubmit={forgotPassword.handleSubmit}
      />
    </AuthLayout> 
  );
}
