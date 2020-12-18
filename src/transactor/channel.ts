/**
 * Copyright (c) 2020 BlockDev AG
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export interface PaymentChannel {
  id: string
  ownerId: string
  hermesId: string
  earnings: string
  earningsTotal: string
  beneficiary: string
}
