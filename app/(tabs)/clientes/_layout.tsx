import { Stack } from 'expo-router';
import { cores } from '@/constants/theme';

export default function ClientesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: cores.fundo },
        headerTintColor: cores.primaria,
        headerTitleStyle: { color: cores.texto, fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Clientes' }} />
      <Stack.Screen name="novo" options={{ presentation: 'modal', title: 'Novo Cliente' }} />
      <Stack.Screen name="[id]" options={{ title: 'Cliente' }} />
    </Stack>
  );
}
