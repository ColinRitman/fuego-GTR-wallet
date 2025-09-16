import { invoke } from "@tauri-apps/api/core";

// Wallet state
let walletInfo: any = null;
let transactions: any[] = [];
let networkStatus: any = null;

// Advanced features state
let enhancedWalletInfo: any = null;
let advancedTransactions: any[] = [];
let performanceMetrics: any = null;
let appSettings: any = null;
// Note: currentLanguage managed by backend; keep for future UI language controls
// const currentLanguage = 'en';
let availableLanguages: any[] = [];
let notifications: any[] = [];

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
  await loadDepositAddresses();
  await loadDepositTransactions();
  
  // Load advanced features
  await loadEnhancedWalletInfo();
  await loadAdvancedTransactions();
  await loadPerformanceMetrics();
  await loadAppSettings();
  await loadAvailableLanguages();
  await loadNotifications();
  
  // Update UI
  updateUI();
  
  // Set the main address as the current deposit address
  if (walletInfo && walletInfo.address) {
    currentDepositAddress = walletInfo.address;
    updateDepositAddressDisplay();
  }
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

// Advanced Features Loading Functions
async function loadEnhancedWalletInfo() {
  try {
    enhancedWalletInfo = await invoke('get_enhanced_wallet_info');
    console.log('Enhanced wallet info loaded:', enhancedWalletInfo);
  } catch (error) {
    console.error('Failed to load enhanced wallet info:', error);
  }
}

async function loadAdvancedTransactions() {
  try {
    advancedTransactions = await invoke('get_advanced_transactions');
    console.log('Advanced transactions loaded:', advancedTransactions);
  } catch (error) {
    console.error('Failed to load advanced transactions:', error);
  }
}

async function loadPerformanceMetrics() {
  try {
    performanceMetrics = await invoke('get_performance_metrics');
    console.log('Performance metrics loaded:', performanceMetrics);
  } catch (error) {
    console.error('Failed to load performance metrics:', error);
  }
}

async function loadAppSettings() {
  try {
    appSettings = await invoke('get_app_settings');
    console.log('App settings loaded:', appSettings);
  } catch (error) {
    console.error('Failed to load app settings:', error);
  }
}

async function loadAvailableLanguages() {
  try {
    availableLanguages = await invoke('get_available_app_languages');
    console.log('Available languages loaded:', availableLanguages);
  } catch (error) {
    console.error('Failed to load available languages:', error);
  }
}

