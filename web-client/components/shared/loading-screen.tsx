import Spinner from "../ui/spinner";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "Carregando..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-[#7FF60E]/10 to-[#850EF6]/10">
      <Spinner size="lg" />
      <p className="text-xl font-semibold text-gray-700">{message}</p>
    </div>
  );
}