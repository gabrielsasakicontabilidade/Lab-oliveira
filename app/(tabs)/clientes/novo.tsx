import { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import { useClientes } from '@/hooks/useClientes';
import { criarCliente, atualizarCliente } from '@/services/firestore';
import { SegmentedControl } from '@/components/SegmentedControl';
import { alertar } from '@/components/AlertaGlobal';
import { TipoCliente } from '@/types';

const TIPOS: TipoCliente[] = ['Dentista', 'Consultório'];

export default function FormularioClienteScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { editarId } = useLocalSearchParams<{ editarId?: string }>();
  const { clientes } = useClientes();
  const clienteExistente = clientes.find((c) => c.id === editarId);

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoCliente>('Dentista');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [carregouExistente, setCarregouExistente] = useState(false);

  useEffect(() => {
    if (clienteExistente && !carregouExistente) {
      setNome(clienteExistente.nome);
      setTipo(clienteExistente.tipo);
      setTelefone(clienteExistente.telefone ?? '');
      setEmail(clienteExistente.email ?? '');
      setCarregouExistente(true);
    }
  }, [clienteExistente, carregouExistente]);

  const formValido = nome.trim().length > 0;

  async function salvar() {
    if (!formValido) return;
    setSalvando(true);
    try {
      const dados = {
        nome: nome.trim(),
        tipo,
        telefone: telefone.trim() || undefined,
        email: email.trim() || undefined,
      };
      if (editarId) {
        await atualizarCliente(editarId, dados);
      } else {
        await criarCliente(dados);
      }
      router.back();
    } catch (erro) {
      console.error('Erro ao salvar cliente:', erro);
      alertar('Erro ao salvar', 'Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      title: editarId ? 'Editar Cliente' : 'Novo Cliente',
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
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View>
        <Text style={styles.rotulo}>Nome</Text>
        <TextInput style={styles.campo} value={nome} onChangeText={setNome} />
      </View>
      <View>
        <Text style={styles.rotulo}>Tipo</Text>
        <SegmentedControl opcoes={TIPOS} valor={tipo} aoMudar={setTipo} />
      </View>
      <View>
        <Text style={styles.rotulo}>Telefone (opcional)</Text>
        <TextInput style={styles.campo} value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
      </View>
      <View>
        <Text style={styles.rotulo}>E-mail (opcional)</Text>
        <TextInput
          style={styles.campo}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  rotulo: { fontSize: 13, color: '#666', marginBottom: 6 },
  campo: { borderWidth: 1, borderColor: '#D1D1D6', borderRadius: 10, padding: 12, fontSize: 16 },
  cancelar: { color: '#007AFF', fontSize: 16 },
  salvar: { color: '#007AFF', fontSize: 16, fontWeight: '700' },
  desabilitado: { color: '#C7C7CC' },
});
