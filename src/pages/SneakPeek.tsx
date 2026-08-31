import { useNavigate } from 'react-router-dom';
import { SneakPeekEntrance } from '../components/sneakPeek';
import { ROUTES } from '../constants';

export default function SneakPeek() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen">
      <SneakPeekEntrance
        initialMode="landing"
        onComplete={() => {
          navigate(ROUTES.HOME);
        }}
      />
    </div>
  );
}
