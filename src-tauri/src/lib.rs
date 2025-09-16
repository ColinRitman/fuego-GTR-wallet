// Copyright (c) 2024 Fuego Private Banking Network
// Distributed under the MIT/X11 software license

//! Fuego Desktop Wallet - Tauri Backend

pub mod crypto;
pub mod utils;

use log::info;
use crate::crypto::ffi::CryptoNoteFFI;

/// Initialize the Tauri application
pub fn run() {
    env_logger::init();
    info!("Starting Fuego Desktop Wallet");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            get_wallet_info,
            get_transactions,
            get_network_status,
        ])
        .setup(|_app| {
            info!("Fuego Desktop Wallet initialized successfully");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Get wallet information (using FFI)
#[tauri::command]
async fn get_wallet_info() -> Result<serde_json::Value, String> {
    let mut ffi = CryptoNoteFFI::new();
    
    // For now, create a mock wallet to demonstrate FFI integration
    if let Err(e) = ffi.create_wallet("test_password", "/tmp/test.wallet", None, 0) {
        return Err(format!("Failed to create wallet: {}", e));
    }
    
    let balance = ffi.get_balance().map_err(|e| e.to_string())?;
    let unlocked_balance = ffi.get_unlocked_balance().map_err(|e| e.to_string())?;
    let address = ffi.get_address().map_err(|e| e.to_string())?;
    
    Ok(serde_json::json!({
        "address": address,
        "balance": balance,
        "unlocked_balance": unlocked_balance,
        "is_open": ffi.is_open(),
        "is_encrypted": true
    }))
}

/// Get transactions (mock implementation)
#[tauri::command]
async fn get_transactions(_limit: Option<u64>, _offset: Option<u64>) -> Result<Vec<serde_json::Value>, String> {
    Ok(vec![
        serde_json::json!({
            "id": "tx_1",
            "hash": "abc123def456",
            "amount": 1000000000,
            "fee": 1000000,
            "timestamp": 1640995200,
            "confirmations": 100,
            "is_confirmed": true,
            "is_incoming": true,
            "address": "FUEGO1234567890abcdef",
            "payment_id": null
        }),
        serde_json::json!({
            "id": "tx_2",
            "hash": "def456ghi789",
            "amount": -500000000,
            "fee": 1000000,
            "timestamp": 1640995200,
            "confirmations": 50,
            "is_confirmed": true,
            "is_incoming": false,
            "address": "FUEGO9876543210fedcba",
            "payment_id": "payment_123"
        })
    ])
}

/// Get network status (mock implementation)
#[tauri::command]
async fn get_network_status() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "is_connected": true,
        "peer_count": 8,
        "sync_height": 1000000,
        "network_height": 1000005,
        "is_syncing": true,
        "connection_type": "RPC"
    }))
}