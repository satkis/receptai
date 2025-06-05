import Link from 'next/link';
import { ChefHat, Facebook, Instagram, Mail, Phone } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    recipes: [
      { name: 'Pirmieji patiekalai', href: '/recipes?category=pirmieji-patiekalai' },
      { name: 'Antrieji patiekalai', href: '/recipes?category=antrieji-patiekalai' },
      { name: 'Saldumynai', href: '/recipes?category=saldumynai' },
      { name: 'Užkandžiai', href: '/recipes?category=uzkandziai' },
      { name: 'Gėrimai', href: '/recipes?category=gerimai' },
    ],
    company: [
      { name: 'Apie mus', href: '/about' },
      { name: 'Kontaktai', href: '/contact' },
      { name: 'Privatumo politika', href: '/privacy' },
      { name: 'Naudojimo taisyklės', href: '/terms' },
      { name: 'Reklama', href: '/advertising' },
    ],
    support: [
      { name: 'Pagalba', href: '/help' },
      { name: 'DUK', href: '/faq' },
      { name: 'Receptų pateikimas', href: '/submit-recipe' },
      { name: 'Pranešti apie problemą', href: '/report' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Paragaujam.lt</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Geriausi lietuviški receptai su interaktyviomis funkcijomis. 
              Ruoškite skaniai ir lengvai kartu su mumis!
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com/paragaujam"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors duration-200"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/paragaujam"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors duration-200"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="mailto:info@paragaujam.lt"
                className="text-gray-400 hover:text-primary transition-colors duration-200"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Recipes */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Receptai</h3>
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

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Įmonė</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
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

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Pagalba</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
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
            
            <div className="mt-6 space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Mail className="w-4 h-4" />
                <span>info@paragaujam.lt</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Phone className="w-4 h-4" />
                <span>+370 600 12345</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="max-w-md">
            <h3 className="text-lg font-semibold mb-2">Naujienlaiškis</h3>
            <p className="text-gray-400 text-sm mb-4">
              Gaukite naujausius receptus ir kulinarijos patarimus tiesiai į savo el. paštą
            </p>
            <form className="flex space-x-2">
              <input
                type="email"
                placeholder="Jūsų el. paštas"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="submit"
                className="btn-primary-custom px-6 py-2 text-sm"
              >
                Prenumeruoti
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-400">
            © {currentYear} Paragaujam.lt. Visos teisės saugomos.
          </div>
          <div className="flex space-x-6 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors duration-200">
              Privatumas
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors duration-200">
              Taisyklės
            </Link>
            <Link href="/cookies" className="hover:text-white transition-colors duration-200">
              Slapukai
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
