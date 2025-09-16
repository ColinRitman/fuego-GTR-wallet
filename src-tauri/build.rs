// Copyright (c) 2024 Fuego Private Banking Network
// Distributed under the MIT/X11 software license

//! Build script for compiling C++ FFI library

use std::env;

fn main() {
    // For now, always use mock implementation until CryptoNote integration is complete
    println!("cargo:warning=Using mock CryptoNote implementation for development");
    build_mock_ffi();
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