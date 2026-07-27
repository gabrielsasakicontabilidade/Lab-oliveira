import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { cores, raio, sombra } from '@/constants/theme';

interface Props<T extends string> {
  opcoes: T[];
  valor: T;
  aoMudar: (valor: T) => void;
}

export function SegmentedControl<T extends string>({ opcoes, valor, aoMudar }: Props<T>) {
  return (
    <View style={styles.container}>
      {opcoes.map((opcao) => {
        const selecionado = opcao === valor;
        return (
          <TouchableOpacity
            key={opcao}
            style={[styles.opcao, selecionado && styles.opcaoSelecionada]}
            onPress={() => aoMudar(opcao)}
          >
            <Text style={[styles.texto, selecionado && styles.textoSelecionado]} numberOfLines={1}>
              {opcao}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: cores.neutroClaro,
    borderRadius: raio.sm + 1,
    padding: 2,
  },
  opcao: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: raio.sm,
    alignItems: 'center',
  },
  opcaoSelecionada: {
    backgroundColor: cores.fundo,
    ...sombra,
    shadowOpacity: 0.08,
  },
  texto: {
    fontSize: 12,
    color: cores.textoSecundario,
  },
  textoSelecionado: {
    fontWeight: '700',
    color: cores.primaria,
  },
});
