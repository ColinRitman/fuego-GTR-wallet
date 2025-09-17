# Development Plan: Placeholder Elimination (Phases 1 & 2)

## Goals
- Replace all placeholder/mock implementations with real CryptoNote (WalletLegacy/WalletGreen) integrations sourced from `ColinRitman/fuego`.
- Ensure fuego-wallet API parity on the backend (`wallet_*`, `network_*`, `deposit_*`).
- Keep UI functional with progressive enhancement as backend gains real data.

## Phase 1: Build and Link CryptoNote

1) Vendor CryptoNote sources
- Use `scripts/fetch_cryptonote.sh` to pull sources into `src-tauri/cryptonote/`.
- Ensure script works without rsync (cp -a fallback).

2) Update build.rs (non-breaking)
- Add cc build steps to compile required `WalletLegacy`/`WalletGreen` + dependencies.
- Set include paths to `src-tauri/cryptonote/include` and source dirs.
- Link stdc++/pthread/resolv on Linux, c++ on macOS.
- Keep mock build as fallback when sources missing.

3) Headers and symbols
- Verify headers resolve for `WalletLegacy`, `INode`, `IWalletLegacy`, etc.
- Stub out minimal shims if required to satisfy linker (temporary, removed in Phase 2).

## Phase 2: Real FFI and Rust Parsing

1) Real C++ FFI
- Replace `src-tauri/crypto_note_ffi.cpp` mock with real calls into WalletLegacy/WalletGreen.
- Replace `src-tauri/fuego_wallet_real.cpp` simulated behavior with real node connect, address, balance, tx send.

2) Rust bindings parsing
- Implement parsing for pointers/structs in `src-tauri/src/crypto/real_cryptonote.rs`:
- get_network_status(): map daemon status struct to JSON
- get_wallet_info(): return real address/balance/unlocked fields
- get_deposits(): parse and return a real list
- send_transaction(): extract real tx hash
- get_transaction_by_hash(): parse TxDetail
- estimate_transaction_fee(): ensure real estimate
- validate_address(): call real validation

3) Transactions
- Implement `wallet_get_transactions` to return recent history from wallet cache/synchronizer.

4) API parity polish
- Add `wallet_close` command, ensure `wallet_*` shapes mirror fuego-wallet exactly.

## Deliverables
- Updated `build.rs` with CryptoNote compile/link
- Real FFI implementation files compiled into the app
- Rust wrappers returning real data for wallet/network/transactions/deposits
- Frontend remains unchanged (already calling fuego-wallet names)

## Risks & Mitigations
- Link errors due to missing modules: progressively include required units; keep mock fallback.
- Struct layout/ABI discrepancies: use explicit C ABI wrappers and stable C-style structs.
- Platform-specific deps: ensure CI installs webkit/openssl and c++ stdlib per OS.

## Success Criteria
- Builds green on Ubuntu/Windows/macOS
- Real address/balance displayed; can send tx and see hash
- Network status reflects live node
- Deposits list returns non-empty with actual data when present