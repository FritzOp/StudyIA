import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import BottomNav from '@/components/BottomNav';
import { RemindersProvider } from '@/context/RemindersContext';
import { useTheme } from '@/context/ThemeContext';
import { useProfile } from '@/hooks/useStudyData';
import { activeFaculties } from '@/lib/careers';

/** Pinta la app con el color de la carrera; al salir de la cuenta vuelve al color original. */
function CareerTheme() {
  const { setCareerFaculties } = useTheme();
  const key = activeFaculties(useProfile()).join(',');

  useEffect(() => {
    setCareerFaculties(key ? key.split(',') : []);
  }, [key, setCareerFaculties]);

  useEffect(() => () => setCareerFaculties([]), [setCareerFaculties]);
  return null;
}

export default function TabsLayout() {
  // Los recordatorios y el tema de la carrera viven aquí porque solo tienen sentido con un
  // usuario dentro de la app.
  return (
    <RemindersProvider>
      <CareerTheme />
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
