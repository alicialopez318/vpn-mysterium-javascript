/**
 * Copyright (c) 2020 BlockDev AG
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { MMNApiKeyResponse } from '../mmn/mmn'
import { Issue, IssueId } from '../feedback/issue'
import { Config } from '../config/config'
import { AccessPolicy } from '../access-policy/access-policy'
import { IP } from '../location/ip'
import { ConnectionRequest } from '../connection/request'
import { ConnectionStatistics } from '../connection/statistics'
import { ConnectionInfo } from '../connection/status'
import { Location } from '../location/location'
import { NodeHealthcheck } from '../daemon/healthcheck'
import { IdentityRef, Identity } from '../identity/identity'
import { IdentityPayout } from '../identity/payout'
import { IdentityRegisterRequest, IdentityRegistrationResponse } from '../identity/registration'
import { NatStatusResponse } from '../nat/status'
import { Proposal, ProposalQuery } from '../proposal/proposal'
import { ProposalMetrics } from '../proposal/metrics'
import { ServiceInfo } from '../provider/service-info'
import { ServiceStartRequest } from '../provider/service-request'
import { SessionListQuery, SessionListResponse } from '../session/session'
import { TequilapiClient } from '../tequilapi-client'
import { Fees } from '../transactor/fees'
import { IdentityCurrentRequest } from '../identity/selection'
import { IdentityBeneficiaryResponse } from '../identity/beneficiary'

export class EmptyTequilapiClientMock implements TequilapiClient {
  public connectionCancel(): Promise<void> {
    throw Error('Not implemented')
  }

  public connectionCreate(request: ConnectionRequest, timeout?: number): Promise<ConnectionInfo> {
    throw Error('Not implemented')
  }

  public connectionIp(timeout?: number): Promise<IP> {
    throw Error('Not implemented')
  }

  public connectionLocation(): Promise<Location> {
    throw Error('Not implemented')
  }

  public connectionStatistics(): Promise<ConnectionStatistics> {
    throw Error('Not implemented')
  }

  public connectionStatus(): Promise<ConnectionInfo> {
    throw Error('Not implemented')
  }

  public findProposals(options?: ProposalQuery): Promise<Proposal[]> {
    throw Error('Not implemented')
  }

  public proposalsQuality(): Promise<ProposalMetrics[]> {
    throw Error('Not implemented')
  }

  public healthCheck(timeout?: number): Promise<NodeHealthcheck> {
    throw Error('Not implemented')
  }

  public identityList(): Promise<IdentityRef[]> {
    throw Error('Not implemented')
  }

  public identity(id: string): Promise<Identity> {
    throw Error('Not implemented')
  }

  public identityCreate(passphrase: string): Promise<IdentityRef> {
    throw Error('Not implemented')
  }

  public identityRegister(id: string, request?: IdentityRegisterRequest): Promise<void> {
    throw Error('Not implemented')
  }

  public identityRegistration(id: string): Promise<IdentityRegistrationResponse> {
    throw Error('Not implemented')
  }

  public identityBeneficiary(id: string): Promise<IdentityBeneficiaryResponse> {
    throw Error('Not implemented')
  }

  public updateIdentityPayout(id: string, ethAddress: string): Promise<void> {
    throw Error('Not implemented')
  }

  public identityUnlock(id: string, passphrase: string, timeout?: number): Promise<void> {
    throw Error('Not implemented')
  }

  public identityPayout(id: string): Promise<IdentityPayout> {
    throw Error('Not implemented')
  }

  public location(timeout?: number): Promise<Location> {
    throw Error('Not implemented')
  }

  public natStatus(): Promise<NatStatusResponse> {
    throw new Error('Not implemented')
  }

  public serviceGet(serviceId: string): Promise<ServiceInfo> {
    throw Error('Not implemented')
  }

  public serviceList(): Promise<ServiceInfo[]> {
    throw Error('Not implemented')
  }

  public serviceStart(request: ServiceStartRequest, timeout?: number): Promise<ServiceInfo> {
    throw Error('Not implemented')
  }

  public serviceStop(serviceId: string): Promise<void> {
    throw Error('Not implemented')
  }

  public sessions(query?: SessionListQuery): Promise<SessionListResponse> {
    throw Error('Not implemented')
  }

  public stop(): Promise<void> {
    throw Error('Not implemented')
  }

  public accessPolicies(): Promise<AccessPolicy[]> {
    throw Error('Not implemented')
  }

  public identityCurrent(request: IdentityCurrentRequest): Promise<IdentityRef> {
    throw Error('Not implemented')
  }

  public updateReferralCode(id: string, referralCode: string): Promise<void> {
    throw Error('Not implemented')
  }

  public updateEmail(id: string, email: string): Promise<void> {
    throw Error('Not implemented')
  }

  public authChangePassword(
    username: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    throw Error('Not implemented')
  }

  public authLogin(username: string, password: string): Promise<void> {
    throw Error('Not implemented')
  }

  public updateUserConfig(config: Config): Promise<Config> {
    throw Error('Not implemented')
  }

  public defaultConfig(): Promise<Config> {
    throw Error('Not implemented')
  }

  public userConfig(): Promise<Config> {
    throw Error('Not implemented')
  }

  public reportIssue(issue: Issue, timeout?: number): Promise<IssueId> {
    throw Error('Not implemented')
  }

  public transactorFees(): Promise<Fees> {
    throw Error('Not implemented')
  }

  public async getMMNNodeReport(): Promise<any> {
    throw Error('Not implemented')
  }

  public async setMMNApiKey(apiKey: string): Promise<any> {
    throw Error('Not implemented')
  }

  public async getMMNApiKey(): Promise<MMNApiKeyResponse> {
    throw Error('Not implemented')
  }

  public async clearMMNApiKey(): Promise<void> {
    throw Error('Not implemented')
  }
}
