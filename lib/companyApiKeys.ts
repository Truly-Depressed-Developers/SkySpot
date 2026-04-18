import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const encryptionSecret =
  process.env.API_KEY_ENCRYPTION_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  'development-api-key-secret';

function getEncryptionKey() {
  return createHash('sha256').update(encryptionSecret).digest();
}

export function generateApiKeySecret() {
  return `ck_live_${randomBytes(32).toString('base64url')}`;
}

export function hashApiKeySecret(secret: string) {
  return createHash('sha256').update(secret).digest('hex');
}

export function encryptApiKeySecret(secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString('base64url'),
    authTag.toString('base64url'),
    encrypted.toString('base64url'),
  ].join('.');
}

export function decryptApiKeySecret(encryptedSecret: string) {
  const [ivValue, authTagValue, encryptedValue] = encryptedSecret.split('.');

  if (!ivValue || !authTagValue || !encryptedValue) {
    throw new Error('Nieprawidłowy zapis klucza API');
  }

  const decipher = createDecipheriv(
    'aes-256-gcm',
    getEncryptionKey(),
    Buffer.from(ivValue, 'base64url'),
  );
  decipher.setAuthTag(Buffer.from(authTagValue, 'base64url'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, 'base64url')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}
