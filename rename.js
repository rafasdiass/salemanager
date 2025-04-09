/**
 * Script para atualizar referências internas no conteúdo dos arquivos
 * e renomear arquivos e pastas conforme os mapeamentos definidos.
 *
 * Mapeamentos:
 * - "cooperado" -> "client" e "cooperados" -> "clients"
 * - "comercial" -> "employee" e "comerciais" -> "employees"
 *
 * O script varre os arquivos (.ts, .html, .scss) substituindo as ocorrências
 * dentro do conteúdo e, em seguida, percorre todos os itens (arquivos e pastas)
 * renomeando-os conforme os mapeamentos, levando em consideração prefixos e sufixos.
 */

const fs = require('fs').promises;
const path = require('path');
const glob = require('glob');

/**
 * Função utilitária para usar glob com Promise.
 * @param {string} pattern - O padrão de busca.
 * @param {object} options - Opções para glob.
 * @returns {Promise<string[]>} - Lista de caminhos encontrados.
 */
function globPromise(pattern, options = {}) {
  return new Promise((resolve, reject) => {
    glob(pattern, options, (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });
}

// Mapeamentos para as substituições, incluindo variações singular e plural
const mappings = [
  // Para "cooperado" e "cooperados"
  { pattern: /cooperados/gi, replacement: 'clients' },
  { pattern: /Cooperados/g, replacement: 'Clients' },
  { pattern: /cooperado/gi, replacement: 'client' },
  { pattern: /Cooperado/g, replacement: 'Client' },
  // Para "comercial", "comerciais" e variações
  { pattern: /comerciais/gi, replacement: 'employees' },
  { pattern: /Comerciais/g, replacement: 'Employees' },
  { pattern: /comercial/gi, replacement: 'employee' },
  { pattern: /Comercial/g, replacement: 'Employee' }
];

/**
 * Aplica os mapeamentos definidos em uma string.
 * @param {string} str - A string a ser transformada.
 * @returns {string} - A string com as substituições aplicadas.
 */
function applyMappings(str) {
  let result = str;
  mappings.forEach(({ pattern, replacement }) => {
    result = result.replace(pattern, replacement);
  });
  return result;
}

/**
 * Atualiza o conteúdo dos arquivos.
 * Percorre os arquivos com as extensões definidas e substitui as referências.
 */
async function updateFileContents() {
  try {
    const pattern = "**/*.{ts,html,scss}";
    const files = await globPromise(pattern, { ignore: "node_modules/**" });
  
    for (const file of files) {
      try {
        let data = await fs.readFile(file, 'utf8');
        const updatedData = applyMappings(data);
        if (updatedData !== data) {
          await fs.writeFile(file, updatedData, 'utf8');
          console.log(`Conteúdo atualizado: ${file}`);
        }
      } catch (fileErr) {
        console.error(`Erro ao processar o arquivo ${file}:`, fileErr);
      }
    }
  } catch (err) {
    console.error("Erro ao buscar arquivos para atualização do conteúdo:", err);
  }
}

/**
 * Renomeia arquivos e pastas que contenham os termos antigos conforme os mapeamentos.
 * Varrer todos os itens (exceto node_modules e dist) e renomear os caminhos modificando
 * nomes que possuam os termos para os novos valores, considerando prefixos e sufixos.
 */
async function renameFilesAndDirectories() {
  try {
    const items = await globPromise("**/*", { ignore: ["node_modules/**", "dist/**"] });
    
    // Ordena decrescentemente pela quantidade de separadores para renomear itens internos primeiro
    items.sort((a, b) => b.split(path.sep).length - a.split(path.sep).length);
    
    for (const itemPath of items) {
      const baseName = path.basename(itemPath);
      const newBaseName = applyMappings(baseName);
      
      if (newBaseName !== baseName) {
        const newPath = path.join(path.dirname(itemPath), newBaseName);
        try {
          await fs.rename(itemPath, newPath);
          console.log(`Renomeado: ${itemPath} -> ${newPath}`);
        } catch (renameErr) {
          console.error(`Erro ao renomear ${itemPath}:`, renameErr);
        }
      }
    }
  } catch (err) {
    console.error("Erro ao buscar itens para renomear:", err);
  }
}

/**
 * Função principal que executa as atualizações de conteúdo e a renomeação.
 */
async function main() {
  console.log("Iniciando atualização do conteúdo dos arquivos...");
  await updateFileContents();
  
  console.log("Iniciando renomeação de arquivos e pastas...");
  await renameFilesAndDirectories();
  
  console.log("Processo de atualização concluído.");
}

main().catch(err => {
  console.error("Erro no script principal:", err);
});
