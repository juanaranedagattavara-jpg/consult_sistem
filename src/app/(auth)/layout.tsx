export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">ConsultSystem</h1>
          <p className="text-gray-600 dark:text-gray-400">Sistema de agendamiento</p>
        </div>
        {children}
      </div>
    </div>
  );
}
