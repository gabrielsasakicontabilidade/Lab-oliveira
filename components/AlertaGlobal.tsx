import { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform, Alert as AlertNativo } from 'react-native';

interface BotaoAlerta {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface EstadoAlerta {
  titulo: string;
  mensagem?: string;
  botoes: BotaoAlerta[];
}

let exibirAlertaWeb: ((estado: EstadoAlerta) => void) | null = null;

export function alertar(titulo: string, mensagem?: string, botoes?: BotaoAlerta[]) {
  const botoesFinais = botoes && botoes.length > 0 ? botoes : [{ text: 'OK' }];
  if (Platform.OS === 'web') {
    exibirAlertaWeb?.({ titulo, mensagem, botoes: botoesFinais });
    return;
  }
  AlertNativo.alert(titulo, mensagem, botoesFinais);
}

export function AlertaGlobalProvider() {
  const [estado, setEstado] = useState<EstadoAlerta | null>(null);

  useEffect(() => {
    exibirAlertaWeb = setEstado;
    return () => {
      exibirAlertaWeb = null;
    };
  }, []);

  if (Platform.OS !== 'web') return null;

  function fechar(botao: BotaoAlerta) {
    setEstado(null);
    botao.onPress?.();
  }

  return (
    <Modal visible={!!estado} transparent animationType="fade" onRequestClose={() => setEstado(null)}>
      <View style={styles.fundo}>
        <View style={styles.caixa}>
          <Text style={styles.titulo}>{estado?.titulo}</Text>
          {estado?.mensagem ? <Text style={styles.mensagem}>{estado.mensagem}</Text> : null}
          <View style={styles.botoes}>
            {estado?.botoes.map((botao, indice) => (
              <TouchableOpacity key={indice} style={styles.botao} onPress={() => fechar(botao)}>
                <Text style={[styles.botaoTexto, botao.style === 'destructive' && styles.destrutivo]}>
                  {botao.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  caixa: { backgroundColor: '#fff', borderRadius: 14, padding: 20, width: '100%', maxWidth: 340, gap: 8 },
  titulo: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  mensagem: { fontSize: 14, color: '#444', textAlign: 'center', marginTop: 4 },
  botoes: { marginTop: 16, gap: 4 },
  botao: { paddingVertical: 12, alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#ddd' },
  botaoTexto: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  destrutivo: { color: '#FF3B30' },
});
