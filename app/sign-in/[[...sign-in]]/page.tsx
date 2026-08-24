import { SignIn } from "@clerk/nextjs";
import DemoLoginButton from "../../components/DemoLoginButton";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-[400px] mb-4">
        <DemoLoginButton />
      </div>
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
