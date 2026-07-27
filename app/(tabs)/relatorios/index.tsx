import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CampoData } from '@/components/CampoData';
import { TipoRelatorio } from '@/services/relatorios';
import { inicioDoDia, fimDoDia } from '@/utils/date';
import { cores, espacamento, raio, sombra, larguraMaximaTela } from '@/constants/theme';

const TIPOS: { tipo: TipoRelatorio; titulo: string; icone: keyof typeof Ionicons.glyphMap }[] = [
  { tipo: 'producao-periodo', titulo: 'Produção por período', icone: 'bar-chart-outline' },
  { tipo: 'faturamento', titulo: 'Faturamento', icone: 'cash-outline' },
  { tipo: 'producao-cliente', titulo: 'Produção por cliente', icone: 'people-outline' },
  { tipo: 'tipos-servico', titulo: 'Tipos de serviço', icone: 'pie-chart-outline' },
  { tipo: 'finalizados', titulo: 'Serviços finalizados', icone: 'checkmark-circle-outline' },
  { tipo: 'andamento', titulo: 'Serviços em andamento', icone: 'time-outline' },
];

function primeiroDiaDoMes(): Date {
  const agora = new Date();
  return new Date(agora.getFullYear(), agora.getMonth(), 1);
}

export default function RelatoriosScreen() {
  const router = useRouter();
  const [dataInicio, setDataInicio] = useState(primeiroDiaDoMes());
  const [dataFim, setDataFim] = useState(new Date());

  function abrirRelatorio(tipo: TipoRelatorio) {
    router.push({
      pathname: '/relatorios/[tipo]',
      params: { tipo, inicio: String(inicioDoDia(dataInicio)), fim: String(fimDoDia(dataFim)) },
    });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>
      <View style={styles.periodoContainer}>
        <View style={{ flex: 1 }}>
          <CampoData rotulo="De" valor={dataInicio} aoMudar={setDataInicio} />
        </View>
        <View style={{ flex: 1 }}>
          <CampoData rotulo="Até" valor={dataFim} aoMudar={setDataFim} />
        </View>
      </View>

      <Text style={styles.aviso}>
        "Serviços em andamento" mostra o estado atual e não depende do período selecionado.
      </Text>

      <View style={styles.grade}>
        {TIPOS.map((item) => (
          <TouchableOpacity key={item.tipo} style={styles.card} onPress={() => abrirRelatorio(item.tipo)}>
            <View style={styles.cardIconeCirculo}>
              <Ionicons name={item.icone} size={22} color={cores.primaria} />
            </View>
            <Text style={styles.cardTexto}>{item.titulo}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundoTela },
  conteudo: {
    padding: espacamento.md,
    gap: espacamento.lg,
    maxWidth: larguraMaximaTela,
    width: '100%',
    alignSelf: 'center',
  },
  periodoContainer: { flexDirection: 'row', gap: espacamento.sm + 4 },
  aviso: { color: cores.textoSecundario, fontSize: 12 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: espacamento.sm + 4 },
  card: {
    width: '47%',
    backgroundColor: cores.fundo,
    borderRadius: raio.md,
    padding: 16,
    gap: 10,
    alignItems: 'flex-start',
    ...sombra,
  },
  cardIconeCirculo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: cores.primariaClara,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTexto: { fontSize: 14, fontWeight: '600', color: cores.texto },
});
