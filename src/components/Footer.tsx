export default function Footer() {
  return (
    <footer className="bg-primary-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/alotio-title.svg" alt="aloTio" className="h-6" />
          </div>
          <p className="text-primary-100 text-sm">
            &copy; {new Date().getFullYear()} aloTio. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
