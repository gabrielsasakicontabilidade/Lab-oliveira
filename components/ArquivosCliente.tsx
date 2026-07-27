import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useArquivosDoCliente } from '@/hooks/useArquivosDoCliente';
import { criarArquivo, excluirArquivo } from '@/services/firestore';
import { alertar } from '@/components/AlertaGlobal';
import { Arquivo } from '@/types';

interface Props {
  clienteId: string;
}

export function ArquivosCliente({ clienteId }: Props) {
  const arquivos = useArquivosDoCliente(clienteId);
  const [enviando, setEnviando] = useState(false);
  const [selecionado, setSelecionado] = useState<Arquivo | null>(null);

  async function processarEEnviar(uri: string) {
    setEnviando(true);
    try {
      const contexto = ImageManipulator.manipulate(uri);
      const imagemRef = await contexto.resize({ width: 1080 }).renderAsync();
      const resultado = await imagemRef.saveAsync({ compress: 0.5, format: SaveFormat.JPEG, base64: true });
      if (!resultado.base64) throw new Error('Falha ao processar imagem');
      await criarArquivo({
        clienteId,
        nome: `Foto ${new Date().toLocaleDateString('pt-BR')}`,
        imagemBase64: `data:image/jpeg;base64,${resultado.base64}`,
      });
    } catch (erro) {
      console.error('Erro ao enviar arquivo:', erro);
      alertar('Erro ao enviar', 'Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  async function tirarFoto() {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissao.granted) {
      alertar('Permissão necessária', 'Autorize o acesso à câmera nas configurações do iPhone.');
      return;
    }
    const resultado = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!resultado.canceled && resultado.assets[0]) {
      await processarEEnviar(resultado.assets[0].uri);
    }
  }

  async function escolherDaGaleria() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      alertar('Permissão necessária', 'Autorize o acesso às fotos nas configurações do iPhone.');
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (!resultado.canceled && resultado.assets[0]) {
      await processarEEnviar(resultado.assets[0].uri);
    }
  }

  function abrirOpcoes() {
    alertar('Adicionar arquivo', undefined, [
      { text: 'Tirar foto', onPress: tirarFoto },
      { text: 'Escolher da galeria', onPress: escolherDaGaleria },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  function confirmarExclusao(arquivo: Arquivo) {
    alertar('Excluir arquivo', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await excluirArquivo(arquivo.id);
          setSelecionado(null);
        },
      },
    ]);
  }

  return (
    <View style={{ gap: 8 }}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Arquivos</Text>
        <TouchableOpacity onPress={abrirOpcoes} disabled={enviando}>
          {enviando ? (
            <ActivityIndicator size="small" />
          ) : (
            <Ionicons name="add-circle-outline" size={22} color="#007AFF" />
          )}
        </TouchableOpacity>
      </View>

      {arquivos.length === 0 ? (
        <Text style={styles.vazio}>Nenhum arquivo ainda.</Text>
      ) : (
        <FlatList
          data={arquivos}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setSelecionado(item)}>
              <Image source={{ uri: item.imagemBase64 }} style={styles.miniatura} />
            </TouchableOpacity>
          )}
        />
      )}

      <Modal
        visible={!!selecionado}
        animationType="fade"
        transparent
        onRequestClose={() => setSelecionado(null)}
      >
        <View style={styles.fundoModal}>
          <TouchableOpacity style={styles.fecharBotao} onPress={() => setSelecionado(null)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {selecionado && (
            <>
              <Image source={{ uri: selecionado.imagemBase64 }} style={styles.imagemGrande} resizeMode="contain" />
              <TouchableOpacity style={styles.excluirBotao} onPress={() => confirmarExclusao(selecionado)}>
                <Ionicons name="trash-outline" size={20} color="#fff" />
                <Text style={styles.excluirTexto}>Excluir</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titulo: { fontSize: 13, fontWeight: '700', color: '#666', textTransform: 'uppercase' },
  vazio: { color: '#999' },
  miniatura: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#eee' },
  fundoModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  fecharBotao: { position: 'absolute', top: 60, right: 20, zIndex: 1 },
  imagemGrande: { width: '100%', height: '70%' },
  excluirBotao: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 20,
  },
  excluirTexto: { color: '#fff', fontWeight: '700' },
});
