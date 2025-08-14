// app/signup/page.jsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4">
    
      <SignUp routing="path" path="/signup" signInUrl="/signin" />
    </div>
  );
}
