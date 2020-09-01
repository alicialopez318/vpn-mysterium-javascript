/**
 * Copyright (c) 2020 BlockDev AG
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export interface ConnectionRequest {
  consumerId: string
  hermesId?: string
  providerId: string
  serviceType: string
  connectOptions?: ConnectOptions
}

export interface ConnectOptions {
  disableKillSwitch?: boolean
  dns?: DNSOption
}

export type DNSOption = 'auto' | 'provider' | 'system' | string
