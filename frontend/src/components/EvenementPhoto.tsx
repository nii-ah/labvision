import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { evenementService } from '../services/evenement.service';

interface Props {
  id: number;
  alt: string;
  className?: string;
  version?: number;
}

export default function EvenementPhoto({ id, alt, className = '', version = 0 }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [echec, setEchec] = useState(false);

  useEffect(() => {
    let url: string | null = null;
    let annule = false;
    setSrc(null);
    setEchec(false);

    evenementService
      .getPhotoBlob(id)
      .then((blob) => {
        if (annule) return;
        url = URL.createObjectURL(blob);
        setSrc(url);
      })
      .catch(() => !annule && setEchec(true));

    return () => {
      annule = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id, version]);

  if (echec) {
    return (
      <div className={`flex items-center justify-center bg-[#F8F9FA] ${className}`}>
        <ImageOff className="w-6 h-6 text-[#7a969f]" />
      </div>
    );
  }
  if (!src) return <div className={`animate-pulse bg-[#F8F9FA] ${className}`} />;
  return <img src={src} alt={alt} className={`object-cover ${className}`} />;
}