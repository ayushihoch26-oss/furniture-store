import AuthLayout from "../../components/AuthLayout";
import LoginForm from "./LoginForm";
import useLogin from "../../hooks/auth/useLogin";

export default function LoginPage() {
  const login = useLogin();

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to your account to continue."
    >
      <LoginForm {...login} />
    </AuthLayout>
  );
}
