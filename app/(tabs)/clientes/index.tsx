import { useLayoutEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useClientes } from '@/hooks/useClientes';
import { EstadoVazio } from '@/components/EstadoVazio';
import { cores, espacamento, raio, sombra, larguraMaximaTela } from '@/constants/theme';

export default function ListaClientesScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { clientes, carregando } = useClientes();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => router.push('/clientes/novo')} style={{ paddingHorizontal: 8 }}>
          <Ionicons name="add" size={26} color={cores.primaria} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <FlatList
        data={clientes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.linha} onPress={() => router.push(`/clientes/${item.id}`)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTexto}>{item.nome.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.tipo}>{item.tipo}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={cores.borda} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !carregando ? <EstadoVazio icone="people-outline" texto="Nenhum cliente ainda." /> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundoTela },
  lista: {
    padding: espacamento.md,
    gap: espacamento.sm,
    maxWidth: larguraMaximaTela,
    width: '100%',
    alignSelf: 'center',
  },
  linha: {
    backgroundColor: cores.fundo,
    borderRadius: raio.md,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.sm + 2,
    ...sombra,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: cores.primariaClara,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: { color: cores.primaria, fontWeight: '700', fontSize: 16 },
  nome: { fontSize: 16, fontWeight: '600', color: cores.texto },
  tipo: { color: cores.textoSecundario, fontSize: 13, marginTop: 1 },
});
