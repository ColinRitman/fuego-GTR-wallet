import { invoke } from "@tauri-apps/api/core";

// Wallet state
let walletInfo: any = null;
let transactions: any[] = [];
let networkStatus: any = null;

// DOM elements
let walletStatusEl: HTMLElement | null;
let balanceEl: HTMLElement | null;
let addressEl: HTMLElement | null;
let transactionsEl: HTMLElement | null;
let networkStatusEl: HTMLElement | null;

// Initialize the application
async function init() {
  console.log("Initializing Fuego Desktop Wallet...");
  
  // Load initial data
  await loadWalletInfo();
  await loadTransactions();
  await loadNetworkStatus();
  
  // Update UI
  updateUI();
}

// Load wallet information
async function loadWalletInfo() {
  try {
    walletInfo = await invoke("get_wallet_info");
    console.log("Wallet info loaded:", walletInfo);
  } catch (error) {
    console.error("Failed to load wallet info:", error);
  }
}

// Load transactions
async function loadTransactions() {
  try {
    transactions = await invoke("get_transactions", { limit: 10, offset: 0 });
    console.log("Transactions loaded:", transactions);
  } catch (error) {
    console.error("Failed to load transactions:", error);
  }
}

// Load network status
async function loadNetworkStatus() {
  try {
    networkStatus = await invoke("get_network_status");
    console.log("Network status loaded:", networkStatus);
  } catch (error) {
    console.error("Failed to load network status:", error);
  }
}

// Update UI with loaded data
function updateUI() {
  // Update wallet status
  if (walletStatusEl) {
    walletStatusEl.textContent = walletInfo ? "Wallet Connected" : "Wallet Disconnected";
    walletStatusEl.className = walletInfo ? "status connected" : "status disconnected";
  }
  
  // Update balance
  if (balanceEl && walletInfo) {
    // XFG uses 7 decimal places (10000000 atomic units = 1 XFG)
    const balance = (walletInfo.balance / 10000000).toFixed(7);
    balanceEl.textContent = `${balance} XFG`;
  }
  
  // Update address
  if (addressEl && walletInfo) {
    addressEl.textContent = walletInfo.address || "No address";
  }
  
  // Update transactions
  if (transactionsEl) {
    transactionsEl.innerHTML = transactions.map(tx => `
      <div class="transaction">
        <div class="tx-info">
          <span class="tx-amount ${tx.amount > 0 ? 'positive' : 'negative'}">
            ${tx.amount > 0 ? '+' : ''}${(tx.amount / 10000000).toFixed(7)} XFG
          </span>
          <span class="tx-address">${tx.address}</span>
        </div>
        <div class="tx-details">
          <span class="tx-time">${new Date(tx.timestamp * 1000).toLocaleString()}</span>
          <span class="tx-status ${tx.is_confirmed ? 'confirmed' : 'pending'}">
            ${tx.is_confirmed ? 'Confirmed' : 'Pending'}
          </span>
        </div>
      </div>
    `).join('');
  }
  
  // Update network status
  if (networkStatusEl && networkStatus) {
    networkStatusEl.innerHTML = `
      <div class="network-info">
        <span class="status ${networkStatus.is_connected ? 'connected' : 'disconnected'}">
          ${networkStatus.is_connected ? 'Connected' : 'Disconnected'}
        </span>
        <span class="sync-info">
          ${networkStatus.is_syncing ? 'Syncing' : 'Synced'} 
          (${networkStatus.sync_height}/${networkStatus.network_height})
        </span>
        <span class="peer-count">${networkStatus.peer_count} peers</span>
      </div>
    `;
  }
}

// Refresh data
async function refresh() {
  await loadWalletInfo();
  await loadTransactions();
  await loadNetworkStatus();
  updateUI();
}

// Test FFI integration
async function testFFI() {
  try {
    const result = await invoke("test_ffi_integration");
    console.log("FFI Test Result:", result);
    
    // Show result in a simple alert for now
    const balanceXFG = (result.wallet.balance / 10000000).toFixed(7);
    alert(`FFI Test Successful!\n\nWallet Address: ${result.wallet.address}\nBalance: ${balanceXFG} XFG\nTransaction Hash: ${result.transaction.hash}`);
  } catch (error) {
    console.error("FFI Test Failed:", error);
    alert(`FFI Test Failed: ${error}`);
  }
}

// Test real CryptoNote integration
async function testRealCryptoNote() {
  try {
    const result = await invoke("test_real_cryptonote");
    console.log("Real CryptoNote Test Result:", result);
    
    // Show result in a detailed alert
    const networkStatus = result.network.status;
    const balanceXFG = (result.wallet.balance / 10000000).toFixed(7);
    alert(`Real Fuego Test Successful!\n\nWallet Address: ${result.wallet.address}\nBalance: ${balanceXFG} XFG\nNetwork Connected: ${networkStatus.is_connected}\nConnection Type: ${networkStatus.connection_type}\nPeer Count: ${networkStatus.peer_count}\nTransaction Hash: ${result.transaction.hash}`);
  } catch (error) {
    console.error("Real CryptoNote Test Failed:", error);
    alert(`Real CryptoNote Test Failed: ${error}`);
  }
}

// Initialize when DOM is loaded
window.addEventListener("DOMContentLoaded", () => {
  walletStatusEl = document.querySelector("#wallet-status");
  balanceEl = document.querySelector("#balance");
  addressEl = document.querySelector("#address");
  transactionsEl = document.querySelector("#transactions");
  networkStatusEl = document.querySelector("#network-status");
  
  // Set up refresh button
  document.querySelector("#refresh-btn")?.addEventListener("click", refresh);
  
  // Set up FFI test button
  document.querySelector("#test-ffi-btn")?.addEventListener("click", testFFI);
  
  // Set up real CryptoNote test button
  document.querySelector("#test-real-btn")?.addEventListener("click", testRealCryptoNote);
  
  // Initialize the app
  init();
});
