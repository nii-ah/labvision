// src/pages/projets/ProjetCreatePage.tsx
import { useNavigate } from 'react-router-dom';
import ProjetForm from '../../components/ProjetForm';

export function ProjetCreatePage() {
  const navigate = useNavigate();

  return (
    <div className="section-light">
      <div className="max-w-3xl mx-auto px-4">
        <ProjetForm onSuccess={() => navigate('/projets')} />
      </div>
    </div>
  );
}