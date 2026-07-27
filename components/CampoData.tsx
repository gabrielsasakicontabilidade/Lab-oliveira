import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatarDataCurta } from '@/utils/date';
import { cores, raio } from '@/constants/theme';

interface Props {
  rotulo: string;
  valor: Date;
  aoMudar: (data: Date) => void;
}

export function CampoData({ rotulo, valor, aoMudar }: Props) {
  const [mostrarPicker, setMostrarPicker] = useState(false);

  return (
    <View>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TouchableOpacity style={styles.campo} onPress={() => setMostrarPicker(true)}>
        <Text style={styles.texto}>{formatarDataCurta(valor.getTime())}</Text>
      </TouchableOpacity>
      {mostrarPicker && (
        <View>
          <DateTimePicker
            value={valor}
            mode="date"
            display="spinner"
            onChange={(_evento, data) => {
              if (data) aoMudar(data);
            }}
          />
          <TouchableOpacity style={styles.concluirBotao} onPress={() => setMostrarPicker(false)}>
            <Text style={styles.concluirTexto}>Concluído</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rotulo: { fontSize: 13, color: cores.textoSecundario, marginBottom: 6 },
  campo: {
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.md,
    padding: 12,
  },
  texto: { fontSize: 16, color: cores.texto },
  concluirBotao: { alignItems: 'flex-end', paddingVertical: 8 },
  concluirTexto: { color: cores.primaria, fontWeight: '600', fontSize: 15 },
});
