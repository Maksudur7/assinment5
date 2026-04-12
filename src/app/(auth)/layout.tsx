export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="dark min-h-screen bg-black">{children}</div>;
}
