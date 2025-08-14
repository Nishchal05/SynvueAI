// app/signin/page.jsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
      <SignIn routing="path" path="/signin" signUpUrl="/signup" />
    </div>
  );
}
