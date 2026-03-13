export default function FullScreenLoading() {
  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center gap-6">
      <img src="/alotio-title.svg" alt="aloTio" className="h-12" />
      <img src="/bus.gif" alt="Carregando" className="w-52 h-auto" />
      <p className="text-primary-200 text-sm font-medium">Carregando...</p>
    </div>
  );
}
