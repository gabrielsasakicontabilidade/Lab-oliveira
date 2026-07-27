import { View, Text, StyleSheet } from 'react-native';
import { StatusTrabalho } from '@/types';
import { cores, raio } from '@/constants/theme';

const CORES: Record<StatusTrabalho, { cor: string; fundo: string }> = {
  Iniciar: { cor: cores.neutro, fundo: cores.neutroClaro },
  'Em Produção': { cor: cores.atencao, fundo: cores.atencaoClaro },
  Finalizado: { cor: cores.sucesso, fundo: cores.sucessoClaro },
};

export function StatusBadge({ status }: { status: StatusTrabalho }) {
  const { cor, fundo } = CORES[status];
  return (
    <View style={[styles.badge, { backgroundColor: fundo }]}>
      <Text style={[styles.texto, { color: cor }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: raio.sm,
  },
  texto: {
    fontSize: 12,
    fontWeight: '700',
  },
});
