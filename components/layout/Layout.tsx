import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();

  // Check if we should add left margin for sidebar
  const shouldShowSidebar = () => {
    const path = router.pathname;
    return (
      path.startsWith('/receptai/') &&
      !path.startsWith('/receptas/') && // Not individual recipe pages
      path !== '/receptai' // Not main recipes page
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={`flex-1 ${shouldShowSidebar() ? 'md:ml-64' : ''}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
