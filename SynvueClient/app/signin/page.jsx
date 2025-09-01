// app/signin/page.jsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4">
      <SignIn routing="path" path="/signin" signUpUrl="/signup" redirectUrl="/" />
    </div>
  );
}
