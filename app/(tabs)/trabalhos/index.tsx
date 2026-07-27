import { useState, useMemo, useLayoutEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { serverTimestamp } from 'firebase/firestore';
import { useTrabalhos } from '@/hooks/useTrabalhos';
import { atualizarTrabalho } from '@/services/firestore';
import { StatusBadge } from '@/components/StatusBadge';
import { SegmentedControl } from '@/components/SegmentedControl';
import { formatarMoeda } from '@/utils/currency';
import { formatarDataCurta } from '@/utils/date';
import { StatusTrabalho, Trabalho } from '@/types';

const FILTROS = ['Todos', 'Iniciar', 'Em Produção', 'Finalizado'] as const;
type Filtro = (typeof FILTROS)[number];

const PROXIMO_STATUS: Record<StatusTrabalho, StatusTrabalho | null> = {
  Iniciar: 'Em Produção',
  'Em Produção': 'Finalizado',
  Finalizado: null,
};

async function avancarStatus(trabalho: Trabalho) {
  const proximo = PROXIMO_STATUS[trabalho.status];
  if (!proximo) return;
  const dados: Record<string, unknown> = { status: proximo };
  if (proximo === 'Finalizado') {
    dados.finalizadoEm = serverTimestamp();
  }
  await atualizarTrabalho(trabalho.id, dados);
}

export default function ListaTrabalhosScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { trabalhos, carregando } = useTrabalhos();
  const [filtro, setFiltro] = useState<Filtro>('Todos');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => router.push('/trabalhos/novo')} style={{ paddingHorizontal: 8 }}>
          <Ionicons name="add" size={26} color="#007AFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const trabalhosFiltrados = useMemo(() => {
    if (filtro === 'Todos') return trabalhos;
    return trabalhos.filter((t) => t.status === (filtro as StatusTrabalho));
  }, [trabalhos, filtro]);

  return (
    <View style={styles.container}>
      <View style={styles.filtroContainer}>
        <SegmentedControl opcoes={[...FILTROS]} valor={filtro} aoMudar={setFiltro} />
      </View>
      <FlatList
        data={trabalhosFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.linha} onPress={() => router.push(`/trabalhos/${item.id}`)}>
            <View style={styles.topo}>
              <Text style={styles.descricao}>{item.descricao}</Text>
              <View style={styles.statusContainer}>
                <StatusBadge status={item.status} />
                {item.status !== 'Finalizado' && (
                  <TouchableOpacity
                    onPress={() => avancarStatus(item)}
                    hitSlop={8}
                    style={styles.avancarBotao}
                  >
                    <Ionicons name="arrow-forward-circle" size={24} color="#007AFF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <Text style={styles.cliente}>{item.clienteNome}</Text>
            <View style={styles.rodape}>
              <View style={styles.dataContainer}>
                <Ionicons name="calendar-outline" size={13} color="#888" />
                <Text style={styles.data}>{formatarDataCurta(item.dataEntrega ?? item.criadoEm)}</Text>
              </View>
              <Text style={styles.valor}>{formatarMoeda(item.valor)}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={!carregando ? <Text style={styles.vazio}>Nenhum trabalho ainda.</Text> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  filtroContainer: { paddingHorizontal: 16, paddingTop: 12 },
  linha: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  descricao: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  statusContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avancarBotao: { padding: 2 },
  cliente: { color: '#666' },
  rodape: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  dataContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  data: { color: '#888', fontSize: 12 },
  valor: { fontWeight: '700' },
  vazio: { textAlign: 'center', color: '#999', marginTop: 40 },
});
