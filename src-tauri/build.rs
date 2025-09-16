// Copyright (c) 2024 Fuego Private Banking Network
// Distributed under the MIT/X11 software license

//! Build script for compiling C++ FFI library

use std::env;

fn main() {
    // Tell cargo to link the crypto_note_ffi library
    println!("cargo:rustc-link-lib=crypto_note_ffi");
    
    // Compile the C++ FFI library
    cc::Build::new()
        .cpp(true)
        .std("c++14")
        .file("crypto_note_ffi.cpp")
        .include(".")
        .compile("crypto_note_ffi");
    
    // Tell cargo to rerun this build script if the C++ files change
    println!("cargo:rerun-if-changed=crypto_note_ffi.cpp");
    println!("cargo:rerun-if-changed=crypto_note_ffi.h");
    
    // Add library search path
    let out_dir = env::var("OUT_DIR").unwrap();
    println!("cargo:rustc-link-search=native={}", out_dir);
    
    // Link system libraries
    if cfg!(target_os = "macos") {
        println!("cargo:rustc-link-lib=c++");
    } else if cfg!(target_os = "linux") {
        println!("cargo:rustc-link-lib=stdc++");
    } else if cfg!(target_os = "windows") {
        // Windows linking handled by MSVC
    }
}