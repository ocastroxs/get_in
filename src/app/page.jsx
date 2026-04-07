"use client"

import { LoginForm } from "@/components/login-form"
import { GalleryVerticalEndIcon } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh">
      <div className="relative hidden bg-[] bg-muted w-[65%] lg:block">
        <h1>Logo</h1>
      </div>
      <div className="flex flex-col gap-4 p-6 w-[35%] md:p-10">
        <div className="flex flex-1 items-center">
          <div className="w-full">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
