import React from "react";

const Footer = () => {
  return (
    <footer className="footer bg-arcanaBackgroundDarker text-white py-6">
      <div className="container mx-auto text-center">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <p className="text-gray-400 mt-2">Restez organisé avec Arcana</p>
          </div>
        </div>{" "}
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Arcana. Tous droits réservés.
        </p>
        <div className="mt-4">
          <a
            href="/politique-de-confidentialite"
            className="text-gray-400 hover:text-white mx-2"
          >
            Politique de confidentialité
          </a>
          <a
            href="/conditions-generales"
            className="text-gray-400 hover:text-white mx-2"
          >
            Conditions générales
          </a>
          <a href="/contact" className="text-gray-400 hover:text-white mx-2">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
