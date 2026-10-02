/**
 * Security & WebCrypto Encrypted Storage Service
 * Part of MCP Admin Product Line by Zyven Technologies Pvt Ltd.
 * Encrypts provider API keys and sensitive MCP credentials in LocalStorage using AES-GCM 256.
 */

const STORAGE_KEY = 'mcp_chatbot_encrypted_store_v1';
const DEFAULT_KEY_SALT = 'mcp_chatbot_secure_salt_2026';

async function getKey(passphrase: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(DEFAULT_KEY_SALT),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(data: Record<string, any>, passphrase = 'mcp_default_pass'): Promise<string> {
  try {
    const key = await getKey(passphrase);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(JSON.stringify(data));

    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );

    const combined = new Uint8Array(iv.length + encryptedContent.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedContent), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (err) {
    console.error('Encryption failed, falling back to JSON encode', err);
    return JSON.stringify(data);
  }
}

export async function decryptData(encryptedBase64: string, passphrase = 'mcp_default_pass'): Promise<Record<string, any> | null> {
  try {
    if (!encryptedBase64) return null;

    if (encryptedBase64.startsWith('{')) {
      return JSON.parse(encryptedBase64);
    }

    const key = await getKey(passphrase);
    const binary = atob(encryptedBase64);
    const combined = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      combined[i] = binary.charCodeAt(i);
    }

    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decryptedContent = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    const decoded = new TextDecoder().decode(decryptedContent);
    return JSON.parse(decoded);
  } catch (err) {
    console.warn('Decryption failed or invalid passphrase', err);
    return null;
  }
}

export async function saveSecureKeys(keys: Record<string, string>, passphrase = 'mcp_default_pass'): Promise<void> {
  const encrypted = await encryptData(keys, passphrase);
  localStorage.setItem(STORAGE_KEY, encrypted);
}

export async function loadSecureKeys(passphrase = 'mcp_default_pass'): Promise<Record<string, string>> {
  const encrypted = localStorage.getItem(STORAGE_KEY);
  if (!encrypted) return {};
  const decrypted = await decryptData(encrypted, passphrase);
  return decrypted || {};
}
