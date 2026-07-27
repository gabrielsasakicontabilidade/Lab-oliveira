import { Stack } from 'expo-router';

export default function TrabalhosLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Trabalhos' }} />
      <Stack.Screen name="novo" options={{ presentation: 'modal', title: 'Novo Trabalho' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalhe do Trabalho' }} />
    </Stack>
  );
}
