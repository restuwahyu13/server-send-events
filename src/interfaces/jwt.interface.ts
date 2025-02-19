import crypto from 'node:crypto'
import * as jose from 'jose'

export interface ISecretMetadata {
  privKeyRaw: string
  pubKeyRaw: string
  cipherKey: string
}

export interface ISignatureMetadata {
  privKey?: crypto.KeyObject
  privKeyRaw: string
  sigKey: string
  cipherKey: string
  jweKey: jose.FlattenedJWE
}
