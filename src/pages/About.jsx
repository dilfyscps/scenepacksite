import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function About() {
  return (
    <div style={{ backgroundColor: '#111', minHeight: '100vh', color: 'white' }}>
      <Header />
      <main style={{ padding: '2rem' }}>
        <h2>About Scenepacks</h2>
        <p style={{ color: '#ccc' }}>We create curated scenepacks for editors, designers, and content creators. Each pack is carefully crafted with high-quality assets.</p>
      </main>
      <Footer />
    </div>
  );
}

export default About;