// Copyright (c) 2024 Fuego Private Banking Network
// Distributed under the MIT/X11 software license

//! Real Fuego wallet implementation
//! 
//! This header provides real CryptoNote wallet operations for the Fuego network.

#ifndef FUEGO_WALLET_REAL_H
#define FUEGO_WALLET_REAL_H

#ifdef __cplusplus
extern "C" {
#endif

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

// Forward declarations
typedef void* FuegoWallet;
typedef void* TransactionResult;
typedef void* TransactionList;

// Network status structure
typedef struct {
    bool is_connected;
    uint64_t peer_count;
    uint64_t sync_height;
    uint64_t network_height;
    bool is_syncing;
    char connection_type[256];
} NetworkStatus;

// Wallet creation and management
FuegoWallet fuego_wallet_create(
    const char* password,
    const char* file_path,
    const char* seed_phrase,
    uint64_t restore_height
);

FuegoWallet fuego_wallet_open(
    const char* file_path,
    const char* password
);

void fuego_wallet_close(FuegoWallet wallet);

bool fuego_wallet_is_open(FuegoWallet wallet);

// Wallet information
uint64_t fuego_wallet_get_balance(FuegoWallet wallet);

uint64_t fuego_wallet_get_unlocked_balance(FuegoWallet wallet);

bool fuego_wallet_get_address(
    FuegoWallet wallet,
    char* buffer,
    size_t buffer_size
);

// Transaction operations
TransactionResult fuego_wallet_send_transaction(
    FuegoWallet wallet,
    const char* address,
    uint64_t amount,
    const char* payment_id,
    uint64_t mixin
);

TransactionList fuego_wallet_get_transactions(
    FuegoWallet wallet,
    uint64_t limit,
    uint64_t offset
);

// Network operations
bool fuego_wallet_connect_node(
    FuegoWallet wallet,
    const char* address,
    uint16_t port
);

NetworkStatus fuego_wallet_get_network_status(FuegoWallet wallet);

// Additional network/wallet operations (stubs to satisfy FFI)
bool fuego_wallet_disconnect_node(FuegoWallet wallet);
bool fuego_wallet_refresh(FuegoWallet wallet);
bool fuego_wallet_rescan_blockchain(FuegoWallet wallet, uint64_t start_height);
uint64_t fuego_wallet_estimate_transaction_fee(
    FuegoWallet wallet,
    const char* address,
    uint64_t amount,
    uint64_t mixin
);

// Deposit operations
void* fuego_wallet_get_deposits(FuegoWallet wallet);
void* fuego_wallet_create_deposit(FuegoWallet wallet, uint64_t amount, uint32_t term);
void* fuego_wallet_withdraw_deposit(FuegoWallet wallet, const char* deposit_id);

// Utility functions
void fuego_wallet_free_string(char* s);
void fuego_wallet_free_transactions(TransactionList txs);
void fuego_wallet_free_network_status(NetworkStatus* status);

#ifdef __cplusplus
}
#endif

#endif // FUEGO_WALLET_REAL_H
