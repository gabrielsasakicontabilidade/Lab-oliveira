import { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, Image, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { alertar } from '@/components/AlertaGlobal';
import { Botao } from '@/components/Botao';
import { cores, espacamento, raio, sombra } from '@/constants/theme';

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
    <KeyboardAvoidingView style={styles.fundo} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.cartao}>
        <Image source={require('@/assets/images/logo-oliveira.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.subtitulo}>Controle de trabalhos e faturamento</Text>

        <View style={styles.campos}>
          <TextInput
            style={styles.campo}
            placeholder="E-mail"
            placeholderTextColor={cores.textoSecundario}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.campo}
            placeholder="Senha"
            placeholderTextColor={cores.textoSecundario}
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />
        </View>

        <Botao
          texto="Entrar"
          onPress={entrar}
          carregando={carregando}
          style={{ width: '100%', marginTop: espacamento.sm }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: espacamento.lg,
    backgroundColor: cores.fundoTela,
  },
  cartao: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: cores.fundo,
    borderRadius: raio.xl,
    padding: espacamento.xl,
    alignItems: 'center',
    ...sombra,
  },
  logo: { width: 220, height: 71, marginBottom: 4 },
  subtitulo: { color: cores.textoSecundario, marginBottom: espacamento.lg, textAlign: 'center' },
  campos: { width: '100%', gap: espacamento.sm },
  campo: {
    width: '100%',
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.fundoTela,
    borderRadius: raio.md,
    padding: 12,
    fontSize: 16,
    color: cores.texto,
  },
});
