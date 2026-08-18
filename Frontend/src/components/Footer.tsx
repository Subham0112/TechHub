import React from "react";

/* Logo mark — "TH" with an irregular neon-style flicker on its glow */
const LogoMark = ({
  size = "w-7 h-7",
  textSize = "text-[12px]",
}: { size?: string; textSize?: string }) => (
  <div
    className={`${size} rounded-md bg-[#121A2E] border border-[#232F49] flex items-center justify-center flex-shrink-0`}
  >
    <span className={`th-flicker font-mono font-bold ${textSize} text-[#5B8DEF] leading-none`}>
      TH
    </span>
  </div>
);

const Footer = () => {
  return (
    <footer className="bg-[#080B14] text-[#8592AC] border-t border-dashed border-[#232F49] pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <LogoMark />
              <h3 className="text-[#EDF1F7] font-display font-semibold text-lg">TechHub</h3>
            </div>
            <p className="text-sm font-body leading-relaxed">
              Your one-stop shop for the latest gadgets and mobile accessories.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-4">
              // Support
            </h4>
            <ul className="space-y-2.5 text-sm font-body">
              <li>
                <a href="#" className="hover:text-[#EDF1F7] transition">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#EDF1F7] transition">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#EDF1F7] transition">
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#EDF1F7] transition">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-4">
              // Company
            </h4>
            <ul className="space-y-2.5 text-sm font-body">
              <li>
                <a href="#" className="hover:text-[#EDF1F7] transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#EDF1F7] transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#EDF1F7] transition">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-4">
              // Categories
            </h4>
            <ul className="space-y-2.5 text-sm font-body">
              <li>
                <a href="/products/category/mobile-accessories" className="hover:text-[#EDF1F7] transition">
                  Mobile Accessories
                </a>
              </li>
              <li>
                <a href="/products/category/gadgets" className="hover:text-[#EDF1F7] transition">
                  Gadgets
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#232F49] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <p>&copy; 2026 TechHub. All rights reserved.</p>
          <span className="flex items-center gap-2 text-emerald-400 uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Online
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
