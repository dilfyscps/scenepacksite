import React from 'react';

function Modal({ isOpen, onClose, title, description, img, url }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}
      onClick={onClose} // close when clicking outside
    >
      <div style={{
        backgroundColor: '#111',
        padding: '2rem',
        borderRadius: '15px',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        position: 'relative'
      }}
        onClick={e => e.stopPropagation()} // prevent close on inner click
      >
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'transparent',
          fontSize: '1.5rem',
          color: 'white',
          border: 'none',
          cursor: 'pointer'
        }}>×</button>

        <h2 style={{ marginBottom: '1rem' }}>{title}</h2>
        <img src={img} alt={title} style={{ width: '100%', borderRadius: '10px', marginBottom: '1rem' }} />
        <p style={{ color: '#ccc', marginBottom: '1.5rem' }}>{description}</p>
        {url && <a href={url} target="_blank" rel="noopener noreferrer"><button>Download</button></a>}
      </div>
    </div>
  );
}

export default Modal;