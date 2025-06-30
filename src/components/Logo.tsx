import React from 'react';
import { Link } from 'react-router-dom';
import { Share2 } from 'lucide-react';

const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Link to="/" className={`flex items-center gap-2 text-white ${className}`}>
      <Share2 className="w-7 h-7 text-accent-500" />
      <h1 className="font-bold tracking-tight">Nexus</h1>
    </Link>
  );
};

export default Logo;