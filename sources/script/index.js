// Inputs
const I_valor = document.getElementById('valor');
const I_taxaAnual = document.getElementById('taxaAnual');
const I_porcentagem = document.getElementById('porcentagem');
const I_periodo = document.getElementById('periodo');
const I_periodo_quant = document.getElementById('periodo_quant');
//Resultados
const R_resultado = document.getElementById('resultado');
const R_iIof = document.getElementById('R_iIof');
const R_iRenda = document.getElementById('R_iRenda');
const R_rBruto = document.getElementById('R_rBruto');
const R_rLiquido = document.getElementById('R_rLiquido');
const R_totalAcumulado = document.getElementById('R_totalAcumulado');
//Progressos
const P_iIof = document.getElementById('P_iIof');
const P_iRenda = document.getElementById('P_iRenda');
const P_rBruto = document.getElementById('P_rBruto');
const P_rLiquido = document.getElementById('P_rLiquido');
const P_totalAcomulado = document.getElementById('P_totalAcomulado');
//De uso do sistema
const label = document.getElementById('periodo_qL');
const tabelaIOF = [
    0.96, 0.93, 0.90, 0.86, 0.83, 0.80, 0.76, 0.73, 0.70, 0.66,
    0.63, 0.60, 0.56, 0.53, 0.50, 0.46, 0.43, 0.40, 0.36, 0.33,
    0.30, 0.26, 0.23, 0.20, 0.16, 0.13, 0.10, 0.06, 0.03, 0.00
];

I_periodo.addEventListener('change', () => {
    if (I_periodo.value === 'mensal') label.innerHTML = 'Quantidade de meses <i class="bi bi-calendar2-month"></i>';
    else if (I_periodo.value === 'diario') label.innerHTML = 'Quantidade de dias úteis <i class="bi bi-calendar-day"></i>';
    else label.innerHTML = 'Quantidade de anos <i class="bi bi-calendar-check"></i>';
    calcular();
});

I_valor.addEventListener('input', () => {
    formatarMoeda(I_valor);
    calcular();
});

I_taxaAnual.addEventListener('input', calcular);
I_porcentagem.addEventListener('input', calcular);
I_periodo_quant.addEventListener('input', calcular);


window.onload = () => {
    formatarMoeda(I_valor);
    calcular()
};

