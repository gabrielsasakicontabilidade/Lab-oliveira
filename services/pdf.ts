import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Trabalho, Fechamento } from '@/types';
import { formatarMoeda } from '@/utils/currency';
import { formatarDataCurta, nomeMesAno } from '@/utils/date';
import { ResultadoRelatorio } from './relatorios';
import { LOGO_OLIVEIRA_BASE64 } from './logoAsset';

function baseHTML(conteudo: string) {
  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 24px; color: #111; }
          .cabecalho { text-align: center; margin-bottom: 24px; }
          .cabecalho img { height: 56px; }
          h1 { font-size: 20px; margin: 16px 0 4px; text-align: center; letter-spacing: 0.5px; }
          .subtitulo { color: #555; margin-bottom: 20px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          td, th { padding: 8px 4px; border-bottom: 1px solid #ddd; text-align: left; font-size: 13px; }
          .total { font-size: 16px; font-weight: bold; margin-top: 16px; text-align: right; }
          .rodape { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
          .resumo { display: flex; gap: 12px; margin-bottom: 20px; }
          .resumoCard { flex: 1; text-align: center; background: #F2F2F7; border-radius: 8px; padding: 10px; }
          .resumoValor { font-size: 17px; font-weight: bold; }
          .resumoRotulo { font-size: 11px; color: #666; margin-top: 2px; }
          .linhaSecundaria { color: #888; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="cabecalho">
          <img src="${LOGO_OLIVEIRA_BASE64}" />
        </div>
        ${conteudo}
        <div class="rodape">Laboratório Oliveira</div>
      </body>
    </html>
  `;
}

async function gerarECompartilhar(html: string) {
  if (Platform.OS === 'web') {
    const janela = window.open('', '_blank');
    if (!janela) return;
    janela.document.write(html);
    janela.document.close();
    janela.focus();
    // Pequeno atraso para a janela terminar de renderizar (logo, layout) antes de abrir o diálogo de impressão.
    setTimeout(() => janela.print(), 300);
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
}

export async function gerarECompartilharRecibo(trabalho: Trabalho) {
  const html = baseHTML(`
    <h1>COMPROVANTE DE SERVIÇO</h1>
    <div class="subtitulo">
      Cliente: ${trabalho.clienteNome}<br/>
      Data de entrega: ${trabalho.dataEntrega ? formatarDataCurta(trabalho.dataEntrega) : '—'}<br/>
      Data de finalização: ${trabalho.finalizadoEm ? formatarDataCurta(trabalho.finalizadoEm) : '—'}
    </div>
    <p><strong>Descrição:</strong> ${trabalho.descricao}</p>
    ${trabalho.observacoes ? `<p><strong>Observações:</strong> ${trabalho.observacoes}</p>` : ''}
    <div class="total">Valor: ${formatarMoeda(trabalho.valor)}</div>
  `);

  await gerarECompartilhar(html);
}

export async function gerarECompartilharFechamento(fechamento: Fechamento, trabalhos: Trabalho[]) {
  const linhas = trabalhos
    .map(
      (t, indice) => `
        <tr>
          <td>${indice + 1}</td>
          <td>${t.descricao}</td>
          <td>${t.finalizadoEm ? formatarDataCurta(t.finalizadoEm) : '—'}</td>
          <td>${formatarMoeda(t.valor)}</td>
        </tr>
      `
    )
    .join('');

  const html = baseHTML(`
    <h1>FATURA DE SERVIÇOS</h1>
    <div class="subtitulo">
      ${nomeMesAno(fechamento.mesReferencia, fechamento.anoReferencia)}<br/>
      Cliente: ${fechamento.clienteNome}
    </div>
    <table>
      <thead><tr><th>#</th><th>Descrição</th><th>Finalizado em</th><th>Valor</th></tr></thead>
      <tbody>${linhas}</tbody>
    </table>
    <div class="total">Total do período: ${formatarMoeda(fechamento.valorTotal)}</div>
  `);

  await gerarECompartilhar(html);
}

export async function gerarECompartilharRelatorio(resultado: ResultadoRelatorio, inicio: number, fim: number) {
  const resumoHtml = resultado.resumo
    .map(
      (card) => `
        <div class="resumoCard">
          <div class="resumoValor">${card.valor}</div>
          <div class="resumoRotulo">${card.rotulo}</div>
        </div>
      `
    )
    .join('');

  const linhasHtml = resultado.linhas
    .map(
      (linha) => `
        <tr>
          <td>
            ${linha.principal}
            ${linha.secundario ? `<br/><span class="linhaSecundaria">${linha.secundario}</span>` : ''}
          </td>
          <td style="text-align:right">${linha.valor}</td>
        </tr>
      `
    )
    .join('');

  const html = baseHTML(`
    <h1>${resultado.titulo.toUpperCase()}</h1>
    <div class="subtitulo" style="text-align:center">
      ${formatarDataCurta(inicio)} até ${formatarDataCurta(fim)}
    </div>
    <div class="resumo">${resumoHtml}</div>
    ${resultado.linhas.length > 0 ? `<table><tbody>${linhasHtml}</tbody></table>` : ''}
  `);

  await gerarECompartilhar(html);
}
