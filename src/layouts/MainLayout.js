import React from 'react';
import Navbar from '../components/header/Navbar';
import Footer from '../components/footer/Footer';
import BackToTop from '../components/ui/BackToTop';

export default function MainLayout({ children, hideFooter }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      {!hideFooter && <Footer />}
      <BackToTop />
    </div>
  );
}
