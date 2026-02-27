import { Toaster } from "sonner";




export default function AuthenticationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div>
        <Toaster position="top-center" richColors />
        {children}
      </div>
  );
}