import { View, Text, StyleSheet } from 'react-native';
import { StatusTrabalho } from '@/types';

const CORES: Record<StatusTrabalho, string> = {
  Iniciar: '#8E8E93',
  'Em Produção': '#FF9500',
  Finalizado: '#34C759',
};

export function StatusBadge({ status }: { status: StatusTrabalho }) {
  const cor = CORES[status];
  return (
    <View style={[styles.badge, { backgroundColor: `${cor}33` }]}>
      <Text style={[styles.texto, { color: cor }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  texto: {
    fontSize: 12,
    fontWeight: '700',
  },
});
