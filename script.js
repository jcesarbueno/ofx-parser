document.getElementById("processButton").addEventListener("click", () => {
    const fileInput = document.getElementById("fileInput");
    const outputDiv = document.getElementById("output");
  
    if (!fileInput.files.length) {
      alert("Por favor, selecione um arquivo OFX.");
      return;
    }
  
    const file = fileInput.files[0];
    const reader = new FileReader();
  
    reader.onload = function (event) {
      const ofxContent = event.target.result;
      const filteredTransactions = parseOFX(ofxContent);
      displayResults(filteredTransactions);
    };
  
    reader.readAsText(file);
  });
  
  function parseOFX(content) {
    // Regex para capturar transações
    const transactionRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g;
    const transactions = [];
  
    let match;
    while ((match = transactionRegex.exec(content)) !== null) {
      const transaction = match[1];
      const type = getTagValue(transaction, "TRNTYPE");
      const amount = parseFloat(getTagValue(transaction, "TRNAMT"));
      const memo = getTagValue(transaction, "MEMO");
  
      // Filtrar por TRNTYPE = CREDIT, TRNAMT > 0, MEMO contém 'PIX'
      if (type === "CREDIT" && amount > 0 && memo.includes("PIX")) {
        transactions.push({ type, amount, memo });
      }
    }
  
    return transactions;
  }
  
  function getTagValue(transaction, tag) {
    const regex = new RegExp(`<${tag}>(.*?)<\/${tag}>`);
    const match = regex.exec(transaction);
    return match ? match[1] : "";
  }
  
  function displayResults(transactions) {
    const outputDiv = document.getElementById("output");
    if (!transactions.length) {
      outputDiv.innerHTML = "<p>Nenhuma transação encontrada.</p>";
      return;
    }
  
    let total = 0;
    const resultsHtml = transactions.map((t) => {
      total += t.amount;
      return `<p>Tipo: ${t.type} | Valor: R$ ${t.amount.toFixed(2)} | Memo: ${t.memo}</p>`;
    });
  
    resultsHtml.push(`<p><strong>Total: R$ ${total.toFixed(2)}</strong></p>`);
    outputDiv.innerHTML = resultsHtml.join("");
  }
  