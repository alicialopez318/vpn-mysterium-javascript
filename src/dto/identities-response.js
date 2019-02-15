/*
 * Copyright (C) 2017 The "mysteriumnetwork/mysterium-vpn" Authors.
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

// @flow
import type { IdentityDTO } from './identity'
import { parseIdentityDTO } from './identity'

type IdentitiesResponseDTO = {
  identities: Array<IdentityDTO>
}

function parseIdentitiesResponseDTO (responseData: Object): IdentitiesResponseDTO {
  if (responseData && Array.isArray(responseData.identities)) {
    return { identities: responseData.identities.map((identity) => parseIdentityDTO(identity)) }
  } else {
    return { identities: [] }
  }
}

export type { IdentitiesResponseDTO }
export { parseIdentitiesResponseDTO }
