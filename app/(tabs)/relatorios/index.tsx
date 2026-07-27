import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CampoData } from '@/components/CampoData';
import { TipoRelatorio } from '@/services/relatorios';
import { inicioDoDia, fimDoDia } from '@/utils/date';

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
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 20 }}>
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
            <Ionicons name={item.icone} size={26} color="#007AFF" />
            <Text style={styles.cardTexto}>{item.titulo}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  periodoContainer: { flexDirection: 'row', gap: 12 },
  aviso: { color: '#999', fontSize: 12 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47%',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    gap: 10,
    alignItems: 'flex-start',
  },
  cardTexto: { fontSize: 14, fontWeight: '600' },
});
