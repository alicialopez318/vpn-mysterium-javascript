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

import { ProposalQueryOptions } from './proposals-query-options'
import { HttpQueryParams } from '../http/interface'

export default class ProposalsQuery {
  public options?: ProposalQueryOptions

  public constructor(options?: ProposalQueryOptions) {
    this.options = options
  }

  public toQueryParams(): HttpQueryParams {
    const queryObj: HttpQueryParams = {}

    const options = this.options
    if (!options) {
      return queryObj
    }

    if (options.providerId) {
      queryObj.providerId = options.providerId
    }
    if (options.serviceType) {
      queryObj.serviceType = options.serviceType
    }
    if (options.accessPolicyProtocol) {
      queryObj.accessPolicyProtocol = options.accessPolicyProtocol
    }
    if (options.accessPolicyId) {
      queryObj.accessPolicyId = options.accessPolicyId
    }
    if (options.fetchConnectCounts) {
      queryObj.fetchConnectCounts = options.fetchConnectCounts
    }
    return queryObj
  }
}
