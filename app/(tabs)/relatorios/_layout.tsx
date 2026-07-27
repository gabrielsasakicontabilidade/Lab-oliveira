import { Stack } from 'expo-router';
import { cores } from '@/constants/theme';

export default function RelatoriosLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: cores.fundo },
        headerTintColor: cores.primaria,
        headerTitleStyle: { color: cores.texto, fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Relatórios' }} />
      <Stack.Screen name="[tipo]" options={{ title: 'Relatório' }} />
    </Stack>
  );
}
