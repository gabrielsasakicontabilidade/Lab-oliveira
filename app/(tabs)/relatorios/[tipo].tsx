import { useMemo, useLayoutEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTrabalhos } from '@/hooks/useTrabalhos';
import { calcularRelatorio, TipoRelatorio } from '@/services/relatorios';
import { gerarECompartilharRelatorio } from '@/services/pdf';
import { formatarDataCurta } from '@/utils/date';

export default function RelatorioScreen() {
  const { tipo, inicio, fim } = useLocalSearchParams<{ tipo: TipoRelatorio; inicio: string; fim: string }>();
  const navigation = useNavigation();
  const { trabalhos } = useTrabalhos();
  const [gerando, setGerando] = useState(false);

  const dataInicio = Number(inicio);
  const dataFim = Number(fim);

  const resultado = useMemo(
    () => calcularRelatorio(tipo, trabalhos, dataInicio, dataFim),
    [tipo, trabalhos, dataInicio, dataFim]
  );

  useLayoutEffect(() => {
    navigation.setOptions({ title: resultado.titulo });
  }, [resultado.titulo]);

  async function gerarPDF() {
    setGerando(true);
    try {
      await gerarECompartilharRelatorio(resultado, dataInicio, dataFim);
    } finally {
      setGerando(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 20 }}>
      <Text style={styles.periodo}>
        {formatarDataCurta(dataInicio)} até {formatarDataCurta(dataFim)}
      </Text>

      <View style={styles.resumoContainer}>
        {resultado.resumo.map((card) => (
          <View key={card.rotulo} style={styles.resumoCard}>
            <Text style={styles.resumoValor}>{card.valor}</Text>
            <Text style={styles.resumoRotulo}>{card.rotulo}</Text>
          </View>
        ))}
      </View>

      {resultado.linhas.length > 0 ? (
        <View style={{ gap: 8 }}>
          {resultado.linhas.map((linha, indice) => (
            <View key={indice} style={styles.linha}>
              <View style={{ flex: 1 }}>
                <Text style={styles.linhaPrincipal}>{linha.principal}</Text>
                {linha.secundario ? <Text style={styles.linhaSecundario}>{linha.secundario}</Text> : null}
              </View>
              <Text style={styles.linhaValor}>{linha.valor}</Text>
            </View>
          ))}
        </View>
      ) : resultado.linhasVazioTexto ? (
        <Text style={styles.vazio}>{resultado.linhasVazioTexto}</Text>
      ) : null}

      <TouchableOpacity style={styles.botaoPdf} onPress={gerarPDF} disabled={gerando}>
        <Ionicons name="document-text-outline" size={18} color="#fff" />
        <Text style={styles.botaoPdfTexto}>{gerando ? 'Gerando...' : 'Gerar Relatório (PDF)'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  periodo: { color: '#666', fontSize: 13 },
  resumoContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  resumoCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  resumoValor: { fontSize: 18, fontWeight: '700' },
  resumoRotulo: { fontSize: 11, color: '#666', marginTop: 4, textAlign: 'center' },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 12,
  },
  linhaPrincipal: { fontWeight: '600', fontSize: 14 },
  linhaSecundario: { color: '#666', fontSize: 12, marginTop: 2 },
  linhaValor: { fontWeight: '700', fontSize: 14 },
  vazio: { textAlign: 'center', color: '#999', marginTop: 20 },
  botaoPdf: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 14,
  },
  botaoPdfTexto: { color: '#fff', fontWeight: '700' },
});
