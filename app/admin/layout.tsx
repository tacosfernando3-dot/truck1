import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[200] overflow-auto bg-[#100b0b] text-white">
      {/* Locked desktop canvas — never reflows/stacks on viewport resize */}
      <div className="admin-shell flex h-full min-h-[720px] w-full min-w-[1360px] flex-col">
        {children}
      </div>
    </div>
  );
}
