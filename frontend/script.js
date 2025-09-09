function generateAddress() {
  const crypto = document.getElementById("crypto").value;
  let addr = "";
  if (crypto === "BTC") {
    addr = "tb1q-example-bitcoin-testnet"; // sample Bitcoin testnet address
  } else if (crypto === "ETH") {
    addr = "0xExampleEthereumSepoliaTestnet"; // sample Ethereum testnet address
  }
  document.getElementById("address").innerText = addr;
}
