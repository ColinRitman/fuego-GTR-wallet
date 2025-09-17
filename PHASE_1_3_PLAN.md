# Phase 1.3: Real CryptoNote Integration Plan

## Overview
This phase focuses on replacing the mock implementations with real CryptoNote C++ wallet functionality through our FFI wrapper.

## Goals
- Integrate actual CryptoNote C++ wallet code
- Implement real blockchain synchronization
- Enable actual transaction processing
- Maintain security and performance

## Implementation Strategy

### 1. CryptoNote Library Integration

#### 1.1 Build System Integration
- **Current**: Mock C++ implementation in `crypto_note_ffi.cpp`
- **Target**: Real CryptoNote library integration
- **Approach**: 
  - Source CryptoNote code from `https://github.com/ColinRitman/fuego`
  - Vendor `cryptonote` tree into `src-tauri/cryptonote/` (or add as git submodule)
  - Provide helper script `scripts/fetch_cryptonote.sh` to sync upstream
  - Create static library build configuration
  - Link against real CryptoNote wallet implementation

#### 1.2 Required CryptoNote Components
```
src-tauri/cryptonote/    # sourced from ColinRitman/fuego
├── src/
│   ├── WalletLegacy/
│   │   ├── WalletLegacy.h/cpp
│   │   ├── WalletHelper.h/cpp
│   │   ├── WalletLegacySerializer.h/cpp
│   │   └── WalletLegacySerialization.h/cpp
│   ├── CryptoNoteCore/
│   │   ├── Currency.h/cpp
│   │   ├── CryptoNoteTools.h/cpp
│   │   └── CryptoNoteFormatUtils.h/cpp
│   ├── Crypto/
│   │   ├── crypto.h/cpp
│   │   └── crypto-ops.c
│   └── Common/
│       ├── Base58.h/cpp
│       ├── StringTools.h/cpp
│       └── Util.h/cpp
```

### 2. FFI Implementation Updates

#### 2.1 Replace Mock Functions
- **Wallet Creation**: Use `WalletLegacy::createWallet()`
- **Wallet Opening**: Use `WalletLegacy::loadWallet()`
- **Transaction Sending**: Use `WalletLegacy::sendTransaction()`
- **Balance Retrieval**: Use `WalletLegacy::getBalance()`

#### 2.2 Memory Management
- Implement proper C++ object lifecycle management
- Add RAII wrappers for wallet objects
- Ensure proper cleanup on wallet close

#### 2.3 Error Handling
- Map CryptoNote exceptions to C error codes
- Implement comprehensive error reporting
- Add logging for debugging

### 3. Network Integration

#### 3.1 Node Connection
- Implement RPC client for Fuego network
- Add node discovery and connection management
- Handle network failures gracefully

#### 3.2 Synchronization
- Implement blockchain synchronization
- Add progress reporting for sync status
- Handle sync interruptions and resumption

### 4. Security Considerations

#### 4.1 Key Management
- Secure storage of wallet keys
- Proper key derivation and encryption
- Memory protection for sensitive data

#### 4.2 Transaction Security
- Validate all transaction parameters
- Implement proper mixin selection
- Add transaction confirmation logic

## Implementation Steps

### Step 1: CryptoNote Library Setup
1. Copy essential CryptoNote source files
2. Create CMakeLists.txt for static library
3. Update build.rs to compile CryptoNote library
4. Test basic compilation

### Step 2: Core Wallet Functions
1. Implement `crypto_note_wallet_create()` with real wallet creation
2. Implement `crypto_note_wallet_open()` with real wallet loading
3. Implement `crypto_note_wallet_get_balance()` with real balance retrieval
4. Test basic wallet operations

### Step 3: Transaction Functions
1. Implement `crypto_note_wallet_send_transaction()` with real transaction sending
2. Implement `crypto_note_wallet_get_transactions()` with real transaction history
3. Add transaction validation and error handling
4. Test transaction operations

### Step 4: Network Functions
1. Implement `crypto_note_wallet_connect_node()` with real node connection
2. Implement `crypto_note_wallet_get_network_status()` with real network status
3. Add synchronization progress reporting
4. Test network operations

