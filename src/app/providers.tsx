// app/providers.tsx
"use client";

import { createContext, useState, useContext } from "react";
import { Toaster, toast } from "react-hot-toast";
import { UserContext as UserContextType } from "@/types";

const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userContext, setUserContext] = useState<UserContextType | null>(null);

  const handleError = (message: string) => toast.error(message);
  const handleSuccess = (message: string) => toast.success(message);

  return (
    <UserContext.Provider
      value={{ userContext, setUserContext, handleError, handleSuccess }}
    >
      <Toaster position="top-right" />
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
