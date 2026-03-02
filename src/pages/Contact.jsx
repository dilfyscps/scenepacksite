import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Contact() {
  return (
    <div style={{ backgroundColor: '#111', minHeight: '100vh', color: 'white' }}>
      <Header />
      <main style={{ padding: '2rem' }}>
        <h2>Contact Us</h2>
        <p style={{ color: '#ccc' }}>Email us at <a href="mailto:info@scenepacks.com" style={{ color: '#0af' }}>info@scenepacks.com</a></p>
      </main>
      <Footer />
    </div>
  );
}

export default Contact;