/**
 * Copyright (c) 2020 BlockDev AG
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MMNApiKeyResponse, MMNReportResponse } from './mmn/mmn'
import { Issue, IssueId } from './feedback/issue'
import { Config } from './config/config'
import { AccessPolicy, parseAccessPolicyList } from './access-policy/access-policy'
import { ConnectionRequest } from './connection/request'
import { ConnectionInfo, parseConnectionInfo } from './connection/status'
import { IP, parseIP } from './location/ip'
import { ConnectionStatistics, parseConnectionStatistics } from './connection/statistics'
import { Location, parseLocation } from './location/location'
import { NodeHealthcheck, parseHealthcheckResponse } from './daemon/healthcheck'
import { HttpInterface } from './http/interface'
import { TIMEOUT_DISABLED } from './http/timeouts'
import {
  Identity,
  IdentityRef,
  parseIdentity,
  parseIdentityList,
  parseIdentityRef,
} from './identity/identity'
import { IdentityPayout, parseIdentityPayout } from './identity/payout'
import {
  IdentityRegisterRequest,
  IdentityRegistrationResponse,
  parseIdentityRegistrationResponse,
} from './identity/registration'
import {
  IdentityBeneficiaryResponse,
  parseIdentityBeneficiaryResponse,
} from './identity/beneficiary'
import { NatStatusResponse, parseNatStatusResponse } from './nat/status'
import { parseProposalList, Proposal, ProposalQuery } from './proposal/proposal'
import { ProposalMetrics } from './proposal/metrics'
import { parseServiceInfo, parseServiceInfoList, ServiceInfo } from './provider/service-info'
import { ServiceRequest } from './provider/service-request'
import { parseSessionListResponse, SessionListQuery, SessionListResponse } from './session/session'
import { TopUpRequest } from './payment/topup'
import { TransactorFeesResponse } from './payment/fees'
import { IdentityCurrentRequest } from './identity/selection'

export const TEQUILAPI_URL = 'http://127.0.0.1:4050'

export interface TequilapiClient {
  healthCheck(timeout?: number): Promise<NodeHealthcheck>
  natStatus(): Promise<NatStatusResponse>
  stop(): Promise<void>
  location(timeout?: number): Promise<Location>

  defaultConfig(): Promise<Config>
  userConfig(): Promise<Config>
  updateUserConfig(config: Config): Promise<Config>

  identityList(): Promise<IdentityRef[]>
  identityCurrent(request: IdentityCurrentRequest): Promise<IdentityRef>
  identityCreate(passphrase: string): Promise<IdentityRef>
  identityUnlock(id: string, passphrase: string, timeout?: number): Promise<void>
  identityRegister(id: string, request?: IdentityRegisterRequest): Promise<void>
  identity(id: string): Promise<Identity>
  identityRegistration(id: string): Promise<IdentityRegistrationResponse>
  identityBeneficiary(id: string): Promise<IdentityBeneficiaryResponse>
  identityPayout(id: string): Promise<IdentityPayout>
  updateIdentityPayout(id: string, ethAddress: string): Promise<void>
  updateEmail(id: string, email: string): Promise<void>
  updateReferralCode(id: string, referralCode: string): Promise<void>

  authChangePassword(username: string, oldPassword: string, newPassword: string): Promise<void>
  authLogin(username: string, password: string): Promise<void>

  findProposals(options?: ProposalQuery): Promise<Proposal[]>
  proposalsQuality(): Promise<ProposalMetrics[]>

  reportIssue(issue: Issue, timeout?: number): Promise<IssueId>

  connectionCreate(request: ConnectionRequest, timeout?: number): Promise<ConnectionInfo>
  connectionStatus(): Promise<ConnectionInfo>
  connectionCancel(): Promise<void>
  connectionIp(timeout?: number): Promise<IP>
  connectionStatistics(): Promise<ConnectionStatistics>
  connectionLocation(): Promise<Location>

  serviceList(): Promise<ServiceInfo[]>
  serviceGet(serviceId: string): Promise<ServiceInfo>
  serviceStart(request: ServiceRequest, timeout?: number): Promise<ServiceInfo>
  serviceStop(serviceId: string): Promise<void>

  sessions(query?: SessionListQuery): Promise<SessionListResponse>
  accessPolicies(): Promise<AccessPolicy[]>

  transactorFees(): Promise<TransactorFeesResponse>
  topUp(request: TopUpRequest): Promise<void>

  getMMNNodeReport(): Promise<MMNReportResponse>
  setMMNApiKey(apiKey: string): Promise<void>
  getMMNApiKey(): Promise<MMNApiKeyResponse>
  clearMMNApiKey(): Promise<void>
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

  public async natStatus(): Promise<NatStatusResponse> {
    const response = await this.http.get('nat/status')
    return parseNatStatusResponse(response)
  }

  public async stop(): Promise<void> {
    await this.http.post('stop')
  }

  public async location(timeout?: number): Promise<Location> {
    const response = await this.http.get('location', undefined, timeout)
    if (!response) {
      throw new Error('ServiceLocation response body is missing')
    }
    return parseLocation(response)
  }

  public async identityList(): Promise<IdentityRef[]> {
    const response = await this.http.get('identities')
    if (!response) {
      throw new Error('Identity list response body is missing')
    }
    const responseDto = parseIdentityList(response)

    return responseDto.identities
  }

  public async identity(id: string): Promise<Identity> {
    const response = await this.http.get(`identities/${id}`)
    if (!response) {
      throw new Error('Identity response body is missing')
    }
    return parseIdentity(response)
  }

  public async identityCurrent(request: IdentityCurrentRequest): Promise<IdentityRef> {
    const response = await this.http.put('identities/current', request)

    if (!response) {
      throw new Error('Identity response body is missing')
    }

    return parseIdentityRef(response)
  }

  public async identityCreate(passphrase: string): Promise<IdentityRef> {
    const response = await this.http.post('identities', { passphrase })
    if (!response) {
      throw new Error('Identity creation response body is missing')
    }
    return parseIdentityRef(response)
  }

  public async identityUnlock(id: string, passphrase: string, timeout?: number): Promise<void> {
    await this.http.put('identities/' + id + '/unlock', { passphrase }, timeout)
  }

  public async identityRegister(id: string, request?: IdentityRegisterRequest): Promise<void> {
    return await this.http.post(`identities/${id}/register`, request ?? {})
  }

  public async identityRegistration(id: string): Promise<IdentityRegistrationResponse> {
    const response = await this.http.get(`identities/${id}/registration`)
    if (!response) {
      throw new Error('Identity registration response body is missing')
    }
    return parseIdentityRegistrationResponse(response)
  }

  public async identityBeneficiary(id: string): Promise<IdentityBeneficiaryResponse> {
    const response = await this.http.get(`identities/${id}/beneficiary`)
    if (!response) {
      throw new Error('Identity registration response body is missing')
    }
    return parseIdentityBeneficiaryResponse(response)
  }

  public async identityPayout(id: string): Promise<IdentityPayout> {
    const response = await this.http.get(`identities/${id}/payout`)
    if (!response) {
      throw new Error('Identity payout response body is missing')
    }
    return parseIdentityPayout(response)
  }

  public async updateIdentityPayout(id: string, ethAddress: string): Promise<void> {
    await this.http.put(`identities/${id}/payout`, { ethAddress })
  }

  public async updateReferralCode(id: string, referralCode: string): Promise<void> {
    await this.http.put(`identities/${id}/referral`, { referralCode: referralCode })
  }

  public async updateEmail(id: string, email: string): Promise<void> {
    await this.http.put(`identities/${id}/email`, { email })
  }

  public async authChangePassword(
    username: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    return this.http.put(`auth/password`, {
      username,
      // eslint-disable-next-line @typescript-eslint/camelcase
      oldPassword: oldPassword,
      // eslint-disable-next-line @typescript-eslint/camelcase
      newPassword: newPassword,
    })
  }

  public async authLogin(username: string, password: string): Promise<void> {
    return this.http.post(`auth/login`, { username, password })
  }

  public async findProposals(query?: ProposalQuery): Promise<Proposal[]> {
    const response = await this.http.get('proposals', query)
    if (!response) {
      throw new Error('Proposals response body is missing')
    }
    return parseProposalList(response).proposals || []
  }

  public async proposalsQuality(): Promise<ProposalMetrics[]> {
    const response = await this.http.get('proposals/quality')
    if (!response) {
      throw new Error('Proposals response body is missing')
    }
    return response.metrics || []
  }

  public async connectionCreate(
    request: ConnectionRequest,
    timeout: number | undefined = TIMEOUT_DISABLED
  ): Promise<ConnectionInfo> {
    const response = await this.http.put('connection', request, timeout)
    if (!response) {
      throw new Error('Connection creation response body is missing')
    }
    return parseConnectionInfo(response)
  }

  public async connectionStatus(): Promise<ConnectionInfo> {
    const response = await this.http.get('connection')
    if (!response) {
      throw new Error('Connection status response body is missing')
    }
    return parseConnectionInfo(response)
  }

  public async connectionCancel(): Promise<void> {
    await this.http.delete('connection')
  }

  public async connectionIp(timeout?: number): Promise<IP> {
    const response = await this.http.get('connection/ip', undefined, timeout)
    if (!response) {
      throw new Error('Connection IP response body is missing')
    }
    return parseIP(response)
  }

  public async connectionLocation(): Promise<Location> {
    return await this.http.get('connection/location')
  }

  public async connectionStatistics(): Promise<ConnectionStatistics> {
    const response = await this.http.get('connection/statistics')
    if (!response) {
      throw new Error('Connection statistics response body is missing')
    }
    return parseConnectionStatistics(response)
  }

  public async serviceList(): Promise<ServiceInfo[]> {
    const response = await this.http.get('services')
    if (!response) {
      throw new Error('Service list response body is missing')
    }

    return parseServiceInfoList(response)
  }

  public async serviceGet(id: string): Promise<ServiceInfo> {
    const response = await this.http.get('services/' + id)
    if (!response) {
      throw new Error('Service response body is missing')
    }

    return parseServiceInfo(response)
  }

  public async serviceStart(
    request: ServiceRequest,
    timeout: number | undefined = TIMEOUT_DISABLED
  ): Promise<ServiceInfo> {
    const response = await this.http.post('services', request, timeout)
    if (!response) {
      throw new Error('Service creation response body is missing')
    }
    return parseServiceInfo(response)
  }

  public async serviceStop(serviceId: string): Promise<void> {
    await this.http.delete('services/' + serviceId)
  }

  public async sessions(query?: SessionListQuery): Promise<SessionListResponse> {
    const response = await this.http.get('sessions', query)
    if (!response) {
      throw new Error('Service sessions response body is missing')
    }
    return parseSessionListResponse(response)
  }

  public async accessPolicies(): Promise<AccessPolicy[]> {
    const response = await this.http.get('access-policies')
    if (!response) {
      throw new Error('Access policies response body is missing')
    }

    return parseAccessPolicyList(response)
  }

  public async defaultConfig(): Promise<Config> {
    const response = await this.http.get('config/default')
    if (!response) {
      throw new Error('Default config body is missing')
    }

    return response
  }

  public async userConfig(): Promise<Config> {
    const response = await this.http.get('config/user')
    if (!response) {
      throw new Error('User config body is missing')
    }

    return response
  }

  public async updateUserConfig(config: Config): Promise<Config> {
    return this.http.post(`config/user`, config)
  }

  public async reportIssue(issue: Issue, timeout?: number): Promise<IssueId> {
    return this.http.post(`feedback/issue`, issue, timeout)
  }

  public async transactorFees(): Promise<TransactorFeesResponse> {
    return this.http.get(`transactor/fees`)
  }

  public async topUp(request: TopUpRequest): Promise<void> {
    return this.http.post(`transactor/topup`, request)
  }

  public async getMMNNodeReport(): Promise<MMNReportResponse> {
    return this.http.get(`mmn/report`)
  }

  public async setMMNApiKey(apiKey: string): Promise<void> {
    return this.http.post(`mmn/api-key`, { apiKey: apiKey })
  }

  public async getMMNApiKey(): Promise<MMNApiKeyResponse> {
    return this.http.get(`mmn/api-key`)
  }

  public async clearMMNApiKey(): Promise<void> {
    return this.http.delete(`mmn/api-key`)
  }
}
