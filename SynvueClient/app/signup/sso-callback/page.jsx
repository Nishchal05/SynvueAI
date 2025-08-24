// app/signup/sso-callback/page.tsx
"use client"
import { Smile } from "lucide-react";
import { redirect } from "next/navigation";
import { toast } from "sonner";

export default function SSOCallback() {
  toast("Already have an account? Please log in.",<Smile/>)
    redirect("/signin"); 
}
