import { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTrabalhos } from '@/hooks/useTrabalhos';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/StatusBadge';
import { EstadoVazio } from '@/components/EstadoVazio';
import { Botao } from '@/components/Botao';
import { formatarMoeda } from '@/utils/currency';
import { cores, espacamento, raio, sombra } from '@/constants/theme';

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
        <View style={styles.receitaIconeCirculo}>
          <Ionicons name="stats-chart" size={22} color={cores.branco} />
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: cores.neutroClaro }]}>
          <Text style={[styles.statNumero, { color: cores.neutro }]}>{iniciados}</Text>
          <Text style={styles.statRotulo}>Iniciados</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: cores.atencaoClaro }]}>
          <Text style={[styles.statNumero, { color: cores.atencao }]}>{emProducao}</Text>
          <Text style={styles.statRotulo}>Em produção</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: cores.sucessoClaro }]}>
          <Text style={[styles.statNumero, { color: cores.sucesso }]}>{finalizados}</Text>
          <Text style={styles.statRotulo}>Finalizados</Text>
        </View>
      </View>

      <Botao texto="Novo Trabalho" icone="add" onPress={() => router.push('/trabalhos/novo')} />

      <View style={styles.secaoHeader}>
        <Text style={styles.secaoTitulo}>Últimos trabalhos</Text>
        <TouchableOpacity onPress={() => router.push('/trabalhos')}>
          <Text style={styles.verTodos}>Ver todos</Text>
        </TouchableOpacity>
      </View>

      {ultimosTrabalhos.length === 0 && !carregando ? (
        <EstadoVazio icone="clipboard-outline" texto="Nenhum trabalho ainda." />
      ) : (
        <View style={{ gap: espacamento.sm }}>
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
  container: { flex: 1, backgroundColor: cores.fundoTela },
  conteudo: { padding: espacamento.md, gap: espacamento.lg, maxWidth: 640, width: '100%', alignSelf: 'center' },
  saudacao: { fontSize: 22, fontWeight: '700', color: cores.texto },
  subtitulo: { color: cores.textoSecundario, marginTop: 2 },
  cardReceita: {
    backgroundColor: cores.primaria,
    borderRadius: raio.lg,
    padding: espacamento.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    ...sombra,
    shadowColor: cores.primariaEscura,
    shadowOpacity: 0.25,
  },
  receitaRotulo: { color: cores.primariaClara, fontSize: 13, marginBottom: 4 },
  receitaValor: { color: cores.branco, fontSize: 26, fontWeight: '700' },
  receitaIconeCirculo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: { flexDirection: 'row', gap: espacamento.sm },
  statCard: { flex: 1, borderRadius: raio.md, padding: 12, alignItems: 'center' },
  statNumero: { fontSize: 22, fontWeight: '700' },
  statRotulo: { fontSize: 12, color: cores.textoSecundario, marginTop: 2 },
  secaoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  secaoTitulo: { fontSize: 15, fontWeight: '700', color: cores.texto },
  verTodos: { color: cores.primaria, fontSize: 13, fontWeight: '600' },
  linha: {
    backgroundColor: cores.fundo,
    borderRadius: raio.md,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...sombra,
  },
  linhaCliente: { fontWeight: '600', fontSize: 15, color: cores.texto },
  linhaDescricao: { color: cores.textoSecundario, fontSize: 13, marginTop: 2 },
  linhaValor: { fontWeight: '700', fontSize: 13, color: cores.texto },
});