### Step 5: Integration Testing
1. Test complete wallet lifecycle
2. Test transaction sending and receiving
3. Test network synchronization
4. Performance testing and optimization

## File Structure Changes

### New Files to Add
```
src-tauri/
├── cryptonote/                 # CryptoNote source files
│   ├── CMakeLists.txt         # CryptoNote build configuration
│   ├── src/
│   │   ├── WalletLegacy/      # Wallet implementation
│   │   ├── CryptoNoteCore/   # Core crypto functions
│   │   ├── Crypto/            # Cryptographic operations
│   │   └── Common/            # Common utilities
│   └── include/               # CryptoNote headers
├── crypto_note_ffi.cpp        # Updated with real implementations
└── build.rs                   # Updated build configuration
```

### Files to Modify
- `crypto_note_ffi.cpp` - Replace mock implementations
- `build.rs` - Add CryptoNote library compilation
- `Cargo.toml` - Add any additional dependencies

## Testing Strategy

### Unit Tests
- Test individual FFI functions
- Test error handling scenarios
- Test memory management

### Integration Tests
- Test complete wallet operations
- Test transaction workflows
- Test network connectivity

### Performance Tests
- Measure wallet creation/opening time
- Measure transaction processing time
- Measure memory usage

## Risk Mitigation

### Technical Risks
- **Complexity**: CryptoNote integration is complex
- **Mitigation**: Incremental implementation with testing at each step

### Security Risks
- **Key Exposure**: Sensitive data in memory
- **Mitigation**: Proper memory management and encryption

### Performance Risks
- **Slow Operations**: CryptoNote operations can be slow
- **Mitigation**: Async operations and progress reporting

## Success Criteria

### Functional Requirements
- ✅ Wallet creation with real CryptoNote implementation
- ✅ Wallet opening with real wallet files
- ✅ Real transaction sending and receiving
- ✅ Actual blockchain synchronization
- ✅ Real balance and transaction history

### Non-Functional Requirements
- ✅ Security: No key exposure or vulnerabilities
- ✅ Performance: Operations complete within reasonable time
- ✅ Reliability: Handles errors gracefully
- ✅ Maintainability: Clean, documented code

## Timeline
- **Week 1**: CryptoNote library setup and basic functions
- **Week 2**: Transaction functions and network integration
- **Week 3**: Testing, optimization, and bug fixes
- **Week 4**: Documentation and final integration

## Next Steps
1. Begin with Step 1: CryptoNote Library Setup
2. Copy essential source files
3. Create build configuration
4. Test basic compilation
5. Implement core wallet functions incrementally

---

# Fuego-Wallet Parity Plan (Full Mirror)

## Objective
Achieve feature and API parity with `fuego-wallet` so that the Fuego GTR Wallet can act as a drop-in replacement. This includes matching end-user features and mirroring public Tauri commands (names, parameters, and JSON shapes) wherever feasible.

## Feature Parity Scope

- Wallet Core
  - Create/Open/Close wallet
  - Address retrieval and validation (primary, integrated, subaddress roadmap)
  - Balance/unlocked balance
  - Transaction history with pagination and fetch-by-hash
  - Send transaction (payment id/mixin/ringsize as applicable)
  - Fee estimation
  - Refresh/rescan from height

- Network/Node
  - Connect to node (auto/best node + manual host:port)
  - Disconnect from node
  - Network/daemon status (heights, peers, syncing)

- Certificates of Ledger Deposit (On-chain Term Deposits)
  - List deposits
  - Create deposit (amount + term)
  - Withdraw deposit (after unlock)

- Messaging (roadmap if present in fuego-wallet)
  - P2P messaging send/receive/list/delete (subject to upstream API confirmation)

- Settings and Internationalization
  - Get/update app settings
  - Get available languages

- Advanced/Utilities
  - Estimate transaction fee
  - Validate address
  - Get transaction by hash / detailed info (roadmap)

## Public API (Tauri Commands) To Mirror

Note: Commands marked with (implemented) already exist; others are to be implemented/verified for parity or refined to match exact I/O shapes of `fuego-wallet`.

