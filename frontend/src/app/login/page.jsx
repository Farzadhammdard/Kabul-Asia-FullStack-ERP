import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.15),_transparent_40%),radial-gradient(circle_at_20%_20%,_rgba(251,191,36,0.12),_transparent_35%),radial-gradient(circle_at_80%_70%,_rgba(14,116,144,0.15),_transparent_40%)]">
      <LoginForm />
    </div>
  );
}
