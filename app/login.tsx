import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { alertar } from '@/components/AlertaGlobal';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    if (!email || !senha) {
      alertar('Preencha e-mail e senha.');
      return;
    }
    setCarregando(true);
    try {
      await login(email.trim(), senha);
    } catch {
      alertar('Não foi possível entrar', 'Verifique seu e-mail e senha.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Image source={require('@/assets/images/logo-oliveira.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.subtitulo}>Controle de trabalhos e faturamento</Text>

      <TextInput
        style={styles.campo}
        placeholder="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.campo}
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity style={styles.botao} onPress={entrar} disabled={carregando}>
        <Text style={styles.botaoTexto}>{carregando ? 'Entrando...' : 'Entrar'}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  logo: { width: 220, height: 71, marginBottom: 4 },
  subtitulo: { color: '#666', marginBottom: 24 },
  campo: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  botao: {
    width: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  botaoTexto: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
