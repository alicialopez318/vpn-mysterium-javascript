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

import { ConnectionStatus } from './connection-status'
import { parseConnectionStatusDTO } from './connection-status-dto'

describe('TequilapiClient DTO', () => {
  describe('.parseConnectionStatusDTO', () => {
    // TODO: fix
    xit('sets properties', async () => {
      const connection = parseConnectionStatusDTO({
        status: 'Connected',
        sessionId: 'My-super-session',
      })

      expect(connection.status).toEqual(ConnectionStatus.CONNECTED)
      expect(connection.sessionId).toEqual('My-super-session')
    })

    it('fails when status is missing', () => {
      expect(() => parseConnectionStatusDTO({ sessionId: 'My-super-session' })).toThrow()
    })
  })
})
