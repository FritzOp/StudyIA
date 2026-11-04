import React from 'react';
import { Tabs } from 'expo-router';
import BottomNav from '@/components/BottomNav';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <BottomNav {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="materias" />
      <Tabs.Screen name="escanear" />
      <Tabs.Screen name="practica" />
      <Tabs.Screen name="perfil" />
    </Tabs>
  );
}
