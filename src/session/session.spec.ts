/**
 * Copyright (c) 2020 BlockDev AG
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { parseSession, parseSessionResponse } from './session'

describe('TequilapiClient DTO', () => {
  const sessionData = {
    id: 'id1',
    direction: 'Provided',
    consumerId: '0x1',
    hermesId: '0x2',
    providerId: '0x3',
    serviceType: 'openvpn',
    providerCountry: 'MU',
    createdAt: '2019-01-01',
    duration: 59,
    bytesSent: 10,
    bytesReceived: 11,
    tokens: 4_000,
    status: 'New',
  }

  const pagination = {
    totalItems: 1,
    totalPages: 1,
    currentPage: 1,
    previousPage: null,
    nextPage: null,
  }

  const stats = {
    count: 1,
    countConsumers: 2,
    sumBytesReceived: 3,
    sumBytesSent: 4,
    sumDuration: 5,
    sumTokens: 6,
  }

  const statDaily = {
    ['2020-09-02']: {
      count: 1,
      countConsumers: 2,
      sumBytesReceived: 3,
      sumBytesSent: 4,
      sumDuration: 5,
      sumTokens: 6,
    },
  }

  describe('.parseSession', () => {
    const sessionObject = parseSession(sessionData)

    it('sets properties', async () => {
      expect(sessionObject.id).toEqual('id1')
      expect(sessionObject.consumerId).toEqual('0x1')
    })

    it('throws error with null data', () => {
      expect(() => parseSession(null)).toThrowError()
    })

    it('throws error with missing id', () => {
      const object = { ...sessionData, id: undefined }
      expect(() => parseSession(object)).toThrowError('Session: id is not provided')
    })

    it('throws error with missing consumerId', () => {
      const object = { ...sessionData, consumerId: undefined }
      expect(() => parseSession(object)).toThrowError('Session: consumerId is not provided')
    })
  })

  describe('.parseSessionList', () => {
    it('sets properties with full structure', async () => {
      const response = parseSessionResponse({
        sessions: [sessionData],
        paging: pagination,
        stats: stats,
        statsDaily: statDaily,
      })

      expect(response.sessions).toHaveLength(1)
      expect(response.sessions[0].id).toEqual('id1')
      expect(response.sessions[0].consumerId).toEqual('0x1')

      expect(response.stats.count).toEqual(1)
      expect(response.stats.countConsumers).toEqual(2)
      expect(response.stats.sumBytesReceived).toEqual(3)
      expect(response.stats.sumBytesSent).toEqual(4)
      expect(response.stats.sumDuration).toEqual(5)
      expect(response.stats.sumTokens).toEqual(6)

      const statsDailyKeys = Object.keys(response.statsDaily)
      expect(statsDailyKeys).toHaveLength(1)

      const dailyStat = response.statsDaily[statsDailyKeys[0]]
      expect(dailyStat.count).toEqual(1)
      expect(dailyStat.countConsumers).toEqual(2)
      expect(dailyStat.sumBytesReceived).toEqual(3)
      expect(dailyStat.sumBytesSent).toEqual(4)
      expect(dailyStat.sumDuration).toEqual(5)
      expect(dailyStat.sumTokens).toEqual(6)

      expect(response.paging.totalItems).toEqual(1)
      expect(response.paging.totalPages).toEqual(1)
      expect(response.paging.currentPage).toEqual(1)
      expect(response.paging.previousPage).toBeNull()
      expect(response.paging.nextPage).toBeNull()
    })

    it('throws error when invoked with an empty object', async () => {
      expect(() => {
        parseSessionResponse({})
      }).toThrowError('Session[]: sessions is not provided')
    })

    it('throws an error if proposal in array does not validate', async () => {
      expect(() => {
        parseSessionResponse({
          sessions: [{}],
          paging: pagination,
          stats: stats,
          statsDaily: statDaily,
        })
      }).toThrowError('Session: id is not provided')
    })
  })
})
