/*
 * Copyright (C) 2017 The "mysteriumnetwork/mysterium-vpn-js" Authors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import axios from 'axios'
import { AccessPolicy, parseAccessPolicyList } from './access-policy/access-policy'
import { ConnectionRequest } from './connection/request'
import { ConnectionStatusResponse, parseConnectionStatusResponse } from './connection/status'
import { ConnectionIP, parseConnectionIP } from './connection/ip'
import { ConnectionSession, validateSession } from './connection/session'
import { parseConnectionStatistics, ConnectionStatistics } from './connection/statistics'
import { ConsumerLocation, parseConsumerLocation } from './consumer/location'
import { NodeHealthcheck, parseHealthcheckResponse } from './daemon/healthcheck'
import { AxiosAdapter } from './http/axios-adapter'
import { HttpInterface } from './http/interface'
import { TIMEOUT_DEFAULT, TIMEOUT_DISABLED } from './http/timeouts'
import {
  IdentityDTO,
  IdentityPayoutDTO,
  IdentityRegistrationDTO,
  parseIdentitiesResponseDTO,
  parseIdentityDTO,
  parseIdentityPayoutDTO,
  parseIdentityRegistrationDTO,
} from './identity'
import { NatStatusDTO, parseNatStatusResponse } from './nat'
import { parseProposalList, Proposal, ProposalQuery } from './proposal/proposal'
import {
  parseServiceInfoDTO,
  parseServiceListDTO,
  parseServiceSessionListDTO,
  ServiceInfoDTO,
  ServiceRequest,
  ServiceSessionDTO,
} from './provider'

export const TEQUILAPI_URL = 'http://127.0.0.1:4050'

export interface TequilapiClient {
  healthCheck(timeout?: number): Promise<NodeHealthcheck>
  natStatus(): Promise<NatStatusDTO>
  stop(): Promise<void>
  location(timeout?: number): Promise<ConsumerLocation>

  identitiesList(): Promise<IdentityDTO[]>
  identityCreate(passphrase: string): Promise<IdentityDTO>
  identityUnlock(id: string, passphrase: string, timeout?: number): Promise<void>
  identityRegistration(id: string): Promise<IdentityRegistrationDTO>
  identityPayout(id: string): Promise<IdentityPayoutDTO>
  updateIdentityPayout(id: string, ethAddress: string): Promise<void>

  findProposals(options?: ProposalQuery): Promise<Proposal[]>

  connectionCreate(request: ConnectionRequest, timeout?: number): Promise<ConnectionStatusResponse>
  connectionStatus(): Promise<ConnectionStatusResponse>
  connectionCancel(): Promise<void>
  connectionIP(timeout?: number): Promise<ConnectionIP>
  connectionStatistics(): Promise<ConnectionStatistics>
  connectionSessions(): Promise<ConnectionSession[]>

  serviceList(): Promise<ServiceInfoDTO[]>
  serviceGet(serviceId: string): Promise<ServiceInfoDTO>
  serviceStart(request: ServiceRequest, timeout?: number): Promise<ServiceInfoDTO>
  serviceStop(serviceId: string): Promise<void>
  serviceSessions(): Promise<ServiceSessionDTO[]>

  accessPolicies(): Promise<AccessPolicy[]>
}

export class HttpTequilapiClient implements TequilapiClient {
  public http: HttpInterface

  public constructor(http: HttpInterface) {
    this.http = http
  }

  public async healthCheck(timeout?: number): Promise<NodeHealthcheck> {
    const response = await this.http.get('healthcheck', undefined, timeout)
    if (!response) {
      throw new Error('Healthcheck response body is missing')
    }
    return parseHealthcheckResponse(response)
  }

  public async natStatus(): Promise<NatStatusDTO> {
    const response = await this.http.get('nat/status')
    return parseNatStatusResponse(response)
  }

  public async stop(): Promise<void> {
    await this.http.post('stop')
  }

  public async location(timeout?: number): Promise<ConsumerLocation> {
    const response = await this.http.get('location', undefined, timeout)
    if (!response) {
      throw new Error('Location response body is missing')
    }
    return parseConsumerLocation(response)
  }

  public async identitiesList(): Promise<IdentityDTO[]> {
    const response = await this.http.get('identities')
    if (!response) {
      throw new Error('Identities response body is missing')
    }
    const responseDto = parseIdentitiesResponseDTO(response)

    return responseDto.identities
  }

  public async identityCreate(passphrase: string): Promise<IdentityDTO> {
    const response = await this.http.post('identities', { passphrase })
    if (!response) {
      throw new Error('Identities creation response body is missing')
    }
    return parseIdentityDTO(response)
  }

  public async identityUnlock(id: string, passphrase: string, timeout?: number): Promise<void> {
    await this.http.put('identities/' + id + '/unlock', { passphrase }, timeout)
  }

  public async identityRegistration(id: string): Promise<IdentityRegistrationDTO> {
    const response = await this.http.get(`identities/${id}/registration`)
    if (!response) {
      throw new Error('Identities registration response body is missing')
    }
    return parseIdentityRegistrationDTO(response)
  }

  public async identityPayout(id: string): Promise<IdentityPayoutDTO> {
    const response = await this.http.get(`identities/${id}/payout`)
    if (!response) {
      throw new Error('Identity payout response body is missing')
    }
    return parseIdentityPayoutDTO(response)
  }

  public async updateIdentityPayout(id: string, ethAddress: string): Promise<void> {
    await this.http.put(`identities/${id}/payout`, { ethAddress })
  }

  public async findProposals(query?: ProposalQuery): Promise<Proposal[]> {
    const response = await this.http.get('proposals', query)
    if (!response) {
      throw new Error('Proposals response body is missing')
    }
    return parseProposalList(response).proposals || []
  }

  public async connectionCreate(
    request: ConnectionRequest,
    timeout: number | undefined = TIMEOUT_DISABLED
  ): Promise<ConnectionStatusResponse> {
    const response = await this.http.put(
      'connection',
      {
        consumerId: request.consumerId,
        providerId: request.providerId,
        serviceType: request.serviceType,
      },
      timeout
    )
    if (!response) {
      throw new Error('Connection creation response body is missing')
    }
    return parseConnectionStatusResponse(response)
  }

  public async connectionStatus(): Promise<ConnectionStatusResponse> {
    const response = await this.http.get('connection')
    if (!response) {
      throw new Error('Connection status response body is missing')
    }
    return parseConnectionStatusResponse(response)
  }

  public async connectionCancel(): Promise<void> {
    await this.http.delete('connection')
  }

  public async connectionIP(timeout?: number): Promise<ConnectionIP> {
    const response = await this.http.get('connection/ip', undefined, timeout)
    if (!response) {
      throw new Error('Connection IP response body is missing')
    }
    return parseConnectionIP(response)
  }

  public async connectionStatistics(): Promise<ConnectionStatistics> {
    const response = await this.http.get('connection/statistics')
    if (!response) {
      throw new Error('Connection statistics response body is missing')
    }
    return parseConnectionStatistics(response)
  }

  public async connectionSessions(): Promise<ConnectionSession[]> {
    const response = await this.http.get('connection-sessions')
    if (!response) {
      throw new Error('Connection sessions response body is missing')
    }
    return response.sessions.map(validateSession)
  }

  public async serviceList(): Promise<ServiceInfoDTO[]> {
    const response = await this.http.get('services')
    if (!response) {
      throw new Error('Service list response body is missing')
    }

    return parseServiceListDTO(response)
  }

  public async serviceGet(id: string): Promise<ServiceInfoDTO> {
    const response = await this.http.get('services/' + id)
    if (!response) {
      throw new Error('Service response body is missing')
    }

    return parseServiceInfoDTO(response)
  }

  public async serviceStart(
    request: ServiceRequest,
    timeout: number | undefined = TIMEOUT_DISABLED
  ): Promise<ServiceInfoDTO> {
    const response = await this.http.post(
      'services',
      {
        providerId: request.providerId,
        type: request.type,
        accessPolicies: request.accessPolicies,
        options: request.options,
      },
      timeout
    )
    if (!response) {
      throw new Error('Service creation response body is missing')
    }
    return parseServiceInfoDTO(response)
  }

  public async serviceStop(serviceId: string): Promise<void> {
    await this.http.delete('services/' + serviceId)
  }

  public async serviceSessions(): Promise<ServiceSessionDTO[]> {
    const response = await this.http.get('service-sessions')
    if (!response) {
      throw new Error('Service sessions response body is missing')
    }
    return parseServiceSessionListDTO(response)
  }

  public async accessPolicies(): Promise<AccessPolicy[]> {
    const response = await this.http.get('access-policies')
    if (!response) {
      throw new Error('Access policies response body is missing')
    }

    return parseAccessPolicyList(response)
  }
}

export class TequilapiClientFactory {
  public _baseUrl: string
  public _defaultTimeout: number

  public constructor(baseUrl: string = TEQUILAPI_URL, defaultTimeout: number = TIMEOUT_DEFAULT) {
    this._baseUrl = baseUrl
    this._defaultTimeout = defaultTimeout
  }

  public build(adapter: HttpInterface): TequilapiClient {
    return new HttpTequilapiClient(adapter)
  }

  public buildAdapter(): HttpInterface {
    const axiosInstance = axios.create({
      baseURL: this._baseUrl,
      headers: {
        'Cache-Control': 'no-cache, no-store',
      },
    })
    return new AxiosAdapter(axiosInstance, this._defaultTimeout)
  }
}
