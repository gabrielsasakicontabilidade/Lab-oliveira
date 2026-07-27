import { useState, useLayoutEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useClientes } from '@/hooks/useClientes';
import { useTrabalhos } from '@/hooks/useTrabalhos';
import { useFechamentosDoCliente } from '@/hooks/useFechamentosDoCliente';
import { useArquivosDoCliente } from '@/hooks/useArquivosDoCliente';
import { excluirCliente, fecharMes } from '@/services/firestore';
import { gerarECompartilharFechamento } from '@/services/pdf';
import { formatarMoeda } from '@/utils/currency';
import { nomeMesAno } from '@/utils/date';
import { ArquivosCliente } from '@/components/ArquivosCliente';
import { alertar } from '@/components/AlertaGlobal';

export default function DetalheClienteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();

  const { clientes } = useClientes();
  const { trabalhos } = useTrabalhos();
  const cliente = clientes.find((c) => c.id === id);
  const fechamentos = useFechamentosDoCliente(id ?? '');
  const arquivos = useArquivosDoCliente(id ?? '');

  const [fechandoMes, setFechandoMes] = useState(false);

  const trabalhosEmAberto = useMemo(
    () => trabalhos.filter((t) => t.clienteId === id && t.status === 'Finalizado' && !t.fechado),
    [trabalhos, id]
  );
  const valorEmAberto = trabalhosEmAberto.reduce((soma, t) => soma + t.valor, 0);

  function editar() {
    router.push({ pathname: '/clientes/novo', params: { editarId: cliente!.id } });
  }

  function confirmarExclusao() {
    alertar(
      'Excluir cliente',
      'Todos os trabalhos e fechamentos associados também serão apagados. Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const trabalhosDoCliente = trabalhos.filter((t) => t.clienteId === cliente!.id);
            await excluirCliente(cliente!.id, trabalhosDoCliente, fechamentos, arquivos);
            router.back();
          },
        },
      ]
    );
  }

  function abrirMenu() {
    alertar(cliente?.nome ?? 'Cliente', undefined, [
      { text: 'Editar', onPress: editar },
      { text: 'Excluir cliente', style: 'destructive', onPress: confirmarExclusao },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      title: cliente?.nome ?? 'Cliente',
      headerRight: () => (
        <TouchableOpacity onPress={abrirMenu}>
          <Ionicons name="ellipsis-horizontal-circle-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      ),
    });
  }, [cliente, trabalhos, fechamentos]);

  if (!cliente) {
    return (
      <View style={styles.container}>
        <Text style={styles.vazio}>Cliente não encontrado.</Text>
      </View>
    );
  }

  async function aoFecharMes() {
    alertar(
      'Fechar mês',
      `Isso vai consolidar ${trabalhosEmAberto.length} trabalho(s), no total de ${formatarMoeda(valorEmAberto)}.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Fechar mês',
          onPress: async () => {
            setFechandoMes(true);
            try {
              const fechamento = await fecharMes(cliente!, trabalhosEmAberto);
              await gerarECompartilharFechamento(fechamento, trabalhosEmAberto);
            } finally {
              setFechandoMes(false);
            }
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 20 }}>
      {(cliente.telefone || cliente.email) && (
        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Contato</Text>
          {cliente.telefone ? <Text>Telefone: {cliente.telefone}</Text> : null}
          {cliente.email ? <Text>E-mail: {cliente.email}</Text> : null}
        </View>
      )}

      <View style={styles.secao}>
        <Text style={styles.tituloSecao}>Trabalhos finalizados (em aberto)</Text>
        {trabalhosEmAberto.length === 0 ? (
          <Text style={styles.vazioSecao}>Nenhum trabalho pendente de fechamento.</Text>
        ) : (
          <>
            {trabalhosEmAberto.map((t) => (
              <View key={t.id} style={styles.linhaTrabalho}>
                <Text style={{ flex: 1 }}>{t.descricao}</Text>
                <Text style={styles.valor}>{formatarMoeda(t.valor)}</Text>
              </View>
            ))}
            <View style={[styles.linhaTrabalho, styles.linhaTotal]}>
              <Text style={styles.totalTexto}>Total em aberto</Text>
              <Text style={styles.totalTexto}>{formatarMoeda(valorEmAberto)}</Text>
            </View>
          </>
        )}
      </View>

      {trabalhosEmAberto.length > 0 && (
        <TouchableOpacity style={styles.botaoPrimario} onPress={aoFecharMes} disabled={fechandoMes}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
          <Text style={styles.botaoPrimarioTexto}>
            {fechandoMes ? 'Fechando...' : `Fechar mês (${trabalhosEmAberto.length} trabalhos)`}
          </Text>
        </TouchableOpacity>
      )}

      <ArquivosCliente clienteId={cliente.id} />

      <View style={styles.secao}>
        <Text style={styles.tituloSecao}>Histórico de fechamentos</Text>
        {fechamentos.length === 0 ? (
          <Text style={styles.vazioSecao}>Nenhum fechamento realizado ainda.</Text>
        ) : (
          fechamentos.map((f) => {
            const trabalhosDoFechamento = trabalhos.filter((t) => f.trabalhoIds.includes(t.id));
            return (
              <TouchableOpacity
                key={f.id}
                style={styles.linhaTrabalho}
                onPress={() => gerarECompartilharFechamento(f, trabalhosDoFechamento)}
              >
                <Text style={{ flex: 1 }}>{nomeMesAno(f.mesReferencia, f.anoReferencia)}</Text>
                <Text style={styles.valor}>{formatarMoeda(f.valorTotal)}</Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  secao: { gap: 8 },
  tituloSecao: { fontSize: 13, fontWeight: '700', color: '#666', textTransform: 'uppercase' },
  vazioSecao: { color: '#999' },
  linhaTrabalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#D1D1D6',
  },
  linhaTotal: { borderBottomWidth: 0, marginTop: 4 },
  totalTexto: { fontWeight: '700' },
  valor: { fontWeight: '600' },
  botaoPrimario: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    borderRadius: 10,
    padding: 14,
  },
  botaoPrimarioTexto: { color: '#fff', fontWeight: '700' },
  vazio: { textAlign: 'center', color: '#999', marginTop: 40 },
});
