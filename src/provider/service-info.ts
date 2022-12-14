/**
 * Copyright (c) 2020 BlockDev AG
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { validateArray, validateMultiple } from '../fmt/validation'
import { parseProposal, Proposal } from '../proposal/proposal'
import { ServiceStatus } from './service-status'

export interface ServiceOptions {
  port?: number
  protocol?: string

  [key: string]: any
}

export interface ServiceInfo {
  id?: string
  providerId?: string
  type: string
  options?: ServiceOptions
  status: ServiceStatus
  proposal: Proposal
  connectionStatistics?: {
    attempted: number
    successful: number
  }
}

export function parseServiceInfo(data: any): ServiceInfo {
  // TODO: validate that status has value from ServiceStatus enum
  validateMultiple('ServiceInfo', data, [
    { name: 'id', type: 'string', optional: true },
    { name: 'providerId', type: 'string', optional: true },
    { name: 'type', type: 'string' },
    { name: 'options', type: 'object', optional: true },
    { name: 'status', type: 'string' },
    { name: 'proposal', type: 'object', optional: true },
  ])

  data.proposal && parseProposal(data.proposal)

  return data
}

export function parseServiceListResponse(responseData: any): ServiceInfo[] {
  validateArray('ServiceInfo[]', responseData)
  return responseData.map(parseServiceInfo)
}
