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

import { ConnectionIPDTO, parseConnectionIPDTO } from '../../../src/dto/connection-ip'

describe('TequilapiClient DTO', () => {
  describe('.parseConnectionIPDTO', () => {
    it('sets properties', async () => {
      const model: ConnectionIPDTO = parseConnectionIPDTO({ ip: 'mock ip' })

      expect(model.ip).toEqual('mock ip')
    })

    it('sets empty properties', async () => {
      const model: ConnectionIPDTO = parseConnectionIPDTO({})

      expect(model.ip).toBeUndefined()
    })
  })
})
