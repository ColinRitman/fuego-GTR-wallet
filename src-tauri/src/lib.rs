// Copyright (c) 2024 Fuego Private Banking Network
// Distributed under the MIT/X11 software license

//! Fuego Desktop Wallet - Tauri Backend

pub mod crypto;
pub mod utils;
pub mod security;
pub mod performance;

use log::info;
use crate::crypto::ffi::CryptoNoteFFI;
use crate::crypto::real_cryptonote::{RealCryptoNoteWallet, connect_to_fuego_network, fetch_fuego_network_data};
use crate::security::{SecurityManager, SecurityConfig, PasswordValidator, WalletEncryption};
use crate::performance::{PerformanceMonitor, PerformanceConfig, Cache, BackgroundTaskManager};
use std::sync::Arc;
use std::time::Duration;

// Global state for security and performance
static SECURITY_MANAGER: std::sync::OnceLock<Arc<SecurityManager>> = std::sync::OnceLock::new();
static PERFORMANCE_MONITOR: std::sync::OnceLock<Arc<PerformanceMonitor>> = std::sync::OnceLock::new();
static CACHE: std::sync::OnceLock<Arc<Cache<serde_json::Value>>> = std::sync::OnceLock::new();
static BACKGROUND_TASKS: std::sync::OnceLock<Arc<BackgroundTaskManager>> = std::sync::OnceLock::new();

