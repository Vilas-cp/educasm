"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/providers";
import { PreFillForm } from "@/components/shared/PreFillForm";

export default function HomePage() {
  const { userContext, setUserContext } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (userContext) {
      router.replace("/explore");
    }
  }, [userContext, router]);

  return (
    <div className="min-h-screen bg-background text-white p-4">
      <Suspense fallback={<p>Loading Form...</p>}>
        <PreFillForm onSubmit={(context) => setUserContext(context)} />
      </Suspense>
    </div>
  );
}

