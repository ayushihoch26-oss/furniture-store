import AuthLayout from "../../../components/layout/AuthLayout";
import LoginForm from "../components/LoginForm";
import useLogin from "../hooks/useLogin";

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
