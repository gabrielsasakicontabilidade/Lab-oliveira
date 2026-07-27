import { useState, useMemo, useLayoutEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { serverTimestamp } from 'firebase/firestore';
import { useTrabalhos } from '@/hooks/useTrabalhos';
import { atualizarTrabalho } from '@/services/firestore';
import { StatusBadge } from '@/components/StatusBadge';
import { SegmentedControl } from '@/components/SegmentedControl';
import { EstadoVazio } from '@/components/EstadoVazio';
import { formatarMoeda } from '@/utils/currency';
import { formatarDataCurta } from '@/utils/date';
import { cores, espacamento, raio, sombra, larguraMaximaTela } from '@/constants/theme';
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
          <Ionicons name="add" size={26} color={cores.primaria} />
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
        contentContainerStyle={styles.lista}
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
                    <Ionicons name="arrow-forward-circle" size={24} color={cores.primaria} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <Text style={styles.cliente}>{item.clienteNome}</Text>
            <View style={styles.rodape}>
              <View style={styles.dataContainer}>
                <Ionicons name="calendar-outline" size={13} color={cores.textoSecundario} />
                <Text style={styles.data}>{formatarDataCurta(item.dataEntrega ?? item.criadoEm)}</Text>
              </View>
              <Text style={styles.valor}>{formatarMoeda(item.valor)}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !carregando ? <EstadoVazio icone="clipboard-outline" texto="Nenhum trabalho ainda." /> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundoTela },
  filtroContainer: {
    paddingHorizontal: espacamento.md,
    paddingTop: espacamento.sm + 4,
    maxWidth: larguraMaximaTela,
    width: '100%',
    alignSelf: 'center',
  },
  lista: {
    padding: espacamento.md,
    gap: espacamento.sm + 2,
    maxWidth: larguraMaximaTela,
    width: '100%',
    alignSelf: 'center',
  },
  linha: {
    backgroundColor: cores.fundo,
    borderRadius: raio.md,
    padding: 14,
    gap: 4,
    ...sombra,
  },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  descricao: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8, color: cores.texto },
  statusContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avancarBotao: { padding: 2 },
  cliente: { color: cores.textoSecundario },
  rodape: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  dataContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  data: { color: cores.textoSecundario, fontSize: 12 },
  valor: { fontWeight: '700', color: cores.texto },
});
