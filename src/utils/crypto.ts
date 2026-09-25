/**
 * End-to-End Encryption (E2EE) Utility using Web Crypto API (SubtleCrypto)
 * Standard: AES-GCM 256-bit with PBKDF2 key derivation and random 96-bit IV
 */

const SALT = new TextEncoder().encode('DENVER_PERSONAL_INTELLIGENCE_SALT_v1');

async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function encryptData(plainText: string, passphrase: string = 'DENVER-SECURE-VAULT-2026'): Promise<{ cipherText: string; iv: string }> {
  try {
    const key = await deriveKey(passphrase);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plainText);

    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encoded
    );

    return {
      cipherText: bufferToBase64(encrypted),
      iv: bufferToBase64(iv.buffer),
    };
  } catch (err) {
    console.error('E2E Encryption error:', err);
    throw err;
  }
}

export async function decryptData(cipherText: string, ivBase64: string, passphrase: string = 'DENVER-SECURE-VAULT-2026'): Promise<string> {
  try {
    const key = await deriveKey(passphrase);
    const iv = new Uint8Array(base64ToBuffer(ivBase64));
    const data = base64ToBuffer(cipherText);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      data
    );

    return new TextDecoder().decode(decrypted);
  } catch (err) {
    console.error('E2E Decryption error:', err);
    throw new Error('Decryption failed: Invalid passphrase or corrupted ciphertext');
  }
}
