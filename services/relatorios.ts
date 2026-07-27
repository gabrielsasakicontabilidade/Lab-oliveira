import { Trabalho } from '@/types';
import { formatarMoeda } from '@/utils/currency';
import { formatarDataCurta } from '@/utils/date';

export type TipoRelatorio =
  | 'producao-periodo'
  | 'faturamento'
  | 'producao-cliente'
  | 'tipos-servico'
  | 'finalizados'
  | 'andamento';

export interface ResumoCard {
  rotulo: string;
  valor: string;
}

export interface LinhaRelatorio {
  principal: string;
  secundario?: string;
  valor: string;
}

export interface ResultadoRelatorio {
  titulo: string;
  resumo: ResumoCard[];
  linhas: LinhaRelatorio[];
  linhasVazioTexto: string;
}

function dentroDoPeriodo(data: number | undefined, inicio: number, fim: number): boolean {
  return !!data && data >= inicio && data <= fim;
}

export function calcularRelatorio(
  tipo: TipoRelatorio,
  trabalhos: Trabalho[],
  inicio: number,
  fim: number
): ResultadoRelatorio {
  const finalizadosNoPeriodo = trabalhos.filter(
    (t) => t.status === 'Finalizado' && dentroDoPeriodo(t.finalizadoEm, inicio, fim)
  );

  switch (tipo) {
    case 'producao-periodo': {
      const total = finalizadosNoPeriodo.reduce((soma, t) => soma + t.valor, 0);
      return {
        titulo: 'Produção por Período',
        resumo: [
          { rotulo: 'Trabalhos finalizados', valor: String(finalizadosNoPeriodo.length) },
          { rotulo: 'Valor total', valor: formatarMoeda(total) },
        ],
        linhas: [...finalizadosNoPeriodo]
          .sort((a, b) => (b.finalizadoEm ?? 0) - (a.finalizadoEm ?? 0))
          .map((t) => ({
            principal: t.descricao,
            secundario: `${t.clienteNome} · ${formatarDataCurta(t.finalizadoEm!)}`,
            valor: formatarMoeda(t.valor),
          })),
        linhasVazioTexto: 'Nenhum trabalho finalizado neste período.',
      };
    }

    case 'faturamento': {
      const total = finalizadosNoPeriodo.reduce((soma, t) => soma + t.valor, 0);
      const media = finalizadosNoPeriodo.length > 0 ? total / finalizadosNoPeriodo.length : 0;
      return {
        titulo: 'Faturamento',
        resumo: [
          { rotulo: 'Faturamento total', valor: formatarMoeda(total) },
          { rotulo: 'Ticket médio', valor: formatarMoeda(media) },
          { rotulo: 'Trabalhos faturados', valor: String(finalizadosNoPeriodo.length) },
        ],
        linhas: [],
        linhasVazioTexto: '',
      };
    }

    case 'producao-cliente': {
      const porCliente = new Map<string, { total: number; quantidade: number }>();
      finalizadosNoPeriodo.forEach((t) => {
        const atual = porCliente.get(t.clienteNome) ?? { total: 0, quantidade: 0 };
        atual.total += t.valor;
        atual.quantidade += 1;
        porCliente.set(t.clienteNome, atual);
      });
      const linhas = Array.from(porCliente.entries())
        .sort((a, b) => b[1].total - a[1].total)
        .map(([nome, dados]) => ({
          principal: nome,
          secundario: `${dados.quantidade} trabalho(s)`,
          valor: formatarMoeda(dados.total),
        }));
      return {
        titulo: 'Produção por Cliente',
        resumo: [
          { rotulo: 'Clientes atendidos', valor: String(porCliente.size) },
          { rotulo: 'Valor total', valor: formatarMoeda(finalizadosNoPeriodo.reduce((s, t) => s + t.valor, 0)) },
        ],
        linhas,
        linhasVazioTexto: 'Nenhum trabalho finalizado neste período.',
      };
    }

    case 'tipos-servico': {
      const porTipo = new Map<string, { total: number; quantidade: number }>();
      finalizadosNoPeriodo.forEach((t) => {
        const chave = t.descricao.trim();
        const atual = porTipo.get(chave) ?? { total: 0, quantidade: 0 };
        atual.total += t.valor;
        atual.quantidade += 1;
        porTipo.set(chave, atual);
      });
      const linhas = Array.from(porTipo.entries())
        .sort((a, b) => b[1].total - a[1].total)
        .map(([descricao, dados]) => ({
          principal: descricao,
          secundario: `${dados.quantidade}x`,
          valor: formatarMoeda(dados.total),
        }));
      return {
        titulo: 'Tipos de Serviço',
        resumo: [{ rotulo: 'Tipos distintos', valor: String(porTipo.size) }],
        linhas,
        linhasVazioTexto: 'Nenhum trabalho finalizado neste período.',
      };
    }

    case 'finalizados': {
      const total = finalizadosNoPeriodo.reduce((soma, t) => soma + t.valor, 0);
      return {
        titulo: 'Serviços Finalizados',
        resumo: [
          { rotulo: 'Total finalizados', valor: String(finalizadosNoPeriodo.length) },
          { rotulo: 'Valor total', valor: formatarMoeda(total) },
        ],
        linhas: [...finalizadosNoPeriodo]
          .sort((a, b) => (b.finalizadoEm ?? 0) - (a.finalizadoEm ?? 0))
          .map((t) => ({
            principal: t.descricao,
            secundario: `${t.clienteNome} · ${formatarDataCurta(t.finalizadoEm!)}`,
            valor: formatarMoeda(t.valor),
          })),
        linhasVazioTexto: 'Nenhum trabalho finalizado neste período.',
      };
    }

    case 'andamento': {
      const emAndamento = trabalhos.filter((t) => t.status === 'Iniciar' || t.status === 'Em Produção');
      return {
        titulo: 'Serviços em Andamento',
        resumo: [
          { rotulo: 'Em andamento', valor: String(emAndamento.length) },
          { rotulo: 'Valor em produção', valor: formatarMoeda(emAndamento.reduce((s, t) => s + t.valor, 0)) },
        ],
        linhas: [...emAndamento]
          .sort((a, b) => a.criadoEm - b.criadoEm)
          .map((t) => ({
            principal: t.descricao,
            secundario: `${t.clienteNome} · ${t.status}`,
            valor: formatarMoeda(t.valor),
          })),
        linhasVazioTexto: 'Nenhum trabalho em andamento.',
      };
    }
  }
}
