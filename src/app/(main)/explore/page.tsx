"use client";

import { useEffect } from "react";
import { useUser } from "@/app/providers";
import { ExploreView } from "@/components/Explore/ExploreView";
import { useRouter } from "next/navigation";

export default function ExplorePage() {
  const router = useRouter();
  const { userContext, handleError } = useUser();

 
  useEffect(() => {
    if (!userContext) {
      router.push("/");
    }
  }, [userContext, router]);


  if (!userContext) return null;

  return <ExploreView onError={handleError} userContext={userContext} />;
}
