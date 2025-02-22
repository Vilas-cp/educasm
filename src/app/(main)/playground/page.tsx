"use client";

import { PlaygroundView } from "@/components/Playground/PlaygroundView";
import { useUser } from "@/app/providers";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useEffect, Suspense } from "react";

export default function PlaygroundPage() {
  const { userContext, handleError } = useUser();
  const router = useRouter();

  const handleSuccess = (message: string) => toast.success(message);

  useEffect(() => {
    if (!userContext) {
      router.push("/");
    }
  }, [userContext, router]);

  if (!userContext) return null;

  return (
    <Suspense fallback={<p>Loading Playground...</p>}>
      <PlaygroundView
        onError={handleError}
        onSuccess={handleSuccess}
        userContext={userContext}
      />
    </Suspense>
  );
}
