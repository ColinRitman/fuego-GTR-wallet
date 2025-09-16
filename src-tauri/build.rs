// Copyright (c) 2024 Fuego Private Banking Network
// Distributed under the MIT/X11 software license

//! Build script for compiling C++ FFI library

use std::env;

fn main() {
    let out_dir = env::var("OUT_DIR").unwrap();
    let cryptonote_build_dir = format!("{}/cryptonote_build", out_dir);
    
    // Create build directory
    std::fs::create_dir_all(&cryptonote_build_dir).unwrap();
    
    // Configure and build CryptoNote library with CMake
    let cmake_status = std::process::Command::new("cmake")
        .arg("-S")
        .arg("cryptonote")
        .arg("-B")
        .arg(&cryptonote_build_dir)
        .arg("-DCMAKE_BUILD_TYPE=Release")
        .arg("-DBUILD_SHARED_LIBS=OFF")
        .status();
    
    if cmake_status.is_err() {
        println!("cargo:warning=CMake not found, falling back to mock implementation");
        build_mock_ffi();
        return;
    }
    
    // Build CryptoNote library
    let make_status = std::process::Command::new("cmake")
        .arg("--build")
        .arg(&cryptonote_build_dir)
        .status();
    
    if make_status.is_err() {
        println!("cargo:warning=Failed to build CryptoNote library, falling back to mock implementation");
        build_mock_ffi();
        return;
    }
    
    // Link CryptoNote library
    println!("cargo:rustc-link-search=native={}/lib", cryptonote_build_dir);
    println!("cargo:rustc-link-lib=static=cryptonote_tauri");
    
    // Compile the C++ FFI library with CryptoNote includes
    cc::Build::new()
        .cpp(true)
        .std("c++14")
        .file("crypto_note_ffi.cpp")
        .include(".")
        .include("cryptonote/include")
        .include(&format!("{}/include", cryptonote_build_dir))
        .compile("crypto_note_ffi");
    
    // Tell cargo to rerun this build script if files change
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