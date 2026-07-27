export function formatarDataCurta(epochMillis: number): string {
  return new Date(epochMillis).toLocaleDateString('pt-BR');
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export function nomeMesAno(mes: number, ano: number): string {
  const nome = MESES[mes - 1] ?? String(mes);
  return `${nome} de ${ano}`;
}

export function inicioDoDia(data: Date): number {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate(), 0, 0, 0, 0).getTime();
}

export function fimDoDia(data: Date): number {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate(), 23, 59, 59, 999).getTime();
}
