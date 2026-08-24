import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import DemoLoginButton from '../../components/DemoLoginButton';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 sm:p-6">
      <div className="mb-4 flex flex-col items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-black py-2 px-3 transition-colors rounded-lg hover:bg-gray-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>Back to Landing Page</span>
        </Link>
      </div>

      <div className="w-full max-w-[400px] mb-4">
        <DemoLoginButton />
      </div>

      <div className="flex items-center gap-2 w-full max-w-[400px] my-2 text-gray-400 text-xs font-bold uppercase">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span>or sign in with credentials</span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>

      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  );
}
