import { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTrabalhos } from '@/hooks/useTrabalhos';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/StatusBadge';
import { formatarMoeda } from '@/utils/currency';

function saudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function InicioScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { trabalhos, carregando } = useTrabalhos();

  const nome = user?.email ? user.email.split('@')[0] : '';

  const { receitaMes, iniciados, emProducao, finalizados, ultimosTrabalhos } = useMemo(() => {
    const agora = new Date();
    const receita = trabalhos
      .filter((t) => {
        if (!t.finalizadoEm) return false;
        const data = new Date(t.finalizadoEm);
        return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear();
      })
      .reduce((soma, t) => soma + t.valor, 0);

    return {
      receitaMes: receita,
      iniciados: trabalhos.filter((t) => t.status === 'Iniciar').length,
      emProducao: trabalhos.filter((t) => t.status === 'Em Produção').length,
      finalizados: trabalhos.filter((t) => t.status === 'Finalizado').length,
      ultimosTrabalhos: trabalhos.slice(0, 5),
    };
  }, [trabalhos]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>
      <View>
        <Text style={styles.saudacao}>
          {saudacao()}
          {nome ? `, ${nome}` : ''} 👋
        </Text>
        <Text style={styles.subtitulo}>Laboratório Oliveira</Text>
      </View>

      <View style={styles.cardReceita}>
        <View style={{ flex: 1 }}>
          <Text style={styles.receitaRotulo}>Receita do mês</Text>
          <Text style={styles.receitaValor}>{formatarMoeda(receitaMes)}</Text>
        </View>
        <Ionicons name="stats-chart" size={28} color="#fff" />
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#8E8E9315' }]}>
          <Text style={[styles.statNumero, { color: '#8E8E93' }]}>{iniciados}</Text>
          <Text style={styles.statRotulo}>Iniciados</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FF950015' }]}>
          <Text style={[styles.statNumero, { color: '#FF9500' }]}>{emProducao}</Text>
          <Text style={styles.statRotulo}>Em produção</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#34C75915' }]}>
          <Text style={[styles.statNumero, { color: '#34C759' }]}>{finalizados}</Text>
          <Text style={styles.statRotulo}>Finalizados</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.botaoNovo} onPress={() => router.push('/trabalhos/novo')}>
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.botaoNovoTexto}>Novo Trabalho</Text>
      </TouchableOpacity>

      <View style={styles.secaoHeader}>
        <Text style={styles.secaoTitulo}>Últimos trabalhos</Text>
        <TouchableOpacity onPress={() => router.push('/trabalhos')}>
          <Text style={styles.verTodos}>Ver todos</Text>
        </TouchableOpacity>
      </View>

      {ultimosTrabalhos.length === 0 && !carregando ? (
        <Text style={styles.vazio}>Nenhum trabalho ainda.</Text>
      ) : (
        <View style={{ gap: 8 }}>
          {ultimosTrabalhos.map((t) => (
            <TouchableOpacity key={t.id} style={styles.linha} onPress={() => router.push(`/trabalhos/${t.id}`)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.linhaCliente}>{t.clienteNome}</Text>
                <Text style={styles.linhaDescricao}>{t.descricao}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <StatusBadge status={t.status} />
                <Text style={styles.linhaValor}>{formatarMoeda(t.valor)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  conteudo: { padding: 16, gap: 20 },
  saudacao: { fontSize: 22, fontWeight: '700' },
  subtitulo: { color: '#666', marginTop: 2 },
  cardReceita: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  receitaRotulo: { color: '#E5F1FF', fontSize: 13, marginBottom: 4 },
  receitaValor: { color: '#fff', fontSize: 26, fontWeight: '700' },
  statsContainer: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  statNumero: { fontSize: 22, fontWeight: '700' },
  statRotulo: { fontSize: 12, color: '#666', marginTop: 2 },
  botaoNovo: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 14,
  },
  botaoNovoTexto: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secaoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  secaoTitulo: { fontSize: 15, fontWeight: '700' },
  verTodos: { color: '#007AFF', fontSize: 13 },
  linha: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linhaCliente: { fontWeight: '600', fontSize: 15 },
  linhaDescricao: { color: '#666', fontSize: 13, marginTop: 2 },
  linhaValor: { fontWeight: '700', fontSize: 13 },
  vazio: { textAlign: 'center', color: '#999', marginTop: 12 },
});
