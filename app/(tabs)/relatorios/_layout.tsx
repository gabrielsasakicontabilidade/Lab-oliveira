import { Stack } from 'expo-router';

export default function RelatoriosLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Relatórios' }} />
      <Stack.Screen name="[tipo]" options={{ title: 'Relatório' }} />
    </Stack>
  );
}
