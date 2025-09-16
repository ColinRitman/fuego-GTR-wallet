// Copyright (c) 2024 Fuego Private Banking Network
// Distributed under the MIT/X11 software license

//! Build script for compiling C++ FFI library

use std::env;

fn main() {
    // Try to build real Fuego wallet implementation
    if build_real_fuego_wallet() {
        println!("cargo:warning=Using real Fuego wallet implementation");
        return;
    }
    
    // Fallback to mock implementation
    println!("cargo:warning=Using mock CryptoNote implementation for development");
    build_mock_ffi();
}

fn build_real_fuego_wallet() -> bool {
    // Compile the real Fuego wallet library
    cc::Build::new()
        .cpp(true)
        .std("c++14")
        .file("fuego_wallet_real.cpp")
        .include(".")
        .compile("fuego_wallet_real");
    
    // Link the real Fuego wallet library
    println!("cargo:rustc-link-lib=fuego_wallet_real");
    
    // Compile the C++ FFI library with real Fuego includes
    cc::Build::new()
        .cpp(true)
        .std("c++14")
        .file("crypto_note_ffi.cpp")
        .include(".")
        .include("cryptonote/include")
        .compile("crypto_note_ffi");
    
    // Tell cargo to rerun this build script if files change
    println!("cargo:rerun-if-changed=fuego_wallet_real.cpp");
    println!("cargo:rerun-if-changed=fuego_wallet_real.h");
    println!("cargo:rerun-if-changed=crypto_note_ffi.cpp");
    println!("cargo:rerun-if-changed=crypto_note_ffi.h");
    println!("cargo:rerun-if-changed=cryptonote/");
    
    // Link system libraries
    if cfg!(target_os = "macos") {
        println!("cargo:rustc-link-lib=c++");
    } else if cfg!(target_os = "linux") {
        println!("cargo:rustc-link-lib=stdc++");
        println!("cargo:rustc-link-lib=pthread");
        println!("cargo:rustc-link-lib=resolv");
    } else if cfg!(target_os = "windows") {
        // Windows linking handled by MSVC
    }
    
    true
}

fn build_mock_ffi() {
    // Fallback to mock implementation
    println!("cargo:rustc-link-lib=crypto_note_ffi");
    
    cc::Build::new()
        .cpp(true)
        .std("c++14")
        .file("crypto_note_ffi.cpp")
        .include(".")
        .compile("crypto_note_ffi");
    
    let out_dir = env::var("OUT_DIR").unwrap();
    println!("cargo:rustc-link-search=native={}", out_dir);
    
    if cfg!(target_os = "macos") {
        println!("cargo:rustc-link-lib=c++");
    } else if cfg!(target_os = "linux") {
        println!("cargo:rustc-link-lib=stdc++");
    }
}