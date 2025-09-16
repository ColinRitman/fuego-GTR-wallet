import { invoke } from "@tauri-apps/api/core";

// Wallet state
let walletInfo: any = null;
let transactions: any[] = [];
let networkStatus: any = null;
let termDeposits: any[] = [];

// Real-time update state
let updateInterval: number | null = null;
let isUpdating = false;
let lastSyncHeight = 0;
let lastBalance = 0;

// DOM elements
let walletStatusEl: HTMLElement | null;
let balanceEl: HTMLElement | null;
let addressEl: HTMLElement | null;
let transactionsEl: HTMLElement | null;
let networkStatusEl: HTMLElement | null;
let syncProgressEl: HTMLElement | null;
let lastUpdateEl: HTMLElement | null;

// Initialize the application
async function init() {
  console.log("Initializing Fuego Desktop Wallet...");
  
  // Get DOM elements
  getDOMElements();
  
  // Load initial data
  await loadWalletInfo();
  await loadTransactions();
  await loadNetworkStatus();
  await loadTermDeposits();
  
  // Update UI
  updateUI();
  
  // Start real-time updates
  startRealTimeUpdates();
  
  // Setup event listeners
  setupEventListeners();
}

// Get DOM elements
function getDOMElements() {
  walletStatusEl = document.querySelector("#wallet-status");
  balanceEl = document.querySelector("#balance");
  addressEl = document.querySelector("#address");
  transactionsEl = document.querySelector("#transactions");
  networkStatusEl = document.querySelector("#network-status");
  syncProgressEl = document.querySelector("#sync-progress");
  lastUpdateEl = document.querySelector("#last-update");
}

