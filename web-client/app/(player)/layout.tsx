export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7FF60E]/10 via-white to-[#850EF6]/10">
      {children}
    </div>
  );
}
