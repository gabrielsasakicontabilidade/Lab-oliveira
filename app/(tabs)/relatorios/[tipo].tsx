import { useMemo, useLayoutEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useTrabalhos } from '@/hooks/useTrabalhos';
import { calcularRelatorio, TipoRelatorio } from '@/services/relatorios';
import { gerarECompartilharRelatorio } from '@/services/pdf';
import { formatarDataCurta } from '@/utils/date';
import { Botao } from '@/components/Botao';
import { cores, espacamento, raio, sombra, larguraMaximaTela } from '@/constants/theme';

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
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>
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
        <View style={{ gap: espacamento.sm }}>
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

      <Botao
        texto={gerando ? 'Gerando...' : 'Gerar Relatório (PDF)'}
        icone="document-text-outline"
        onPress={gerarPDF}
        carregando={gerando}
      />
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
  periodo: { color: cores.textoSecundario, fontSize: 13 },
  resumoContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: espacamento.sm + 2 },
  resumoCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: cores.fundo,
    borderRadius: raio.md,
    padding: 14,
    alignItems: 'center',
    ...sombra,
  },
  resumoValor: { fontSize: 18, fontWeight: '700', color: cores.texto },
  resumoRotulo: { fontSize: 11, color: cores.textoSecundario, marginTop: 4, textAlign: 'center' },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: cores.fundo,
    borderRadius: raio.sm + 2,
    padding: 12,
    ...sombra,
  },
  linhaPrincipal: { fontWeight: '600', fontSize: 14, color: cores.texto },
  linhaSecundario: { color: cores.textoSecundario, fontSize: 12, marginTop: 2 },
  linhaValor: { fontWeight: '700', fontSize: 14, color: cores.texto },
  vazio: { textAlign: 'center', color: cores.textoSecundario, marginTop: 20 },
});
