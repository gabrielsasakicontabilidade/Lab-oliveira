import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, espacamento } from '@/constants/theme';

interface Props {
  icone: keyof typeof Ionicons.glyphMap;
  texto: string;
}

export function EstadoVazio({ icone, texto }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconeCirculo}>
        <Ionicons name={icone} size={28} color={cores.neutro} />
      </View>
      <Text style={styles.texto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: espacamento.xl, gap: espacamento.sm },
  iconeCirculo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: cores.neutroClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: { color: cores.textoSecundario, fontSize: 14, textAlign: 'center' },
});
