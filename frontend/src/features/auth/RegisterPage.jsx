import AuthLayout from "../../components/AuthLayout";
import useRegister from "../../hooks/auth/useRegister";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  const register = useRegister();

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join us and discover furniture for every home."
    >
      <RegisterForm {...register} />
    </AuthLayout>
  );
}
