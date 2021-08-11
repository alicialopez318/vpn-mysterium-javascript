/**
 * Copyright (c) 2020 BlockDev AG
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { validate } from '../fmt/validation'

export enum NatStatus {
  NOT_FINISHED = 'not_finished',
  FAILED = 'failure',
  SUCCESSFUL = 'successful',
}

export enum NatStatusV2 {
  PASSED = 'passed',
  FAILED = 'failed',
  PENDING = 'pending',
}

export interface NatStatusResponse {
  status: NatStatus
  error?: string
}

export interface NatStatusV2Response {
  status: NatStatusV2
  error?: string
}

export interface Nat {
  status: NatStatusV2Response
}

export function parseNatStatusResponse(data: any): NatStatusResponse {
  validate('NatStatusResponse', data, { name: 'status', type: 'string' })
  if (data.error) {
    validate('NatStatusResponse', data, { name: 'error', type: 'string' })
  }
  return data
}
