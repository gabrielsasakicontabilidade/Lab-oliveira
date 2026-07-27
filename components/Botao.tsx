import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio, espacamento, sombra } from '@/constants/theme';

type Variante = 'primario' | 'secundario' | 'perigo';

interface Props {
  texto: string;
  onPress: () => void;
  variante?: Variante;
  icone?: keyof typeof Ionicons.glyphMap;
  carregando?: boolean;
  desabilitado?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Botao({ texto, onPress, variante = 'primario', icone, carregando, desabilitado, style }: Props) {
  const estiloVariante =
    variante === 'secundario'
      ? { backgroundColor: cores.branco, borderWidth: 1.5, borderColor: cores.primaria }
      : variante === 'perigo'
        ? { backgroundColor: cores.perigo }
        : { backgroundColor: cores.primaria };

  const corTexto = variante === 'secundario' ? cores.primaria : cores.branco;

  return (
    <TouchableOpacity
      style={[styles.base, estiloVariante, (desabilitado || carregando) && styles.desabilitado, style]}
      onPress={onPress}
      disabled={desabilitado || carregando}
      activeOpacity={0.8}
    >
      {carregando ? (
        <ActivityIndicator size="small" color={corTexto} />
      ) : (
        <>
          {icone && <Ionicons name={icone} size={18} color={corTexto} />}
          <Text style={[styles.texto, { color: corTexto }]}>{texto}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    gap: espacamento.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: raio.md,
    paddingVertical: 14,
    paddingHorizontal: espacamento.md,
    ...sombra,
  },
  desabilitado: { opacity: 0.5 },
  texto: { fontWeight: '700', fontSize: 16 },
});