- Wallet
  - wallet_create(password: string, file_path: string, seed_phrase?: string, restore_height?: u64) -> string (address) (implemented)
  - wallet_open(file_path: string, password: string) -> string (address) (implemented)
  - wallet_close() -> void (to implement)
  - wallet_get_info() -> { address, balance, unlocked_balance, ... } (implemented)
  - wallet_get_balance() -> u64 (atomic units) (implemented)
  - wallet_get_address() -> string (implemented)
  - wallet_get_transactions(limit?: u64, offset?: u64) -> Array<Tx> (implemented stub - returns [])
  - wallet_send_transaction(recipient: string, amount: u64, payment_id?: string, mixin?: u64) -> string (tx_hash) (implemented)
  - wallet_refresh() -> void (implemented)
  - wallet_rescan(start_height?: u64) -> void (implemented)

- Network/Node
  - network_get_status() -> NetworkStatus (implemented)
  - node_connect(address?: string, port?: u16) -> void (implemented)
  - node_disconnect() -> void (implemented)

- Deposits
  - deposit_list() -> Array<Deposit> (implemented)
  - deposit_create(amount: u64, term: u32) -> string (deposit_id) (implemented)
  - deposit_withdraw(deposit_id: string) -> string (tx_hash) (implemented)

- Utilities
  - estimate_fee(address: string, amount: u64, mixin?: u64) -> u64 (implemented)
  - validate_address(address: string) -> boolean (basic impl; refine)

- Optional/Advanced (confirm upstream before adding)
  - wallet_get_transaction_by_hash(hash: string) -> TxDetail (roadmap)
  - address_create(label?: string) / address_list() / address_label_set() (roadmap if upstream supports subaddresses)
  - messaging_* commands (send, list, subscribe) (roadmap)

## API Shape Alignment

For each command, align the JSON structure to match `fuego-wallet` responses:

- wallet_get_info
  - Required fields: address, balance, unlocked_balance, is_open, is_real
  - Optional/extended: is_connected, sync heights, peer_count

- network_get_status
  - Required: is_connected, peer_count, sync_height, network_height, is_syncing, connection_type

- wallet_get_transactions
  - Fields: id/hash/amount/fee/timestamp/confirmations/is_confirmed/is_pending/payment_id/destination_addresses/source_addresses

- deposit entries
  - id, amount, interest, term, rate, status, unlock_height, unlock_time, creating_transaction_hash, creating_height/ time, spending_transaction_hash/height/time, type

Where the exact field names/types differ, add lightweight mapping adapters in Rust prior to returning JSON.

## Roadmap and Phases (Parity-Oriented)

- Phase A: API Surface Parity (Backend)
  1) Implement wallet_close
  2) Flesh out wallet_get_transactions from blockchain
  3) Harden validate_address using C++/CryptoNote validation
  4) Ensure JSON field names and shapes match fuego-wallet

- Phase B: UX Parity (Frontend)
  1) Update frontend to call fuego-wallet command names exclusively
  2) Adjust UI to reflect fuego-wallet information density and wording
  3) Add error messages and progress states to match upstream

- Phase C: Advanced Features
  1) Implement transaction-by-hash details
  2) Subaddress management (if in upstream)
  3) Messaging (if in upstream) — design, storage, subscription, notifications

- Phase D: Robustness & Security
  1) Full error mapping from C++ exceptions to structured errors
  2) Deterministic tests for each command (success/failure paths)
  3) Performance profiling and async progress reporting

## Testing & Validation

- Contract Tests
  - Snapshot tests asserting exact JSON field presence and types for each command
  - Negative tests (invalid address, insufficient funds, node offline)

- Integration Tests
  - End-to-end: create/open wallet → connect → refresh → send tx → check balance → deposits lifecycle

- Performance Targets
  - wallet_get_info < 150ms after warm-up (without network calls)
  - network_get_status < 500ms under normal conditions

## Deliverables

- Backend parity layer (Tauri commands) with documented I/O
- Frontend updated to use fuego-wallet command names
- Test suite covering command contracts and typical flows
- Documentation: API reference and migration notes
