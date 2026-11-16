import AuthLayout from "../../components/layout/AuthLayout";
import RegisterForm from "./RegisterForm";
import useRegister from "../../hooks/auth/useRegister";

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
