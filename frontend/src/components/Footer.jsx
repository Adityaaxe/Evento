import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black  text-white p-6">
      <div className="container mx-auto mt-10 flex border-t border-gray-700 flex-col items-center text-center">
        {/* Contact Us Form */}
        <div className="mb-6 mt-6 w-full max-w-md">
          <h3 className="text-xl font-bold mb-2">Contact Us</h3>
          <form className="w-full">
            <div className="mb-2">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full p-2 rounded text-black bg-white"
              />
            </div>
            <div className="mb-2">
              <input
                type="email"
                placeholder="Your Email"
                className="w-full p-2 rounded text-black bg-white"
              />
            </div>
            <div className="mb-2">
              <textarea
                placeholder="Message"
                className="w-full p-2 rounded text-black bg-white"
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            >
              SUBMIT
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="mb-6">
          <h3 className="text-lg font-bold">Contact Us On</h3>
          <p className="mt-2">Email: support@example.com</p>
          <p>Phone: +123 456 7890</p>
        </div>

        {/* Privacy & Terms */}
        <div className="border-t border-gray-700 mt-6 pt-6 w-full text-center">
          <p>
            <a href="/privacy-policy" className="hover:text-gray-400">Privacy Policy</a> | 
            <a href="/faq" className="hover:text-gray-400"> FAQ</a> | 
            <a href="/terms-of-use" className="hover:text-gray-400"> Terms of Use</a>
          </p>
          <p className="mt-2">
            © 2023 Programming Visuals and Elements are the property of Anime Sekai, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
