import type { CSSProperties, ChangeEvent } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  rotulo: string;
  valor: Date;
  aoMudar: (data: Date) => void;
}

function paraValorInput(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function CampoData({ rotulo, valor, aoMudar }: Props) {
  return (
    <View>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <input
        type="date"
        value={paraValorInput(valor)}
        onChange={(evento: ChangeEvent<HTMLInputElement>) => {
          const [ano, mes, dia] = evento.target.value.split('-').map(Number);
          if (ano && mes && dia) aoMudar(new Date(ano, mes - 1, dia));
        }}
        style={estiloInput}
      />
    </View>
  );
}

const estiloInput: CSSProperties = {
  border: '1px solid #D1D1D6',
  borderRadius: 10,
  padding: 12,
  fontSize: 16,
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  color: '#000',
};

const styles = StyleSheet.create({
  rotulo: { fontSize: 13, color: '#666', marginBottom: 6 },
});
