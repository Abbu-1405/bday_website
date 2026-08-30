import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ActiveCatInstance } from '../../types/catMeme';
import { CatSpawnController } from '../../services/catInteraction/CatSpawnController';
import { EasterEggService } from '../../services/catInteraction/EasterEggService';
import { CatInteractiveInstance } from './CatInteractiveInstance';

export interface CatInteractionEngineProps {
  enabled?: boolean;
}

export const CatInteractionEngine: React.FC<CatInteractionEngineProps> = ({
  enabled = true,
}) => {
  const [cats, setCats] = useState<ActiveCatInstance[]>([]);
  const controllerRef = useRef<CatSpawnController | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (!enabled) {
      if (controllerRef.current) {
        controllerRef.current.stop();
        controllerRef.current = null;
      }
      setCats([]);
      EasterEggService.getInstance().updateActiveScreenCats([]);
      return;
    }

    // Initialize the spawn controller
    const controller = new CatSpawnController();
    controllerRef.current = controller;

    try {
      controller.start({
        onCatsUpdated: (updatedCats) => {
          setCats(updatedCats);
          EasterEggService.getInstance().updateActiveScreenCats(
            updatedCats.map((c) => c.catDefinitionId)
          );
        },
      });
    } catch {
      // Fail silently to safeguard core Starlit Letters functionality
    }

    return () => {
      if (controllerRef.current) {
        controllerRef.current.stop();
        controllerRef.current = null;
      }
      setCats([]);
      EasterEggService.getInstance().updateActiveScreenCats([]);
    };
  }, [enabled]);

  // Handle route navigation changes safely without leaving stale cats
  useEffect(() => {
    if (controllerRef.current && enabled) {
      try {
        controllerRef.current.handleRouteChange();
      } catch {
        // Fail silently
      }
    }
  }, [location.pathname, enabled]);

  if (!enabled || cats.length === 0) {
    return null;
  }

  return (
    <div
      id="cat-interaction-engine-layer"
      className="fixed inset-0 pointer-events-none z-20 overflow-hidden"
      aria-hidden="true"
    >
      {cats.map((cat) => (
        <CatInteractiveInstance key={cat.id} instance={cat} />
      ))}
    </div>
  );
};
