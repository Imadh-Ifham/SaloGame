import React from "react";
import Header from "./Header";
import Footer from "./Footer";

interface HomeLayoutProps {
  children: React.ReactNode;
}

const HomeLayout: React.FC<HomeLayoutProps> = ({ children }) => {
  return (
    <div
      className="max-w-full pattern-boxes pattern-green-100 pattern-bg-white 
  pattern-size-2 pattern-opacity-100"
    >
      <Header />
      <div className="min-h-screen">{children}</div>
      <Footer />
    </div>
  );
};

export default HomeLayout;
