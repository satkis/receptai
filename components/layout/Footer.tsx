import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    recipes: [
      { name: 'Receptai', href: '/receptai' },
      { name: 'Privatumo politika', href: '/privatumas' },
      { name: 'Naudojimo taisyklės', href: '/taisykles' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">👨‍🍳</span>
              </div>
              <span className="text-xl font-bold">Paragaujam.lt</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Geriausi lietuviški receptai. Ruoškite skaniai ir lengvai kartu su mumis!
            </p>
               </div>

          {/* Footer Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Paragaujam.lt © {currentYear}</h3>
            <ul className="space-y-2">
              {footerLinks.recipes.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
