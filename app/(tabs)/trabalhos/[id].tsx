import { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { serverTimestamp } from 'firebase/firestore';
import { useClientes } from '@/hooks/useClientes';
import { useTrabalhos } from '@/hooks/useTrabalhos';
import { atualizarTrabalho, excluirTrabalho, timestampDe } from '@/services/firestore';
import { gerarECompartilharRecibo } from '@/services/pdf';
import { paraNumero } from '@/utils/currency';
import { SegmentedControl } from '@/components/SegmentedControl';
import { CampoData } from '@/components/CampoData';
import { SeletorCliente } from '@/components/SeletorCliente';
import { alertar } from '@/components/AlertaGlobal';
import { Botao } from '@/components/Botao';
import { cores, espacamento, raio, larguraMaximaTela } from '@/constants/theme';
import { StatusTrabalho } from '@/types';

const STATUS_OPCOES: StatusTrabalho[] = ['Iniciar', 'Em Produção', 'Finalizado'];

export default function DetalheTrabalhoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { clientes } = useClientes();
  const { trabalhos } = useTrabalhos();
  const trabalho = trabalhos.find((t) => t.id === id);

  const [descricao, setDescricao] = useState('');
  const [valorTexto, setValorTexto] = useState('');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (trabalho) {
      setDescricao(trabalho.descricao);
      setValorTexto(String(trabalho.valor));
      setObservacoes(trabalho.observacoes ?? '');
    }
  }, [trabalho?.id]);

  function confirmarExclusao() {
    alertar('Excluir trabalho', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          if (!trabalho) return;
          await excluirTrabalho(trabalho.id);
          router.back();
        },
      },
    ]);
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        trabalho && !trabalho.fechado ? (
          <TouchableOpacity onPress={confirmarExclusao}>
            <Ionicons name="trash-outline" size={22} color={cores.perigo} />
          </TouchableOpacity>
        ) : null,
    });
  }, [trabalho]);

  if (!trabalho) {
    return (
      <View style={styles.container}>
        <Text style={styles.vazio}>Trabalho não encontrado.</Text>
      </View>
    );
  }

  async function salvarDescricao() {
    if (descricao.trim() && descricao !== trabalho!.descricao) {
      await atualizarTrabalho(trabalho!.id, { descricao: descricao.trim() });
    }
  }

  async function salvarValor() {
    const numero = paraNumero(valorTexto);
    if (numero > 0 && numero !== trabalho!.valor) {
      await atualizarTrabalho(trabalho!.id, { valor: numero });
    }
  }

  async function mudarCliente(novoClienteId: string) {
    const cliente = clientes.find((c) => c.id === novoClienteId);
    if (!cliente) return;
    await atualizarTrabalho(trabalho!.id, { clienteId: cliente.id, clienteNome: cliente.nome });
  }

  async function mudarDataEntrega(data: Date) {
    await atualizarTrabalho(trabalho!.id, { dataEntrega: timestampDe(data.getTime()) });
  }

  async function salvarObservacoes() {
    if (observacoes !== (trabalho!.observacoes ?? '')) {
      await atualizarTrabalho(trabalho!.id, { observacoes: observacoes.trim() || null });
    }
  }

  async function mudarStatus(novoStatus: StatusTrabalho) {
    const dados: Record<string, unknown> = { status: novoStatus };
    if (novoStatus === 'Finalizado' && !trabalho!.finalizadoEm) {
      dados.finalizadoEm = serverTimestamp();
    }
    await atualizarTrabalho(trabalho!.id, dados);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>
      <View>
        <Text style={styles.rotulo}>Descrição</Text>
        <TextInput
          style={[styles.campo, styles.campoMultilinha]}
          value={descricao}
          onChangeText={setDescricao}
          onBlur={salvarDescricao}
          multiline
        />
      </View>

      <View>
        <Text style={styles.rotulo}>Valor (R$)</Text>
        <TextInput
          style={styles.campo}
          value={valorTexto}
          onChangeText={setValorTexto}
          onBlur={salvarValor}
          keyboardType="decimal-pad"
        />
      </View>

      <View>
        <Text style={styles.rotulo}>Cliente</Text>
        <SeletorCliente clientes={clientes} clienteId={trabalho.clienteId} aoSelecionar={mudarCliente} />
      </View>

      <View>
        <Text style={styles.rotulo}>Status</Text>
        <SegmentedControl opcoes={STATUS_OPCOES} valor={trabalho.status} aoMudar={mudarStatus} />
      </View>

      <CampoData
        rotulo="Data de entrega"
        valor={new Date(trabalho.dataEntrega ?? trabalho.criadoEm)}
        aoMudar={mudarDataEntrega}
      />

      <View>
        <Text style={styles.rotulo}>Observações</Text>
        <TextInput
          style={[styles.campo, styles.campoMultilinha]}
          value={observacoes}
          onChangeText={setObservacoes}
          onBlur={salvarObservacoes}
          multiline
          placeholder="Ex: Cor A2, encerramento anatômico"
        />
      </View>

      {trabalho.status === 'Finalizado' && (
        <Botao
          texto="Gerar/Compartilhar recibo PDF"
          icone="document-text-outline"
          variante="secundario"
          onPress={() => gerarECompartilharRecibo(trabalho)}
        />
      )}

      {trabalho.fechado && (
        <Text style={styles.aviso}>
          Este trabalho já entrou em um fechamento mensal e não pode mais ser excluído.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espacamento.md, gap: espacamento.lg, maxWidth: larguraMaximaTela, width: '100%', alignSelf: 'center' },
  rotulo: { fontSize: 13, color: cores.textoSecundario, marginBottom: 6 },
  campo: { borderWidth: 1, borderColor: cores.borda, borderRadius: raio.md, padding: 12, fontSize: 16, color: cores.texto },
  campoMultilinha: { minHeight: 70, textAlignVertical: 'top' },
  aviso: { color: cores.textoSecundario, fontSize: 13, textAlign: 'center' },
  vazio: { textAlign: 'center', color: cores.textoSecundario, marginTop: 40 },
});
