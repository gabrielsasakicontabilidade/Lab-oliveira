import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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
    backgroundColor: '#E5E5EA',
    borderRadius: 9,
    padding: 2,
  },
  opcao: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 7,
    alignItems: 'center',
  },
  opcaoSelecionada: {
    backgroundColor: '#FFFFFF',
  },
  texto: {
    fontSize: 12,
    color: '#000',
  },
  textoSelecionado: {
    fontWeight: '600',
  },
});
