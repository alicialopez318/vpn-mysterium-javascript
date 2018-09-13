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

import IdentityDTO from '../../../src/dto/identity'

describe('TequilapiClient DTO', () => {
  describe('IdentityDTO', () => {
    it('sets properties', async () => {
      const identity = new IdentityDTO({
        id: '0xF000FACE'
      })

      expect(identity.id).to.equal('0xF000FACE')
    })

    it('sets empty properties', async () => {
      const identity = new IdentityDTO({})

      expect(identity.id).to.be.undefined
    })

    it('sets wrong properties', async () => {
      const identity = new IdentityDTO('I am wrong')

      expect(identity.id).to.be.undefined
    })
  })
})
