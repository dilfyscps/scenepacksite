import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScenepackCard from '../components/ScenepackCard';

const scenepacks = [
  { title: "Pluribus", img: "/images/pluribus.jpg", url: "https://example.com/pluribus" },
  { title: "A Knight of the Seven Kingdoms", img: "/images/knight.jpg", url: "#" },
  { title: "The Amazing Spider-Man", img: "/images/spiderman.jpg", url: "#" },
  { title: "Random Pack 4", img: "/images/pack4.jpg", url: "#" },
];

function Packs() {
  return (
    <div style={{ backgroundColor: '#111', minHeight: '100vh', color: 'white' }}>
      <Header />
      <main style={{ padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>All Packs</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem'
        }}>
          {scenepacks.map((pack, i) => (
            <ScenepackCard key={i} {...pack} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Packs;