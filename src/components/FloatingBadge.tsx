import React from 'react';

const FloatingBadge: React.FC = () => {
  return (
    <div className="!hidden fixed bottom-4 right-4 z-9999 pointer-events-none">
      <a
        href="https://bolt.new/"
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto block transform transition-all duration-300 hover:scale-110 hover:shadow-2xl"
        aria-label="Built with Bolt.new"
      >
        <img
          src="/white_circle_360x360.png"
          alt="Built with Bolt.new"
          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
          style={{
            filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))',
          }}
        />
      </a>
    </div>
  );
};

export default FloatingBadge;
