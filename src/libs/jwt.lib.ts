import crypto from 'node:crypto'
import * as jose from 'jose'
import moment from 'moment-timezone'
import { Injectable } from '@nestjs/common'

import { RedisService } from '~/libs/lib.redis'
import { JoseService } from '~/libs/jose.lib'
import { EnvironmentService } from '~/configs/env.config'
import { ISecretMetadata, ISignatureMetadata } from '~/interfaces/jwt.interface'
import { apiResponse } from '~/helpers/helper.apiResponse'
import { Encryption } from '~/helpers/helper.encryption'

@Injectable()
export class JwtService {
  private keyLength: number = 4096
  private certMetadata: ISecretMetadata = {
    privKeyRaw: '',
    pubKeyRaw: '',
    cipherKey: '',
  }
  private sigMetadata: ISignatureMetadata = {
    privKeyRaw: '',
    privKey: {} as any,
    sigKey: '',
    cipherKey: '',
    jweKey: {} as any,
  }

  constructor(
    private readonly redisService: RedisService,
    private readonly envService: EnvironmentService,
    private readonly joseService: JoseService,
  ) {}

  private createSecret(prefix: string, body: string): ISecretMetadata {
    try {
      const randomString: string = crypto.randomBytes(16).toString('hex')

      const cipherTextRandom: string = `${prefix}:${body}:${randomString}:${this.envService.JWT_EXPIRED}`
      const cipherTextData: string = Buffer.from(cipherTextRandom).toString('hex')

      const cipherSecretKey: string = crypto.createHash('SHA512').update(cipherTextData).digest().toString('hex')
      const cipherText: string = crypto.createHash('SHA512').update(randomString).digest().toString('hex')
      const cipherKey: string = Encryption.AES256Encrypt(cipherSecretKey, cipherText).toString('hex')

      const genCert: crypto.KeyPairSyncResult<string, string> = crypto.generateKeyPairSync('rsa', {
        modulusLength: this.keyLength,
        publicKeyEncoding: {
          type: 'pkcs1',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
          cipher: 'aes-256-cbc',
          passphrase: cipherKey,
        },
      })

      this.certMetadata = {
        privKeyRaw: genCert.privateKey,
        pubKeyRaw: genCert.publicKey,
        cipherKey: cipherKey,
      }

      return this.certMetadata
    } catch (e: any) {
      throw apiResponse(e)
    }
  }

  private async createSignature(prefix: string, body: any): Promise<ISignatureMetadata> {
    try {
      const signatureKey: string = `${prefix}:credential`
      const signatureField: string = 'signature_metadata'

      body = Buffer.from(JSON.stringify(body))
      const secretKey: ISecretMetadata = this.createSecret(prefix, body)

      const rsaPrivateKey: crypto.KeyObject = crypto.createPrivateKey({
        key: Buffer.from(secretKey.privKeyRaw),
        type: 'pkcs8',
        format: 'pem',
        passphrase: secretKey.cipherKey,
      })

      const rsaPublicKey: crypto.KeyObject = crypto.createPublicKey({
        key: Buffer.from(secretKey.pubKeyRaw),
        type: 'pkcs1',
        format: 'pem',
      })

      const cipherHash512: Buffer = crypto.sign('RSA-SHA512', body, rsaPrivateKey)
      const signatureOutput: string = cipherHash512.toString('hex')

      const verifiedSignature = crypto.verify('RSA-SHA512', body, rsaPublicKey, cipherHash512)
      if (!verifiedSignature) throw new Error('Invalid signature')

      const jweKey: jose.FlattenedJWE = await this.joseService.JweEncrypt(rsaPrivateKey, signatureOutput)
      if (!jweKey) throw new Error('Invalid encrypt')

      this.sigMetadata = {
        privKeyRaw: secretKey.privKeyRaw,
        sigKey: signatureOutput,
        cipherKey: secretKey.cipherKey,
        jweKey: jweKey,
      }

      await this.redisService.hsetEx(signatureKey, signatureField, this.envService.JWT_EXPIRED, this.sigMetadata)
      this.sigMetadata.privKey = rsaPrivateKey

      return this.sigMetadata
    } catch (e: any) {
      throw apiResponse(e)
    }
  }

  async sign(prefix: string, body: any): Promise<string> {
    try {
      const tokenKey: string = `${prefix}:token`
      const tokenExist: number = await this.redisService.exists(tokenKey)

      if (tokenExist < 1) {
        const signature: ISignatureMetadata = await this.createSignature(prefix, body)
        const timestamp: string = moment().format('YYYY/MM/DD HH:mm:ss')

        const aud: string = signature.sigKey.substring(10, 25)
        const iss: string = signature.sigKey.substring(20, 35)
        const sub: string = signature.sigKey.substring(40, 55)

        const secretKey: string = `${aud}:${iss}:${sub}:${this.envService.JWT_EXPIRED}`
        const secretData: string = Buffer.from(secretKey).toString('hex')

        const jti: string = Encryption.AES256Encrypt(secretData, prefix).toString('hex')

        const iat: number = Math.floor(Date.now() / 1000) + 60 * 60
        const exp: number = iat + this.envService.JWT_EXPIRED

        const tokenData: string = await this.joseService.JwtSign(
          signature.privKey,
          signature.jweKey.ciphertext,
          { timestamp: timestamp },
          {
            jti: jti,
            aud: aud,
            iss: iss,
            sub: sub,
            iat: iat,
            exp: exp,
          },
        )

        this.redisService.setEx(tokenKey, this.envService.JWT_EXPIRED, tokenData)

        return tokenData
      } else {
        return this.redisService.get(tokenKey)
      }
    } catch (e: any) {
      throw apiResponse(e)
    }
  }

  verify(prefix: string, token: string): Promise<jose.JWTVerifyResult<jose.JWTPayload>> {
    try {
      return this.joseService.JwtVerify(prefix, token)
    } catch (e: any) {
      throw apiResponse(e)
    }
  }
}
