import React from 'react';
import { Tabs } from 'expo-router';
import BottomNav from '@/components/BottomNav';
import { RemindersProvider } from '@/context/RemindersContext';

export default function TabsLayout() {
  // Los recordatorios viven aquí porque solo tienen sentido con un usuario dentro de la app.
  return (
    <RemindersProvider>
      <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <BottomNav {...props} />}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="materias" />
        <Tabs.Screen name="escanear" />
        <Tabs.Screen name="practica" />
        <Tabs.Screen name="perfil" />
      </Tabs>
    </RemindersProvider>
  );
}
