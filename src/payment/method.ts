/**
 * Copyright (c) 2020 BlockDev AG
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Currency } from './myst'

export enum PaymentMethodType {
  BytesWithTime = 'BYTES_TRANSFERRED_WITH_TIME',
  Unsupported = 'UNSUPPORTED',
}

export interface Money {
  amount: number
  currency: string
}

export interface PaymentMethod {
  type: PaymentMethodType
  price: Money
  rate: {
    perSeconds: number
    perBytes: number
  }
}

export const pricePerMinute = (pm?: PaymentMethod): Money => {
  if (!pm || !pm.rate.perSeconds) {
    return { amount: 0, currency: pm?.price?.currency || Currency.MYST }
  }
  return {
    amount: Math.round((60 / pm.rate.perSeconds) * pm.price.amount),
    currency: pm.price.currency,
  }
}

const bytesInGiB = 1024 * 1024 * 1024

export const pricePerGiB = (pm?: PaymentMethod): Money => {
  if (!pm || !pm.rate.perBytes) {
    return { amount: 0, currency: pm?.price?.currency || Currency.MYST }
  }
  return {
    amount: Math.round((bytesInGiB / pm.rate.perBytes) * pm.price.amount),
    currency: pm.price.currency,
  }
}
