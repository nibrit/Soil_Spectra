import React from 'react';
import { Link } from 'react-router-dom';
import { Microscope, Mail, Github, Linkedin, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-green-900 text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <Microscope className="h-8 w-8 mr-2" />
              <span className="text-xl font-bold">Soil Spectra</span>
            </div>
            <p className="text-green-100 mb-4">
              Advanced soil analysis for informed land usage decisions.
            </p>
            <div className="flex space-x-4">
              <SocialIcon icon={<Twitter size={20} />} href="https://x.com/Cipher_Helpline?t=IMd4ImeMXveJA_wnscxi5Q&s=08 " />
              <SocialIcon icon={<Github size={20} />} href="https://github.com/nibrit" />
              <SocialIcon icon={<Linkedin size={20} />} href="https://www.linkedin.com/in/nibrit-berlin-b-2bb39b25a/" />
              <SocialIcon icon={<Mail size={20} />} href="nibritberlin3@gmail.com" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/analyze">Analyze Soil</FooterLink>
              <FooterLink to="/education">Education Center</FooterLink>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <FooterLink to="/education#ph">Soil pH Guide</FooterLink>
              <FooterLink to="/education#moisture">Moisture Analysis</FooterLink>
              <FooterLink to="/education#building">Building Requirements</FooterLink>
              <FooterLink to="/education#agriculture">Agricultural Needs</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <p className="text-green-100 mb-2">1234 Soil Avenue</p>
            <p className="text-green-100 mb-2">Earth City, EC 98765</p>
            <p className="text-green-100 mb-2">info@soilspectra.com</p>
            <p className="text-green-100">+1 (555) 123-4567</p>
          </div>
        </div>

        <div className="border-t border-green-700 mt-8 pt-8 text-center text-green-300">
          <p>© {currentYear} Soil Spectra. A part of  C I P H E R  . All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

interface SocialIconProps {
  icon: React.ReactNode;
  href: string;
}

const SocialIcon: React.FC<SocialIconProps> = ({ icon, href }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="bg-green-800 hover:bg-green-700 h-10 w-10 rounded-full flex items-center justify-center transition-colors"
  >
    {icon}
  </a>
);

interface FooterLinkProps {
  to: string;
  children: React.ReactNode;
}

const FooterLink: React.FC<FooterLinkProps> = ({ to, children }) => (
  <li>
    <Link 
      to={to} 
      className="text-green-200 hover:text-white transition-colors"
    >
      {children}
    </Link>
  </li>
);