import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts';
import { ProtectedRoute } from '../components';
import { ROUTES } from '../constants';
import {
  Home,
  Journey,
  SneakPeek,
  Adore,
  Moments,
  Notes365,
  OpenWhen,
  Wishes,
  SecretVault,
  WhatAmIToYou,
  Reflections,
  Bts,
  Settings,
  Admin,
} from '../pages';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.JOURNEY} element={<Journey />} />
        <Route path={ROUTES.SNEAK_PEEK} element={<SneakPeek />} />
        <Route path={ROUTES.ADORE} element={<Adore />} />
        <Route path={ROUTES.MOMENTS} element={<Moments />} />
        <Route path={ROUTES.NOTES_365} element={<Notes365 />} />
        <Route path={ROUTES.OPEN_WHEN} element={<OpenWhen />} />
        <Route path={ROUTES.WISHES} element={<Wishes />} />
        <Route path={ROUTES.WHAT_AM_I_TO_YOU} element={<WhatAmIToYou />} />
        <Route path={ROUTES.REFLECTIONS} element={<Reflections />} />
        <Route path={ROUTES.BTS} element={<Bts />} />

        <Route path={ROUTES.SECRET_VAULT} element={<SecretVault />} />
        <Route path={ROUTES.SETTINGS} element={<Settings />} />

        {/* Protected Routes */}
        <Route
          path={ROUTES.ADMIN}
          element={
            <ProtectedRoute requireAdmin>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};