// Load wallet information
async function loadWalletInfo() {
  try {
    walletInfo = await invoke("get_wallet_info");
    console.log("Wallet info loaded:", walletInfo);
    
    // Track balance changes
    if (walletInfo && walletInfo.balance !== lastBalance) {
      lastBalance = walletInfo.balance;
      showNotification(`Balance updated: ${formatXFG(walletInfo.balance)} XFG`, 'info');
    }
  } catch (error) {
    console.error("Failed to load wallet info:", error);
    showNotification("Failed to load wallet info", 'error');
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
    
    // Track sync progress changes
    if (networkStatus && networkStatus.sync_height !== lastSyncHeight) {
      const progress = networkStatus.network_height > 0 ? 
        (networkStatus.sync_height / networkStatus.network_height) * 100 : 0;
      
      if (networkStatus.sync_height > lastSyncHeight) {
        showNotification(`Sync progress: ${progress.toFixed(1)}%`, 'info');
      }
      
      lastSyncHeight = networkStatus.sync_height;
    }
  } catch (error) {
    console.error("Failed to load network status:", error);
    showNotification("Failed to load network status", 'error');
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
  
  // Update last update timestamp
  if (lastUpdateEl) {
    lastUpdateEl.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
  }
}

// Refresh data
async function refresh() {
  await loadWalletInfo();
  await loadTransactions();
  await loadNetworkStatus();
  await loadTermDeposits();
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

// Fetch live Fuego network data
async function fetchLiveNetworkData() {
  try {
    const data = await invoke("get_fuego_network_data");
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
  const syncEl = document.querySelector("#sync-progress");
  if (!syncEl || !networkStatus) return;
  
  const progress = networkStatus.network_height > 0 ? 
    (networkStatus.sync_height / networkStatus.network_height) * 100 : 0;
  
  // Update progress bar
  const syncFill = syncEl.querySelector(".sync-fill") as HTMLElement;
  const syncText = syncEl.querySelector(".sync-text") as HTMLElement;
  
  if (syncFill) {
    syncFill.style.width = `${progress}%`;
  }
  
  if (syncText) {
    syncText.textContent = `${networkStatus.is_syncing ? 'Syncing' : 'Synced'} 
      (${networkStatus.sync_height}/${networkStatus.network_height})`;
  }
}

// Term Deposits functionality

// Load term deposits
async function loadTermDeposits() {
  try {
    termDeposits = await invoke("get_term_deposits");
    console.log("Term deposits loaded:", termDeposits);
    updateTermDepositsDisplay();
  } catch (error) {
    console.error("Failed to load term deposits:", error);
    termDeposits = [];
    updateTermDepositsDisplay();
  }
}

// Create a new term deposit
async function createTermDeposit() {
  const amountInput = (document.querySelector("#deposit-amount") as HTMLInputElement)?.value;
  const termSelect = (document.querySelector("#deposit-term") as HTMLSelectElement)?.value;

  if (!amountInput || !termSelect) {
    alert("Please fill in all deposit fields");
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
    const term = parseInt(termSelect);
    
    const depositId = await invoke("create_term_deposit", {
      amount: amountAtomicUnits,
      term: term
    });
    
    console.log("Term deposit created:", depositId);
    alert(`Term deposit created successfully!\nDeposit ID: ${depositId}`);
    
    // Clear form
    (document.querySelector("#deposit-amount") as HTMLInputElement).value = "";
    
    // Refresh deposits
    await loadTermDeposits();
  } catch (error) {
    console.error("Failed to create term deposit:", error);
    alert(`Failed to create term deposit: ${error}`);
  }
}

// Update term deposits display
function updateTermDepositsDisplay() {
  const depositsListEl = document.querySelector("#deposits-list");
  
  if (!depositsListEl) return;
  
  if (termDeposits.length === 0) {
    depositsListEl.innerHTML = `
      <div style="text-align: center; color: #64748b; padding: 20px;">
        No term deposits found.<br>
        Create your first deposit to start earning interest!
      </div>
    `;
    return;
  }
  
  depositsListEl.innerHTML = termDeposits.map(deposit => `
    <div class="deposit-item">
      <div class="deposit-header">
        <div class="deposit-amount">${formatXFG(deposit.amount)} XFG</div>
        <div class="deposit-status ${deposit.status}">${deposit.status}</div>
      </div>
      <div class="deposit-details">
        <div class="deposit-detail">
          <span class="deposit-detail-label">Term:</span>
          <span class="deposit-detail-value">${deposit.term} days</span>
        </div>
        <div class="deposit-detail">
          <span class="deposit-detail-label">Interest Rate:</span>
          <span class="deposit-detail-value">${deposit.rate}%</span>
        </div>
        <div class="deposit-detail">
          <span class="deposit-detail-label">Interest Earned:</span>
          <span class="deposit-detail-value">${formatXFG(deposit.interest)} XFG</span>
        </div>
        <div class="deposit-detail">
          <span class="deposit-detail-label">Unlock Time:</span>
          <span class="deposit-detail-value">${deposit.unlockTime || 'N/A'}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// Format XFG amount (atomic units to XFG with 7 decimal places)
function formatXFG(atomicUnits: number): string {
  return (atomicUnits / 10000000).toFixed(7);
}

// ===== PHASE 2.1: ENHANCED USER EXPERIENCE =====

// Start real-time updates
function startRealTimeUpdates() {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
  
  // Update every 5 seconds
  updateInterval = setInterval(async () => {
    if (!isUpdating) {
      await performBackgroundUpdate();
    }
  }, 5000);
  
  console.log("Real-time updates started");
}

// Stop real-time updates
function stopRealTimeUpdates() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
  console.log("Real-time updates stopped");
}

// Perform background update
async function performBackgroundUpdate() {
  if (isUpdating) return;
  
  isUpdating = true;
  
  try {
    // Update network status and wallet info in background
    await Promise.all([
      loadNetworkStatus(),
      loadWalletInfo()
    ]);
    
    // Update UI with new data
    updateUI();
    
    // Update last update timestamp
    if (lastUpdateEl) {
      lastUpdateEl.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    }
    
  } catch (error) {
    console.error("Background update failed:", error);
  } finally {
    isUpdating = false;
  }
}

// Setup event listeners
function setupEventListeners() {
  // Refresh button
  document.querySelector("#refresh-btn")?.addEventListener("click", async () => {
    showNotification("Refreshing data...", 'info');
    await refresh();
    showNotification("Data refreshed", 'success');
  });
  
  // Auto-refresh on window focus
  window.addEventListener('focus', async () => {
    console.log("Window focused, refreshing data...");
    await performBackgroundUpdate();
  });
  
  // Pause updates when window is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopRealTimeUpdates();
    } else {
      startRealTimeUpdates();
    }
  });
}

// Show notification
function showNotification(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
  
  console.log(`Notification [${type}]: ${message}`);
}

// Enhanced transaction loading with pagination
async function loadMoreTransactions() {
  try {
    const moreTransactions = await invoke("get_transactions", { 
      limit: 10, 
      offset: transactions.length 
    });
    
    if (moreTransactions && moreTransactions.length > 0) {
      transactions = [...transactions, ...moreTransactions];
      updateUI();
      showNotification(`Loaded ${moreTransactions.length} more transactions`, 'info');
    } else {
      showNotification("No more transactions to load", 'info');
    }
  } catch (error) {
    console.error("Failed to load more transactions:", error);
    showNotification("Failed to load more transactions", 'error');
  }
}

// Enhanced deposit creation with validation
async function createTermDepositEnhanced() {
  const amountInput = (document.querySelector("#deposit-amount") as HTMLInputElement)?.value;
  const termSelect = (document.querySelector("#deposit-term") as HTMLSelectElement)?.value;

  if (!amountInput || !termSelect) {
    showNotification("Please fill in all deposit fields", 'warning');
    return;
  }

  const amount = parseFloat(amountInput);
  if (amount <= 0) {
    showNotification("Amount must be greater than 0", 'warning');
    return;
  }

  // Check if user has sufficient balance
  if (walletInfo && amount * 10000000 > walletInfo.balance) {
    showNotification("Insufficient balance for this deposit", 'error');
    return;
  }

  try {
    showNotification("Creating term deposit...", 'info');
    
    // Convert XFG to atomic units (7 decimal places)
    const amountAtomicUnits = Math.floor(amount * 10000000);
    const term = parseInt(termSelect);
    
    const depositId = await invoke("create_term_deposit", {
      amount: amountAtomicUnits,
      term: term
    });
    
    console.log("Deposit created:", depositId);
    showNotification(`Term deposit created successfully! Deposit ID: ${depositId}`, 'success');
    
    // Clear form
    (document.querySelector("#deposit-amount") as HTMLInputElement).value = "";
    
    // Refresh deposits
    await loadTermDeposits();
    
  } catch (error) {
    console.error("Failed to create deposit:", error);
    showNotification(`Failed to create deposit: ${error}`, 'error');
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
  
  // Set up create term deposit button
  document.querySelector("#create-deposit-btn")?.addEventListener("click", createTermDepositEnhanced);
  
  // Set up load more transactions button
  document.querySelector("#load-more-btn")?.addEventListener("click", loadMoreTransactions);
  
  // Initialize the app
  init();
});
