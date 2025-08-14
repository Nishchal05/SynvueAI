// app/signup/page.jsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
      <SignUp routing="path" path="/signup" signInUrl="/signin" />
    </div>
  );
}
