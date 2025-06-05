import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import Breadcrumb from './Breadcrumb';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  console.log('Layout component rendered');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Breadcrumb />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