async function loadNotifications() {
  try {
    notifications = await invoke('get_notifications');
    console.log('Notifications loaded:', notifications);
  } catch (error) {
    console.error('Failed to load notifications:', error);
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
  
  // Update sync progress display
  updateSyncDisplay(networkStatus);
  
  // Update advanced features
  updateAdvancedUI();
}

// Refresh data
async function refresh() {
  await loadWalletInfo();
  await loadTransactions();
  await loadNetworkStatus();
  await loadDepositAddresses();
  await loadDepositTransactions();
  updateUI();
  
  // Update deposit address if needed
  if (walletInfo && walletInfo.address && !currentDepositAddress) {
    currentDepositAddress = walletInfo.address;
    updateDepositAddressDisplay();
  }
}

// Advanced UI updater (placeholder rendering of enhanced info and notifications)
function updateAdvancedUI() {
  // Optionally render enhancedWalletInfo somewhere if needed
  // For now, keep minimal to avoid DOM elements that don't exist yet
}

// Test FFI integration
async function testFFI() {
  try {
    const result: any = await invoke("test_ffi_integration");
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
    const result: any = await invoke("test_real_cryptonote");
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

// Fetch live Fuego network data
async function fetchLiveNetworkData() {
  try {
    const data: any = await invoke("get_fuego_network_data");
    console.log("Live Network Data:", data);
    
    // Show detailed network information
    const height = data.height;
    const peers = data.peer_count;
    const difficulty = data.difficulty;
    const lastReward = (data.last_block_reward / 10000000).toFixed(7);
    const version = data.version;
    const txCount = data.tx_count;
    const feeAddress = data.fee_address;
    
    alert(`🔥 Live Fuego Network Data 🔥\n\nBlock Height: ${height.toLocaleString()}\nPeer Count: ${peers}\nDifficulty: ${difficulty.toLocaleString()}\nLast Block Reward: ${lastReward} XFG\nVersion: ${version}\nTotal Transactions: ${txCount.toLocaleString()}\nFee Address: ${feeAddress.substring(0, 20)}...\n\nSource: fuego.spaceportx.net`);
  } catch (error) {
    console.error("Failed to fetch network data:", error);
    alert(`Failed to fetch network data: ${error}`);
  }
}

// Send transaction function
async function sendTransaction() {
  const recipientAddress = (document.querySelector("#recipient-address") as HTMLInputElement)?.value;
  const amountInput = (document.querySelector("#amount") as HTMLInputElement)?.value;
  const paymentId = (document.querySelector("#payment-id") as HTMLInputElement)?.value;

  if (!recipientAddress || !amountInput) {
    alert("Please fill in recipient address and amount");
    return;
  }

  const amount = parseFloat(amountInput);
  if (amount <= 0) {
    alert("Amount must be greater than 0");
    return;
  }

  try {
    // Convert XFG to atomic units (7 decimal places)
    const amountAtomicUnits = Math.floor(amount * 10000000);
    
    const result = await invoke("send_transaction", {
      recipient: recipientAddress,
      amount: amountAtomicUnits,
      paymentId: paymentId || null,
      mixin: 5
    });
    
    console.log("Transaction sent:", result);
    alert(`Transaction sent successfully!\nHash: ${result}`);
    
    // Clear form
    (document.querySelector("#recipient-address") as HTMLInputElement).value = "";
    (document.querySelector("#amount") as HTMLInputElement).value = "";
    (document.querySelector("#payment-id") as HTMLInputElement).value = "";
    
    // Refresh wallet info
    await refresh();
  } catch (error) {
    console.error("Failed to send transaction:", error);
    alert(`Failed to send transaction: ${error}`);
  }
}

// Update sync progress display
function updateSyncDisplay(networkStatus: any) {
  const syncProgressEl = document.querySelector("#sync-progress");
  const syncDetailsEl = document.querySelector("#sync-details");
  
  if (syncProgressEl && syncDetailsEl) {
    if (networkStatus.is_syncing) {
      const progress = ((networkStatus.sync_height / networkStatus.network_height) * 100).toFixed(1);
      syncProgressEl.textContent = `Syncing... ${progress}%`;
      syncDetailsEl.textContent = `Block ${networkStatus.sync_height.toLocaleString()} of ${networkStatus.network_height.toLocaleString()}`;
    } else {
      syncProgressEl.textContent = "✅ Fully Synced";
      syncDetailsEl.textContent = `Connected to ${networkStatus.connection_type}`;
    }
  }
}

// Deposit functionality
let currentDepositAddress = "";
let depositAddresses: any[] = [];
let depositTransactions: any[] = [];

// Load deposit addresses
async function loadDepositAddresses() {
  try {
    depositAddresses = await invoke("get_deposit_addresses");
    console.log("Deposit addresses loaded:", depositAddresses);
    updateDepositAddressesDisplay();
  } catch (error) {
    console.error("Failed to load deposit addresses:", error);
  }
}

// Load deposit transactions
async function loadDepositTransactions() {
  try {
    depositTransactions = await invoke("get_deposit_transactions");
    console.log("Deposit transactions loaded:", depositTransactions);
    updateDepositTransactionsDisplay();
  } catch (error) {
    console.error("Failed to load deposit transactions:", error);
  }
}

// Generate new deposit address
async function generateNewDepositAddress() {
  const label = prompt("Enter a label for this deposit address (optional):");
  if (label === null) return; // User cancelled
  
  try {
    const newAddress: any = await invoke("generate_deposit_address", { label: label || null });
    console.log("Generated new deposit address:", newAddress);
    
    // Reload deposit addresses
    await loadDepositAddresses();
    
    // Update main deposit address display
    currentDepositAddress = newAddress.address;
    updateDepositAddressDisplay();
    
    alert(`New deposit address generated!\n\nAddress: ${newAddress.address}\nLabel: ${newAddress.label}`);
  } catch (error) {
    console.error("Failed to generate deposit address:", error);
    alert(`Failed to generate deposit address: ${error}`);
  }
}

// Copy address to clipboard
async function copyAddressToClipboard() {
  if (!currentDepositAddress) {
    alert("No deposit address available");
    return;
  }
  
  try {
    await navigator.clipboard.writeText(currentDepositAddress);
    alert("Address copied to clipboard!");
  } catch (error) {
    console.error("Failed to copy address:", error);
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = currentDepositAddress;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    alert("Address copied to clipboard!");
  }
}

// Update deposit address display
function updateDepositAddressDisplay() {
  const depositAddressEl = document.querySelector("#deposit-address");
  if (depositAddressEl) {
    depositAddressEl.textContent = currentDepositAddress || "Loading...";
  }
  
  // Update QR code placeholder
  const qrCodeEl = document.querySelector("#qr-code .qr-placeholder");
  if (qrCodeEl && currentDepositAddress) {
    qrCodeEl.textContent = `QR Code for:\n${currentDepositAddress.substring(0, 20)}...`;
  }
}

// Update deposit addresses list
function updateDepositAddressesDisplay() {
  const addressesEl = document.querySelector("#deposit-addresses");
  if (addressesEl) {
    if (depositAddresses.length === 0) {
      addressesEl.innerHTML = '<div class="no-data">No deposit addresses found</div>';
      return;
    }
    
    addressesEl.innerHTML = depositAddresses.map(addr => `
      <div class="deposit-address-item">
        <div class="deposit-address-item-header">
          <span class="deposit-address-label">${addr.label}</span>
          <span class="deposit-address-stats">
            ${addr.transaction_count} transactions • ${(addr.total_received / 10000000).toFixed(7)} XFG received
          </span>
        </div>
        <div class="deposit-address-text">${addr.address}</div>
        <div class="deposit-address-stats">
          Created: ${new Date(addr.created_at * 1000).toLocaleString()}
          ${addr.is_main ? ' • Main Address' : ''}
        </div>
      </div>
    `).join('');
  }
}

// Update deposit transactions display
function updateDepositTransactionsDisplay() {
  const transactionsEl = document.querySelector("#deposit-transactions");
  if (transactionsEl) {
    if (depositTransactions.length === 0) {
      transactionsEl.innerHTML = '<div class="no-data">No deposit transactions found</div>';
      return;
    }
    
    transactionsEl.innerHTML = depositTransactions.map(tx => `
      <div class="deposit-transaction-item">
        <div class="deposit-transaction-header">
          <span class="deposit-transaction-amount">+${(tx.amount / 10000000).toFixed(7)} XFG</span>
          <span class="deposit-transaction-time">${new Date(tx.timestamp * 1000).toLocaleString()}</span>
        </div>
        <div class="deposit-transaction-details">
          From: ${tx.from_address}<br>
          Transaction: ${tx.hash}<br>
          Status: ${tx.is_confirmed ? 'Confirmed' : 'Pending'}
        </div>
      </div>
    `).join('');
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
  
  // Set up live network data button
  document.querySelector("#network-data-btn")?.addEventListener("click", fetchLiveNetworkData);
  
  // Set up send transaction button
  document.querySelector("#send-btn")?.addEventListener("click", sendTransaction);
  
  // Set up deposit buttons
  document.querySelector("#copy-address-btn")?.addEventListener("click", copyAddressToClipboard);
  document.querySelector("#generate-new-address-btn")?.addEventListener("click", generateNewDepositAddress);
  
  // Initialize the app
  init();
});