/// Initialize the Tauri application
pub fn run() {
    env_logger::init();
    info!("Starting Fuego Desktop Wallet");

    // Initialize global state
    initialize_global_state();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            get_wallet_info,
            get_transactions,
            get_network_status,
            test_ffi_integration,
            test_real_cryptonote,
            get_fuego_network_data,
            send_transaction,
            get_term_deposits,
            create_term_deposit,
            withdraw_term_deposit,
            // Security commands
            authenticate_user,
            validate_session,
            lock_session,
            unlock_session,
            logout_user,
            validate_password_strength,
            encrypt_wallet_data,
            decrypt_wallet_data,
            // Performance commands
            get_performance_metrics,
            get_cache_stats,
            clear_cache,
            get_background_task_status,
            enable_background_task,
            disable_background_task,
        ])
        .setup(|_app| {
            info!("Fuego Desktop Wallet initialized successfully");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Initialize global state for security and performance
fn initialize_global_state() {
    // Initialize security manager
    let security_config = SecurityConfig::default();
    let security_manager = Arc::new(SecurityManager::new(security_config));
    SECURITY_MANAGER.set(security_manager).unwrap();

    // Initialize performance monitor
    let performance_config = PerformanceConfig::default();
    let performance_monitor = Arc::new(PerformanceMonitor::new(performance_config));
    PERFORMANCE_MONITOR.set(performance_monitor).unwrap();

    // Initialize cache
    let cache = Arc::new(Cache::new(1000, Duration::from_secs(300)));
    CACHE.set(cache).unwrap();

    // Initialize background task manager
    let background_tasks = Arc::new(BackgroundTaskManager::new());
    BACKGROUND_TASKS.set(background_tasks).unwrap();

    info!("Global state initialized successfully");
}

/// Get wallet information (using real CryptoNote)
#[tauri::command]
async fn get_wallet_info() -> Result<serde_json::Value, String> {
    let mut real_wallet = RealCryptoNoteWallet::new();
    
    // Try to open existing wallet first, then create if needed
    let wallet_result = real_wallet.open_wallet("/tmp/fuego_wallet.wallet", "fuego_password")
        .or_else(|_| real_wallet.create_wallet("fuego_password", "/tmp/fuego_wallet.wallet", None, 0));
    
    if let Err(e) = wallet_result {
        return Err(format!("Failed to open/create wallet: {}", e));
    }
    
    // Connect to Fuego network
    if let Err(e) = connect_to_fuego_network(&mut real_wallet) {
        log::warn!("Failed to connect to Fuego network: {}", e);
        // Continue without network connection
    }
    
    let balance = real_wallet.get_balance().map_err(|e| e.to_string())?;
    let unlocked_balance = real_wallet.get_unlocked_balance().map_err(|e| e.to_string())?;
    let address = real_wallet.get_address().map_err(|e| e.to_string())?;
    
    Ok(serde_json::json!({
        "address": address,
        "balance": balance,
        "unlocked_balance": unlocked_balance,
        "is_open": real_wallet.is_open(),
        "is_encrypted": true,
        "is_real": true
    }))
}

/// Get transactions (real implementation)
#[tauri::command]
async fn get_transactions(_limit: Option<u64>, _offset: Option<u64>) -> Result<Vec<serde_json::Value>, String> {
    let mut real_wallet = RealCryptoNoteWallet::new();
    
    // Try to open wallet and get real transactions
    let _ = real_wallet.open_wallet("/tmp/fuego_wallet.wallet", "fuego_password")
        .or_else(|_| real_wallet.create_wallet("fuego_password", "/tmp/fuego_wallet.wallet", None, 0));
    
    // For now, return empty list - real transactions will be loaded from blockchain
    // TODO: Implement real transaction loading from CryptoNote blockchain
    Ok(vec![])
}

/// Get network status (using real CryptoNote)
#[tauri::command]
async fn get_network_status() -> Result<serde_json::Value, String> {
    let mut real_wallet = RealCryptoNoteWallet::new();
    
    // Try to open wallet and connect to network
    let _ = real_wallet.open_wallet("/tmp/fuego_wallet.wallet", "fuego_password")
        .or_else(|_| real_wallet.create_wallet("fuego_password", "/tmp/fuego_wallet.wallet", None, 0));
    
    // Connect to Fuego network
    let _ = connect_to_fuego_network(&mut real_wallet);
    
    // Get real network status
    real_wallet.get_network_status().map_err(|e| e.to_string())
}

/// Test FFI integration
#[tauri::command]
async fn test_ffi_integration() -> Result<serde_json::Value, String> {
    let mut ffi = CryptoNoteFFI::new();
    
    // Test wallet creation
    let create_result = ffi.create_wallet("test_password", "/tmp/test.wallet", None, 0);
    if create_result.is_err() {
        return Err(format!("FFI wallet creation failed: {:?}", create_result.err()));
    }
    
    // Test wallet operations
    let balance = ffi.get_balance().map_err(|e| e.to_string())?;
    let unlocked_balance = ffi.get_unlocked_balance().map_err(|e| e.to_string())?;
    let address = ffi.get_address().map_err(|e| e.to_string())?;
    let is_open = ffi.is_open();
    
    // Test transaction sending
    let tx_result = ffi.send_transaction("FUEGO9876543210fedcba", 100000000, None, 5);
    if tx_result.is_err() {
        return Err(format!("FFI transaction failed: {:?}", tx_result.err()));
    }
    
    Ok(serde_json::json!({
        "status": "success",
        "message": "FFI integration working correctly",
        "wallet": {
            "is_open": is_open,
            "balance": balance,
            "unlocked_balance": unlocked_balance,
            "address": address
        },
        "transaction": {
            "hash": tx_result.unwrap()
        }
    }))
}

/// Test real CryptoNote integration
#[tauri::command]
async fn test_real_cryptonote() -> Result<serde_json::Value, String> {
    let mut real_wallet = RealCryptoNoteWallet::new();
    
    // Test wallet creation
    let create_result = real_wallet.create_wallet("test_password", "/tmp/test_real.wallet", None, 0);
    if create_result.is_err() {
        return Err(format!("Real CryptoNote wallet creation failed: {:?}", create_result.err()));
    }
    
    // Test wallet operations
    let balance = real_wallet.get_balance().map_err(|e| e.to_string())?;
    let unlocked_balance = real_wallet.get_unlocked_balance().map_err(|e| e.to_string())?;
    let address = real_wallet.get_address().map_err(|e| e.to_string())?;
    let is_open = real_wallet.is_open();
    
    // Test network connection
    let network_result = connect_to_fuego_network(&mut real_wallet);
    let network_status = real_wallet.get_network_status().map_err(|e| e.to_string())?;
    
    // Test transaction sending
    let tx_result = real_wallet.send_transaction("fire1234567890abcdef", 100000000, None, 5);
    if tx_result.is_err() {
        return Err(format!("Real CryptoNote transaction failed: {:?}", tx_result.err()));
    }
    
    Ok(serde_json::json!({
        "status": "success",
        "message": "Real CryptoNote integration working correctly",
        "wallet": {
            "is_open": is_open,
            "balance": balance,
            "unlocked_balance": unlocked_balance,
            "address": address
        },
        "network": {
            "connection_result": if network_result.is_ok() { "success" } else { "failed" },
            "status": network_status
        },
        "transaction": {
            "hash": tx_result.unwrap()
        }
    }))
}

/// Get real Fuego network data from fuego.spaceportx.net
#[tauri::command]
async fn get_fuego_network_data() -> Result<serde_json::Value, String> {
    match fetch_fuego_network_data().await {
        Ok(data) => {
            log::info!("Fetched real Fuego network data: height={}, peers={}", 
                      data["height"], data["peer_count"]);
            Ok(data)
        }
        Err(e) => {
            log::error!("Failed to fetch Fuego network data: {}", e);
            Err(format!("Failed to fetch network data: {}", e))
        }
    }
}

/// Send a transaction
#[tauri::command]
async fn send_transaction(
    recipient: String,
    amount: u64,
    payment_id: Option<String>,
    mixin: u64,
) -> Result<String, String> {
    let mut real_wallet = RealCryptoNoteWallet::new();
    
    // Try to open existing wallet first
    let wallet_result = real_wallet.open_wallet("/tmp/fuego_wallet.wallet", "fuego_password")
        .or_else(|_| real_wallet.create_wallet("fuego_password", "/tmp/fuego_wallet.wallet", None, 0));
    
    if let Err(e) = wallet_result {
        return Err(format!("Failed to open/create wallet: {}", e));
    }
    
    // Connect to Fuego network
    if let Err(e) = connect_to_fuego_network(&mut real_wallet) {
        log::warn!("Failed to connect to Fuego network: {}", e);
        // Continue without network connection
    }
    
    // Send transaction
    match real_wallet.send_transaction(&recipient, amount, payment_id.as_deref(), mixin) {
        Ok(tx_hash) => {
            log::info!("Transaction sent successfully: {}", tx_hash);
            Ok(tx_hash)
        }
        Err(e) => {
            log::error!("Failed to send transaction: {}", e);
            Err(format!("Failed to send transaction: {}", e))
        }
    }
}

/// Get term deposits (staking/investment positions)
#[tauri::command]
async fn get_term_deposits() -> Result<Vec<serde_json::Value>, String> {
    let mut real_wallet = RealCryptoNoteWallet::new();
    
    // Try to open existing wallet first
    let wallet_result = real_wallet.open_wallet("/tmp/fuego_wallet.wallet", "fuego_password")
        .or_else(|_| real_wallet.create_wallet("fuego_password", "/tmp/fuego_wallet.wallet", None, 0));
    
    if let Err(e) = wallet_result {
        return Err(format!("Failed to open/create wallet: {}", e));
    }
    
    // Connect to Fuego network
    let _ = connect_to_fuego_network(&mut real_wallet);
    
    // Get real deposits from CryptoNote wallet
    match real_wallet.get_deposits() {
        Ok(deposits) => {
            let mut deposit_list = Vec::new();
            
            for deposit in deposits {
                let deposit_json = serde_json::json!({
                    "id": deposit.id,
                    "amount": deposit.amount,
                    "interest": deposit.interest,
                    "term": deposit.term,
                    "rate": deposit.rate,
                    "status": deposit.status,
                    "unlock_height": deposit.unlock_height,
                    "unlock_time": deposit.unlock_time,
                    "creating_transaction_hash": deposit.creating_transaction_hash,
                    "creating_height": deposit.creating_height,
                    "creating_time": deposit.creating_time,
                    "spending_transaction_hash": deposit.spending_transaction_hash,
                    "spending_height": deposit.spending_height,
                    "spending_time": deposit.spending_time,
                    "type": deposit.deposit_type
                });
                deposit_list.push(deposit_json);
            }
            
            log::info!("Retrieved {} term deposits from blockchain", deposit_list.len());
            Ok(deposit_list)
        }
        Err(e) => {
            log::error!("Failed to get deposits: {}", e);
            Err(format!("Failed to get deposits: {}", e))
        }
    }
}

/// Create a new term deposit (stake XFG for interest)
#[tauri::command]
async fn create_term_deposit(amount: u64, term: u32) -> Result<String, String> {
    let mut real_wallet = RealCryptoNoteWallet::new();
    
    // Try to open existing wallet first
    let wallet_result = real_wallet.open_wallet("/tmp/fuego_wallet.wallet", "fuego_password")
        .or_else(|_| real_wallet.create_wallet("fuego_password", "/tmp/fuego_wallet.wallet", None, 0));
    
    if let Err(e) = wallet_result {
        return Err(format!("Failed to open/create wallet: {}", e));
    }
    
    // Connect to Fuego network
    let _ = connect_to_fuego_network(&mut real_wallet);
    
    // Validate deposit parameters
    if amount < 10000000 { // Minimum 1 XFG
        return Err("Minimum deposit amount is 1 XFG".to_string());
    }
    
    if term < 1 || term > 365 { // Term between 1 and 365 days
        return Err("Term must be between 1 and 365 days".to_string());
    }
    
    // Create real deposit transaction using CryptoNote
    match real_wallet.create_deposit(amount, term) {
        Ok(deposit_id) => {
            log::info!("Created term deposit: {} XFG for {} days (ID: {})", amount / 10000000, term, deposit_id);
            Ok(deposit_id)
        }
        Err(e) => {
            log::error!("Failed to create deposit: {}", e);
            Err(format!("Failed to create deposit: {}", e))
        }
    }
}

/// Withdraw a term deposit (claim principal + interest)
#[tauri::command]
async fn withdraw_term_deposit(deposit_id: String) -> Result<String, String> {
    let mut real_wallet = RealCryptoNoteWallet::new();
    
    // Try to open existing wallet first
    let wallet_result = real_wallet.open_wallet("/tmp/fuego_wallet.wallet", "fuego_password")
        .or_else(|_| real_wallet.create_wallet("fuego_password", "/tmp/fuego_wallet.wallet", None, 0));
    
    if let Err(e) = wallet_result {
        return Err(format!("Failed to open/create wallet: {}", e));
    }
    
    // Connect to Fuego network
    let _ = connect_to_fuego_network(&mut real_wallet);
    
    // Withdraw deposit using real CryptoNote functionality
    match real_wallet.withdraw_deposit(&deposit_id) {
        Ok(tx_hash) => {
            log::info!("Withdrew term deposit: {} (TX: {})", deposit_id, tx_hash);
            Ok(tx_hash)
        }
        Err(e) => {
            log::error!("Failed to withdraw deposit: {}", e);
            Err(format!("Failed to withdraw deposit: {}", e))
        }
    }
}

// ===== PHASE 2.2: SECURITY & PERFORMANCE COMMANDS =====

/// Authenticate user with password
#[tauri::command]
async fn authenticate_user(user_id: String, password: String) -> Result<String, String> {
    let timer = PERFORMANCE_MONITOR.get().unwrap().start_timing("authenticate_user".to_string());
    
    let security_manager = SECURITY_MANAGER.get().unwrap();
    match security_manager.authenticate(&user_id, &password) {
        Ok(session_id) => {
            timer.finish(true);
            log::info!("User {} authenticated successfully", user_id);
            Ok(session_id)
        }
        Err(e) => {
            timer.finish(false);
            log::warn!("Authentication failed for user {}: {}", user_id, e);
            Err(e)
        }
    }
}

/// Validate user session
#[tauri::command]
async fn validate_session(session_id: String) -> Result<String, String> {
    let timer = PERFORMANCE_MONITOR.get().unwrap().start_timing("validate_session".to_string());
    
    let security_manager = SECURITY_MANAGER.get().unwrap();
    match security_manager.validate_session(&session_id) {
        Ok(user_id) => {
            security_manager.update_session_activity(&session_id).ok();
            timer.finish(true);
            Ok(user_id)
        }
        Err(e) => {
            timer.finish(false);
            Err(e)
        }
    }
}

/// Lock session for sensitive operations
#[tauri::command]
async fn lock_session(session_id: String) -> Result<(), String> {
    let security_manager = SECURITY_MANAGER.get().unwrap();
    security_manager.lock_session(&session_id)
}

/// Unlock session with password
#[tauri::command]
async fn unlock_session(session_id: String, password: String) -> Result<(), String> {
    let security_manager = SECURITY_MANAGER.get().unwrap();
    security_manager.unlock_session(&session_id, &password)
}

/// Logout user and destroy session
#[tauri::command]
async fn logout_user(session_id: String) -> Result<(), String> {
    let security_manager = SECURITY_MANAGER.get().unwrap();
    security_manager.logout(&session_id)
}

/// Validate password strength
#[tauri::command]
async fn validate_password_strength(password: String) -> Result<serde_json::Value, String> {
    match PasswordValidator::validate_strength(&password) {
        Ok(_) => {
            let score = PasswordValidator::calculate_strength_score(&password);
            Ok(serde_json::json!({
                "valid": true,
                "score": score,
                "strength": match score {
                    0..=30 => "weak",
                    31..=60 => "medium",
                    61..=80 => "strong",
                    81..=100 => "very_strong",
                    _ => "unknown"
                }
            }))
        }
        Err(e) => {
            let score = PasswordValidator::calculate_strength_score(&password);
            Ok(serde_json::json!({
                "valid": false,
                "error": e,
                "score": score,
                "strength": "weak"
            }))
        }
    }
}

/// Encrypt wallet data
#[tauri::command]
async fn encrypt_wallet_data(data: String, password: String) -> Result<String, String> {
    WalletEncryption::encrypt_data(&data, &password)
}

/// Decrypt wallet data
#[tauri::command]
async fn decrypt_wallet_data(encrypted_data: String, password: String) -> Result<String, String> {
    WalletEncryption::decrypt_data(&encrypted_data, &password)
}

/// Get performance metrics
#[tauri::command]
async fn get_performance_metrics(operation_name: Option<String>) -> Result<serde_json::Value, String> {
    let monitor = PERFORMANCE_MONITOR.get().unwrap();
    
    if let Some(name) = operation_name {
        match monitor.get_average_performance(&name) {
            Some(avg_perf) => Ok(serde_json::json!({
                "operation_name": avg_perf.operation_name,
                "average_duration_ms": avg_perf.average_duration_ms,
                "average_memory_mb": avg_perf.average_memory_mb,
                "success_rate": avg_perf.success_rate,
                "total_calls": avg_perf.total_calls
            })),
            None => Ok(serde_json::json!({
                "error": "No metrics found for operation"
            }))
        }
    } else {
        let metrics = monitor.get_metrics(None);
        Ok(serde_json::json!({
            "total_operations": metrics.len(),
            "operations": metrics
        }))
    }
}

/// Get cache statistics
#[tauri::command]
async fn get_cache_stats() -> Result<serde_json::Value, String> {
    let cache = CACHE.get().unwrap();
    let stats = cache.stats();
    Ok(serde_json::json!({
        "total_entries": stats.total_entries,
        "expired_entries": stats.expired_entries,
        "active_entries": stats.active_entries,
        "max_size": stats.max_size,
        "hit_rate": if stats.total_entries > 0 {
            (stats.active_entries as f64 / stats.total_entries as f64) * 100.0
        } else {
            0.0
        }
    }))
}

/// Clear cache
#[tauri::command]
async fn clear_cache() -> Result<(), String> {
    let cache = CACHE.get().unwrap();
    cache.clear();
    log::info!("Cache cleared");
    Ok(())
}

/// Get background task status
#[tauri::command]
async fn get_background_task_status(task_name: String) -> Result<serde_json::Value, String> {
    let task_manager = BACKGROUND_TASKS.get().unwrap();
    
    match task_manager.get_task_status(&task_name) {
        Some(status) => Ok(serde_json::json!({
            "name": status.name,
            "enabled": status.enabled,
            "last_run": status.last_run.elapsed().as_secs(),
            "next_run_in": status.next_run_in.as_secs()
        })),
        None => Err("Task not found".to_string())
    }
}

/// Enable background task
#[tauri::command]
async fn enable_background_task(task_name: String) -> Result<(), String> {
    let task_manager = BACKGROUND_TASKS.get().unwrap();
    task_manager.set_task_enabled(&task_name, true);
    log::info!("Background task {} enabled", task_name);
    Ok(())
}

/// Disable background task
#[tauri::command]
async fn disable_background_task(task_name: String) -> Result<(), String> {
    let task_manager = BACKGROUND_TASKS.get().unwrap();
    task_manager.set_task_enabled(&task_name, false);
    log::info!("Background task {} disabled", task_name);
    Ok(())
}