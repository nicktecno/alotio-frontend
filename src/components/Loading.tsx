export default function Loading({ text = 'Carregando...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <img src="/bus.gif" alt="Carregando" className="w-40 h-auto" />
      <p className="text-gray-400 text-sm font-medium">{text}</p>
    </div>
  );
}
