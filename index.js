const { readFileSync } = require('fs');


class Repositorio {
  constructor() {
    this.pecas = JSON.parse(readFileSync('./pecas.json'));
  }

  getPeca(apre) {
    return this.pecas[apre.id];
  }
}


class ServicoCalculoFatura {
  constructor(repo) {
    this.repo = repo;
  }

  calcularTotalApresentacao(apre)
  {
    let total = 0;
    switch (this.repo.getPeca(apre).tipo) {
      case "tragedia":
        total = 40000;
        if (apre.audiencia > 30) {
          total += 1000 * (apre.audiencia - 30);
        }
        break;
      case "comedia":
        total = 30000;
        if (apre.audiencia > 20) {
          total += 10000 + 500 * (apre.audiencia - 20);
        }
        total += 300 * apre.audiencia;
        break;
      default:
          throw new Error(`Peça desconhecia: ${this.repo.getPeca(apre).tipo}`);
      }
    return total;
  }

  calcularCredito(apre) {
    let creditos = 0;

    // créditos para próximas contratações
    creditos += Math.max(apre.audiencia - 30, 0);
    if (this.repo.getPeca(apre).tipo === "comedia") 
      creditos += Math.floor(apre.audiencia / 5);
    
    return creditos;
  }


  calcularTotalFatura(apresentacoes) {
    let total = 0;

    for (let apre of apresentacoes) {
      total += this.calcularTotalApresentacao(apre);
    }

    return total;
  }

  calcularTotalCreditos(apresentacoes) {
    let creditos = 0;

    for (let apre of apresentacoes) {
      creditos += this.calcularCredito(apre);
    }

    return creditos;
  }
};



function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR",
  {
    style: "currency", currency: "BRL",
    minimumFractionDigits: 2
  }).format(valor / 100);
}

       

function gerarFaturaStr (fatura, calc) {
    let creditos = 0;
    let faturaStr = `Fatura ${fatura.cliente}\n`;


    for (let apre of fatura.apresentacoes) {
      creditos += calc.calcularCredito(apre);
      faturaStr += `  ${calc.repo.getPeca(apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(apre))} (${apre.audiencia} assentos)\n`;
    }
    faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(fatura.apresentacoes))}\n`;
    faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(fatura.apresentacoes)} \n`;

  return faturaStr;
}


function gerarFaturaHTML(fatura, calc) {
  let creditos = 0;
  let faturaHtml = `<html>\n`;
  faturaHtml += `<p> Fatura ${fatura.cliente} </p>\n`;
  faturaHtml += `<ul>\n`;

  for (let apre of fatura.apresentacoes) {
    creditos += calc.calcularCredito(apre);
    faturaHtml += `<li> ${calc.repo.getPeca(papre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(apre))} (${apre.audiencia} assentos) </li>\n`;
  }

  faturaHtml += `</ul>\n`;
  faturaHtml += `<p> Valor total: ${formatarMoeda(calc.calcularTotalFatura(fatura.apresentacoes))} </p>\n`
  faturaHtml += `<p> Créditos acumulados: ${calc.calcularTotalCreditos(fatura.apresentacoes)} </p>\n`
  faturaHtml += `</html>`;

  return faturaHtml;
}


const faturas = JSON.parse(readFileSync('./faturas.json'));
const calc = new ServicoCalculoFatura(new Repositorio());
const faturaStr = gerarFaturaStr(faturas, calc);
//const faturaHtml = gerarFaturaHTML(faturas, pecas, calc);
console.log(faturaStr);
//console.log(faturaHtml);
