import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScenepackCard from '../components/ScenepackCard';
import Modal from '../components/Modal';

const packData = {
  dilfyscps: {
    title: "DILFYSCPS",
    description: "DILFYSCPS contains multiple scenepacks curated for editors and creators.",
    scenepacks: [
      { title: "Pack 1", img: "/images/dilfyscps1.jpg", description: "Description for Pack 1", url: "#" },
      { title: "Pack 2", img: "/images/dilfyscps2.jpg", description: "Description for Pack 2", url: "#" },
      { title: "Pack 3", img: "/images/dilfyscps3.jpg", description: "Description for Pack 3", url: "#" },
    ],
  },
  cvmscps: {
    title: "CVMSCPS",
    description: "CVMSCPS contains cinematic scenepacks for video creators.",
    scenepacks: [
      { title: "Pack A", img: "/images/cvmscps1.jpg", description: "Description for Pack A", url: "#" },
      { title: "Pack B", img: "/images/cvmscps2.jpg", description: "Description for Pack B", url: "#" },
      { title: "Pack C", img: "/images/cvmscps3.jpg", description: "Description for Pack C", url: "#" },
    ],
  },
};

function PackDetail() {
  const { packId } = useParams();
  const pack = packData[packId];
  const [selectedPack, setSelectedPack] = useState(null);

  if (!pack) {
    return (
      <div style={{ backgroundColor: '#0d0d0d', color: 'white', minHeight: '100vh' }}>
        <Header />
        <main style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Pack Not Found</h2>
          <p style={{ color: '#ccc' }}>The pack you are looking for does not exist.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0d0d0d', color: 'white', minHeight: '100vh' }}>
      <Header />
      <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>{pack.title}</h2>
        <p style={{ color: '#ccc', textAlign: 'center', marginBottom: '2rem' }}>{pack.description}</p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
        }}>
          {pack.scenepacks.map((sp, i) => (
            <div key={i} onClick={() => setSelectedPack(sp)}>
              <ScenepackCard title={sp.title} img={sp.img} url="#" />
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedPack && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedPack(null)}
            title={selectedPack.title}
            description={selectedPack.description}
            img={selectedPack.img}
            url={selectedPack.url}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default PackDetail;