function formatarMoeda(elemento) {
    let valor = elemento.value;

    // Remove tudo oque não for número
    valor = valor.replace(/\D/g,
        '');

    // Converte para float e divide por 100 para obter os centavos.
    let numero = parseFloat(valor) / 100;

    // Formata a saida para o padrão brasileiro
    elemento.value = numero.toLocaleString('pt-BR',
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
}
//
function calcular() {
    let valor = I_valor.value.replace(/\./g, '');
    valor = valor.replace(/,/g, '.');
    valor = parseFloat(valor);
    let porcentagem = parseFloat(I_porcentagem.value) / 100;
    let taxaAnual = (parseFloat(I_taxaAnual.value) / 100) * porcentagem;
    let periodo = I_periodo.value;
    let periodo_quant = Math.floor(parseFloat(I_periodo_quant.value));
    let iof = 0;
    let diasUteis = 0;
    let diasCorridos = 0;
    let taxa = 0;
    let taxaDiaria;
    let Pm_iIof;

    if (isNaN(valor) || isNaN(taxaAnual) || isNaN(porcentagem) || isNaN(periodo_quant) || valor <= 0 || taxaAnual <= 0 || porcentagem <= 0 || periodo_quant <= 0) {
        R_resultado.innerText = 'Preencha corretamente todos os campos.';
        return;
    }

    taxaDiaria = Math.pow(1 + taxaAnual, 1 / 252) - 1;

    // Define a quantidade de dias, úteis e corridos/taxa de acordo com o tipo de periodo
    switch (periodo) {
        case 'mensal':
            diasUteis = periodo_quant * 21;
            diasCorridos = periodo_quant * 30;
            taxa = (Math.pow(1 + taxaDiaria, 21) - 1); // taxa mensal
            break;

        case 'anual':
            diasUteis = periodo_quant * 252;
            diasCorridos = periodo_quant * 365;
            taxa = (Math.pow(1 + taxaDiaria, 252) - 1); //taxa anual
            break;

        default:
            diasUteis = periodo_quant;
            diasCorridos = periodo_quant;
            taxa = taxaDiaria; // Taxa diaria
    }

    // Define o rendimento do período
    const montante = valor * Math.pow(1 + taxaDiaria, diasUteis);
    // Define o rendimento sem impostos
    const rendimentoBruto = montante - valor;


    // Cálculo do IOF (regressivo)
    if (diasCorridos >= 1 && diasCorridos <= 30) {
        iof = rendimentoBruto * tabelaIOF[diasCorridos - 1];
        Pm_iIof = (tabelaIOF[diasCorridos - 1] * 100).toFixed(0) + '%';
    } else {
        iof = 0;
        Pm_iIof = '0%';
    }

    // Calcula o imposto de renda regressivo
    if (diasCorridos <= 180) {
        // até 180 dias (22,5%)
        irAliquota = 22.5 / 100;
    } else if (diasCorridos <= 360) {
        // até 360 dias (20%)
        irAliquota = 20 / 100;
    } else if (diasCorridos <= 720) {
        //Até 720 dias (17.5%)
        irAliquota = 17.5 / 100
    } else if (diasCorridos > 720) {
        //acima de 720 dias (15%)
        irAliquota = 15 / 100;
    }

    // Define o custo do I.R. em reais
    let ir = (rendimentoBruto - iof) * irAliquota;
    //Define o rendimento liquído
    let rendimentoLiquido = rendimentoBruto - iof - ir;

    // PROGRESSOS Controladores
    // PM_ = Porcentagem
    // P_ = barra de progresso

    //Rendimento Líquido
    let Pm_rLiquido = ((rendimentoLiquido / valor) * 100).toFixed(2) + '%';
    P_rLiquido.style.width = Pm_rLiquido;

    //Rendimento Bruto
    let Pm_rbruto = ((rendimentoBruto / valor) * 100).toFixed(2) + '%';
    P_rBruto.style.width = Pm_rbruto;

    //Imposto IOF
    P_iIof.style.width = Pm_iIof

    //Imposto de Renda
    let Pm_iRenda = (irAliquota * 100).toFixed(1) + '%';
    P_iRenda.style.width = Pm_iRenda;

    //Total Acumulado
    let Pm_totalAcomulado = (100 + (rendimentoLiquido / valor) * 100).toFixed(0) + '%';
    P_totalAcomulado.style.width = Pm_rLiquido;

    //RESULTADOS
    //R_ = Resultado
    R_rLiquido.innerText = `${rendimentoLiquido.toLocaleString('pt-BR', {
        style: 'currency', currency: 'BRL'
    })} (${Pm_rLiquido})`;

    R_rBruto.innerText = `${rendimentoBruto.toLocaleString('pt-BR', {
        style: 'currency', currency: 'BRL'
    })} (${Pm_rbruto})`;

    R_iIof.innerText = `${iof.toLocaleString('pt-BR', {
        style: 'currency', currency: 'BRL'
    })} (${Pm_iIof})`

    R_iRenda.innerText = `${ir.toLocaleString('pt-BR', {
        style: 'currency', currency: 'BRL'
    })} (${Pm_iRenda})`;

    R_totalAcumulado.innerText = `${(valor + rendimentoLiquido).toLocaleString('pt-BR', {
        style: 'currency', currency: 'BRL'
    })} (${Pm_totalAcomulado})`;

    diasUteis = diasUteis.toLocaleString('pt-BR',
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });

    diasCorridos = diasCorridos.toLocaleString('pt-BR',
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });

    R_resultado.innerHTML = `
        <hr>
        <p>Dias úteis considerados: <strong>${diasUteis}</strong></p>
        <p>Dias corridos considerados: <strong>${diasCorridos}</strong></p>
        <p>Taxa usada: <strong>${(taxa * 100).toFixed(2)}% ${periodo === 'anual' ? 'a.a.' : periodo === 'mensal' ? 'a.m.' : 'a.d.'}</strong></p>
        `;
}