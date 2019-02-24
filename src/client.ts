/*
 * Copyright (C) 2017 The "mysteriumnetwork/js-tequilapi" Authors.
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

import { ConnectionIPDTO } from './dto/connection-ip'
import { ConnectionStatisticsDTO } from './dto/connection-statistics'
import { ConnectionStatusDTO } from './dto/connection-status-dto'
import { ConsumerLocationDTO } from './dto/consumer-location'
import { IdentityDTO } from './dto/identity'
import { IdentityRegistrationDTO } from './dto/identity-registration/identity-registration'
import { NodeHealthcheckDTO } from './dto/node-healthcheck'
import { ProposalDTO } from './dto/proposal'
import { ConnectionRequest } from './dto/query/connection-request'
import { ProposalQueryOptions } from './dto/query/proposals-query-options'
import { ServiceInfoDTO } from './dto/service-info'
import { ServiceRequest } from './dto/service-request'
import { SessionDTO } from './dto/session'

// TODO: rename file to 'tequilapi-client.ts'

export interface TequilapiClient {
  healthCheck (timeout?: number): Promise<NodeHealthcheckDTO>,
  stop (): Promise<void>,
  location (timeout?: number): Promise<ConsumerLocationDTO>,

  identitiesList (): Promise<IdentityDTO[]>,
  identityCreate (passphrase: string): Promise<IdentityDTO>,
  identityUnlock (id: string, passphrase: string, timeout?: number): Promise<void>,
  identityRegistration (id: string): Promise<IdentityRegistrationDTO>,

  findProposals (options?: ProposalQueryOptions): Promise<ProposalDTO[]>,

  connectionCreate (request: ConnectionRequest, timeout?: number): Promise<ConnectionStatusDTO>,
  connectionStatus (): Promise<ConnectionStatusDTO>,
  connectionCancel (): Promise<void>,
  connectionIP (timeout?: number): Promise<ConnectionIPDTO>,
  connectionStatistics (): Promise<ConnectionStatisticsDTO>,

  sessionsList (): Promise<SessionDTO[]>,

  serviceList (): Promise<ServiceInfoDTO[]>,
  serviceGet (serviceId: string): Promise<ServiceInfoDTO>,
  serviceStart (request: ServiceRequest, timeout?: number): Promise<ServiceInfoDTO>,
  serviceStop (serviceId: string): Promise<void>
}
