export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">ConsultSystem</h1>
          <p className="text-muted-foreground">Configuracion inicial</p>
        </div>
        {children}
      </div>
    </div>
  );
}
