import crypto from 'node:crypto'
import * as jose from 'jose'
import { JwtPayload } from 'jsonwebtoken'
import { Injectable } from '@nestjs/common'

import { RedisService } from '~/libs/lib.redis'
import { apiResponse } from '~/helpers/helper.apiResponse'
import { ISignatureMetadata } from '~/interfaces/jwt.interface'

@Injectable()
export class JoseService {
  constructor(private readonly redisService: RedisService) {}

  JweEncrypt(privateKey: jose.KeyLike | crypto.KeyObject, data: string): Promise<jose.FlattenedJWE> {
    try {
      const text: Uint8Array = new TextEncoder().encode(data)
      const jwe: jose.FlattenedEncrypt = new jose.FlattenedEncrypt(text).setProtectedHeader({
        alg: 'RSA-OAEP',
        enc: 'A256CBC-HS512',
        typ: 'JWT',
        cty: 'JWT',
      })

      return jwe.encrypt(privateKey)
    } catch (e: any) {
      throw apiResponse(e)
    }
  }

  async JweDecerypt(privateKey: jose.KeyLike | crypto.KeyObject, jweEncryption: jose.FlattenedJWE): Promise<string> {
    try {
      const jwe: jose.FlattenedDecryptResult = await jose.flattenedDecrypt(jweEncryption, privateKey)
      const text: string = new TextDecoder().decode(jwe.plaintext)

      return text
    } catch (e: any) {
      throw apiResponse(e)
    }
  }

  importJsonWebKey(jwkExport: jose.JWK): Promise<jose.KeyLike | Uint8Array> {
    try {
      return jose.importJWK(jwkExport)
    } catch (e: any) {
      throw apiResponse(e)
    }
  }

  exportJsonWebKey(privateKey: jose.KeyLike | crypto.KeyObject): Promise<jose.JWK> {
    try {
      return jose.exportJWK(privateKey)
    } catch (e: any) {
      throw apiResponse(e)
    }
  }

  JwtSign(privateKey: jose.KeyLike | crypto.KeyObject, headerKeyId: string, data: Record<string, any>, options: JwtPayload): Promise<string> {
    try {
      return new jose.SignJWT(data)
        .setProtectedHeader({ alg: 'RS512', typ: 'JWT', cty: 'JWT', kid: headerKeyId, b64: true })
        .setAudience(options.aud)
        .setIssuer(options.iss)
        .setSubject(options.sub)
        .setIssuedAt(options.iat)
        .setExpirationTime(options.exp)
        .setJti(options.jti)
        .sign(privateKey)
    } catch (e: any) {
      throw apiResponse(e)
    }
  }

  async JwtVerify(prefix: string, token: string): Promise<jose.JWTVerifyResult<jose.JWTPayload>> {
    try {
      const signatureKey: string = `${prefix}:credential`
      const signatureMetadataField: string = 'signature_metadata'

      const signature: ISignatureMetadata = await this.redisService.hget(signatureKey, signatureMetadataField)
      if (!signature) {
        throw new Error('Invalid signature')
      }

      const rsaPrivateKey: crypto.KeyObject = crypto.createPrivateKey({ key: signature.privKeyRaw, passphrase: signature.cipherKey })
      if (!rsaPrivateKey) {
        throw new Error('Invalid signature')
      }

      const jwsVerify: jose.CompactVerifyResult = await jose.compactVerify(token, rsaPrivateKey)
      if (jwsVerify.protectedHeader.kid !== signature.jweKey.ciphertext) {
        throw new Error('Invalid signature')
      }

      const aud: string = signature.sigKey.substring(10, 25)
      const iss: string = signature.sigKey.substring(20, 35)
      const sub: string = signature.sigKey.substring(40, 55)

      return jose.jwtVerify(token, rsaPrivateKey, {
        audience: aud,
        issuer: iss,
        subject: sub,
        algorithms: [jwsVerify.protectedHeader.alg],
        typ: jwsVerify.protectedHeader.typ,
      })
    } catch (e: any) {
      throw apiResponse(e)
    }
  }
}
