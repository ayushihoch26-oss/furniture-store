import AuthLayout from "../components/layout/AuthLayout";
import LoginForm from "../features/auth/LoginForm";
import useLogin from "../hooks/auth/useLogin";

export default function Login() {
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
