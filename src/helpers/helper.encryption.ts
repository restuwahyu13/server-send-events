import crypto from 'node:crypto'

export class Encryption {
  static AES256Encrypt(secretKey: string, data: string): Buffer {
    const checkValidSecretKey: crypto.KeyObject = crypto.createSecretKey(Buffer.from(secretKey))

    if (!checkValidSecretKey) throw new Error('Secretkey not valid')
    else if (checkValidSecretKey && checkValidSecretKey.symmetricKeySize < 32) throw new Error('Secretkey length miss match')

    const key: Buffer = crypto.scryptSync(secretKey, 'salt', 32, {
      N: 1024,
      r: 8,
      p: 1,
    })

    const iv: Buffer = crypto.randomBytes(16)
    const cipher: crypto.CipherGCM = crypto.createCipheriv('aes-256-gcm', key, iv)

    const cipherData: Buffer = Buffer.concat([cipher.update(data), cipher.final()])
    const tag: Buffer = cipher.getAuthTag()

    return Buffer.concat([iv, tag, cipherData])
  }

  static AES256Decrypt(secretKey: string, cipher: Buffer): Buffer {
    const checkValidSecretKey: crypto.KeyObject = crypto.createSecretKey(Buffer.from(secretKey))

    if (!checkValidSecretKey) throw new Error('Secretkey not valid')
    else if (checkValidSecretKey && checkValidSecretKey.symmetricKeySize < 32) throw new Error('Secretkey length miss match')

    const key: Buffer = crypto.scryptSync(secretKey, 'salt', 32, {
      N: 1024,
      r: 8,
      p: 1,
    })

    const iv: Buffer = cipher.subarray(0, 16)
    const tag: Buffer = cipher.subarray(16, 32)
    const cipherData: Buffer = cipher.subarray(32)

    const decipher: crypto.DecipherGCM = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)

    return Buffer.concat([decipher.update(cipherData), decipher.final()])
  }

  static HMACSHA512Sign(secretKey: crypto.BinaryLike | crypto.KeyObject, encoding: crypto.BinaryToTextEncoding, data: string): string {
    const symmetricSignature: crypto.Hmac = crypto.createHmac('SHA512', secretKey)
    symmetricSignature.update(data)
    return symmetricSignature.digest(encoding).toString()
  }

  static HMACSHA512Verify(
    secretKey: crypto.BinaryLike | crypto.KeyObject,
    encoding: crypto.BinaryToTextEncoding,
    data: string,
    hash: string,
  ): boolean {
    const symmetricSignature: crypto.Hmac = crypto.createHmac('SHA512', secretKey)
    symmetricSignature.update(data)
    return Buffer.compare(Buffer.from(symmetricSignature.digest(encoding).toString()), Buffer.from(hash)) == 0 ? true : false
  }
}
