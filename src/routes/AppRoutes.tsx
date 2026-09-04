import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts';
import { ProtectedRoute } from '../components';
import { ROUTES } from '../constants';
import {
  Landing,
  Login,
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
  NotificationHistory,
  Admin,
} from '../pages';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTES.LANDING} element={<Landing />} />
      <Route path={ROUTES.LOGIN} element={<Login />} />

      {/* Protected Main Application Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
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
        <Route path={ROUTES.NOTIFICATIONS} element={<NotificationHistory />} />
        <Route path="/letters" element={<Navigate to={ROUTES.OPEN_WHEN} replace />} />
        <Route path="/notes" element={<Navigate to={ROUTES.NOTES_365} replace />} />
      </Route>

      {/* Admin Protected Route (Retains dedicated admin authorization security) */}
      <Route
        element={
          <ProtectedRoute requireAdmin>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.ADMIN} element={<Admin />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to={ROUTES.LANDING} replace />} />
    </Routes>
  );
};
