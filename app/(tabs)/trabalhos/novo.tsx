import { useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useClientes } from '@/hooks/useClientes';
import { criarTrabalho } from '@/services/firestore';
import { paraNumero } from '@/utils/currency';
import { CampoData } from '@/components/CampoData';
import { SeletorCliente } from '@/components/SeletorCliente';
import { alertar } from '@/components/AlertaGlobal';
import { cores, espacamento, raio, larguraMaximaTela } from '@/constants/theme';

export default function NovoTrabalhoScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { clientes } = useClientes();

  const [descricao, setDescricao] = useState('');
  const [valorTexto, setValorTexto] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [dataEntrega, setDataEntrega] = useState(new Date());
  const [observacoes, setObservacoes] = useState('');
  const [salvando, setSalvando] = useState(false);

  const formValido = descricao.trim().length > 0 && clienteId !== '' && paraNumero(valorTexto) > 0;

  async function salvar() {
    if (!formValido) return;
    const cliente = clientes.find((c) => c.id === clienteId);
    if (!cliente) return;
    setSalvando(true);
    try {
      await criarTrabalho({
        descricao: descricao.trim(),
        valor: paraNumero(valorTexto),
        clienteId: cliente.id,
        clienteNome: cliente.nome,
        dataEntrega: dataEntrega.getTime(),
        observacoes: observacoes.trim() || undefined,
      });
      router.back();
    } catch (erro) {
      console.error('Erro ao salvar trabalho:', erro);
      alertar('Erro ao salvar', 'Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelar}>Cancelar</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={salvar} disabled={!formValido || salvando}>
          <Text style={[styles.salvar, (!formValido || salvando) && styles.desabilitado]}>Salvar</Text>
        </TouchableOpacity>
      ),
    });
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>
      <View>
        <Text style={styles.rotulo}>Descrição do trabalho</Text>
        <TextInput
          style={[styles.campo, styles.campoMultilinha]}
          value={descricao}
          onChangeText={setDescricao}
          multiline
          placeholder="Ex: Prótese total superior"
        />
      </View>

      <View>
        <Text style={styles.rotulo}>Valor (R$)</Text>
        <TextInput
          style={styles.campo}
          value={valorTexto}
          onChangeText={setValorTexto}
          keyboardType="decimal-pad"
          placeholder="0,00"
        />
      </View>

      <View>
        <Text style={styles.rotulo}>Cliente</Text>
        <SeletorCliente clientes={clientes} clienteId={clienteId} aoSelecionar={setClienteId} />
        {clientes.length === 0 && (
          <Text style={styles.aviso}>Cadastre um cliente na aba "Clientes" antes de criar um trabalho.</Text>
        )}
      </View>

      <CampoData rotulo="Data de entrega" valor={dataEntrega} aoMudar={setDataEntrega} />

      <View>
        <Text style={styles.rotulo}>Observações (opcional)</Text>
        <TextInput
          style={[styles.campo, styles.campoMultilinha]}
          value={observacoes}
          onChangeText={setObservacoes}
          multiline
          placeholder="Ex: Cor A2, encerramento anatômico"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espacamento.md, gap: espacamento.md, maxWidth: larguraMaximaTela, width: '100%', alignSelf: 'center' },
  rotulo: { fontSize: 13, color: cores.textoSecundario, marginBottom: 6 },
  campo: {
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.md,
    padding: 12,
    fontSize: 16,
    color: cores.texto,
  },
  campoMultilinha: { minHeight: 80, textAlignVertical: 'top' },
  aviso: { color: cores.textoSecundario, fontSize: 12, marginTop: 6 },
  cancelar: { color: cores.primaria, fontSize: 16 },
  salvar: { color: cores.primaria, fontSize: 16, fontWeight: '700' },
  desabilitado: { color: cores.borda },
});
