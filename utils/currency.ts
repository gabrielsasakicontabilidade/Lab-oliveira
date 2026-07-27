export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

export function paraNumero(texto: string): number {
  const numero = parseFloat(texto.replace(',', '.'));
  return Number.isNaN(numero) ? 0 : numero;
}
