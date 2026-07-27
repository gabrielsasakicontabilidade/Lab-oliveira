import { useLayoutEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useClientes } from '@/hooks/useClientes';

export default function ListaClientesScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { clientes, carregando } = useClientes();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => router.push('/clientes/novo')} style={{ paddingHorizontal: 8 }}>
          <Ionicons name="add" size={26} color="#007AFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <FlatList
        data={clientes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.linha} onPress={() => router.push(`/clientes/${item.id}`)}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.tipo}>{item.tipo}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={!carregando ? <Text style={styles.vazio}>Nenhum cliente ainda.</Text> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  linha: { backgroundColor: '#F2F2F7', borderRadius: 12, padding: 14, gap: 2 },
  nome: { fontSize: 16, fontWeight: '600' },
  tipo: { color: '#666' },
  vazio: { textAlign: 'center', color: '#999', marginTop: 40 },
});
