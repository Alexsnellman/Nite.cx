import { ReactNode } from "react";

export default function MobileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[430px] min-h-screen relative bg-background shadow-2xl shadow-black/50">
      {children}
    </div>
  );
}
