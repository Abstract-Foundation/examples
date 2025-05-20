import React from "react";
import Image from "next/image";
import { useAbstractSession } from "@/hooks/useAbstractSession";
import { useCreateAbstractSession } from "@/hooks/useCreateAbstractSession";

export function CreateSessionKey() {
  const { isLoading: isSessionLoading } = useAbstractSession();
  const {
    mutateAsync: createSession,
    isPending: isCreatingSession,
    error: createSessionError,
  } = useCreateAbstractSession();

  const handleCreateSession = async () => {
    try {
      await createSession();
    } catch (err) {
      // Error is already handled in the hook
      console.error("Session creation failed:", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-4">
      <button
        className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] hover:text-white hover:cursor-pointer dark:hover:bg-[#e0e0e0] dark:hover:text-black text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 font-[family-name:var(--font-roobert)]"
        onClick={handleCreateSession}
        disabled={isSessionLoading || isCreatingSession}
      >
        {isCreatingSession ? (
          <div className="animate-spin">
            <Image
              src="/abs.svg"
              alt="Loading"
              width={20}
              height={20}
              style={{ filter: "brightness(0)" }}
            />
          </div>
        ) : (
          <Image
            className="dark:invert"
            src="/key.svg"
            alt="Key"
            width={20}
            height={20}
            style={{ filter: "brightness(0)" }}
          />
        )}
        {isCreatingSession ? "Creating Session Key..." : "Create Session Key"}
      </button>

      {createSessionError && (
        <p className="text-red-500 text-sm">{createSessionError.message}</p>
      )}
    </div>
  );
}
