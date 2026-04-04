import Link from 'next/link';

export function MeuTransporteNoProfile() {
  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold text-primary-800">Meu transporte</h1>
      <p className="text-gray-600 text-sm">
        Crie seu perfil de transportador para acessar cadastro de responsáveis, convites, recibos e contratos.
      </p>
      <Link
        href="/dashboard/perfil"
        className="inline-flex px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
      >
        Ir para Meu Perfil
      </Link>
    </div>
  );
}
