import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Cliente } from '@/types';

interface Props {
  clientes: Cliente[];
  clienteId: string;
  aoSelecionar: (clienteId: string) => void;
}

export function SeletorCliente({ clientes, clienteId, aoSelecionar }: Props) {
  const [aberto, setAberto] = useState(false);
  const selecionado = clientes.find((c) => c.id === clienteId);

  return (
    <>
      <TouchableOpacity style={styles.campo} onPress={() => setAberto(true)}>
        <Text style={selecionado ? styles.texto : styles.placeholder}>
          {selecionado ? selecionado.nome : 'Selecione...'}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#999" />
      </TouchableOpacity>

      <Modal visible={aberto} animationType="slide" transparent onRequestClose={() => setAberto(false)}>
        <TouchableOpacity style={styles.fundo} activeOpacity={1} onPress={() => setAberto(false)}>
          <View style={styles.folha}>
            <Text style={styles.folhaTitulo}>Selecionar cliente</Text>
            <FlatList
              data={clientes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => {
                    aoSelecionar(item.id);
                    setAberto(false);
                  }}
                >
                  <Text style={styles.itemTexto}>{item.nome}</Text>
                  {item.id === clienteId && <Ionicons name="checkmark" size={20} color="#007AFF" />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.vazio}>Nenhum cliente cadastrado.</Text>}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  campo: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  texto: { fontSize: 16, color: '#000' },
  placeholder: { fontSize: 16, color: '#999' },
  fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  folha: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '70%',
  },
  folhaTitulo: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  itemTexto: { fontSize: 16 },
  vazio: { textAlign: 'center', color: '#999', paddingVertical: 20 },
});
