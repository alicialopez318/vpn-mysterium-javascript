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

import { validate } from '../fmt/validation'

export interface Identity {
  id: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseIdentity(data: any): Identity {
  validate('Identity', data, { name: 'id', type: 'string' })
  return { id: data.id }
}

export interface IdentityList {
  identities: Identity[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseIdentityList(responseData: any): IdentityList {
  if (!(responseData && Array.isArray(responseData.identities))) {
    return { identities: [] }
  }

  return { identities: responseData.identities.map(parseIdentity) }
}
