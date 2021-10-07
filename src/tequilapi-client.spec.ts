/**
 * Copyright (c) 2020 BlockDev AG
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import MockAdapter from 'axios-mock-adapter'
import { AxiosAdapter } from './http/axios-adapter'
import { TequilapiClient } from './tequilapi-client'
import { parseIdentityRef } from './identity/identity'
import { parseServiceInfo, parseServiceListResponse } from './provider/service-info'
import { TequilapiClientFactory } from './tequilapi-client-factory'
import { parseSessionStats } from './session/session'
import { ServiceStartRequest } from './provider/service-request'

describe('HttpTequilapiClient', () => {
  let api: TequilapiClient
  let mock: MockAdapter

  beforeEach(() => {
    const clientFactory = new TequilapiClientFactory()
    const axios = clientFactory.axiosInstance()
    api = new TequilapiClient(new AxiosAdapter(axios))
    mock = new MockAdapter(axios)
  })

  describe('healthcheck()', () => {
    it('returns response', async () => {
      mock.onGet('healthcheck').reply(200, {
        uptime: '1h10m',
        process: 1111,
        version: '0.0.6',
        build_info: {
          commit: '0bcccc',
          branch: 'master',
          build_number: '001',
        },
      })

      const healthcheck = await api.healthCheck()
      expect(healthcheck).toEqual({
        uptime: '1h10m',
        process: 1111,
        version: '0.0.6',
        buildInfo: {
          commit: '0bcccc',
          branch: 'master',
          buildNumber: '001',
        },
      })
    })

    it('throws error with unexpected response body', () => {
      const response = {
        uptime: '1h10m',
        process: 1111,
        version: {
          commit: '0bcccc',
          branch: 'master',
          build_number: '001',
        },
      }
      mock.onGet('healthcheck').reply(200, response)

      expect(api.healthCheck()).rejects.toEqual(
        new Error(
          'Unable to parse healthcheck response: ' +
            '{"uptime":"1h10m","process":1111,"version":{"commit":"0bcccc","branch":"master","buildNumber":"001"}}'
        )
      )
    })

    it('handles error', () => {
      mock.onGet('/healthcheck').reply(500)

      expect(api.healthCheck()).rejects.toHaveProperty(
        'message',
        'Request failed with status code 500 (path="healthcheck")'
      )
    })
  })

  describe('natStatus()', () => {
    it('returns successful response', async () => {
      const response = {
        status: 'success',
      }
      mock.onGet('nat/status').reply(200, response)

      const status = await api.natStatus()
      expect(status.status).toEqual('success')
      expect(status.error).toBeUndefined()
    })

    it('returns failure response with error', async () => {
      const response = {
        status: 'failure',
        error: 'mock error',
      }
      mock.onGet('nat/status').reply(200, response)

      const status = await api.natStatus()
      expect(status.status).toEqual('failure')
      expect(status.error).toEqual('mock error')
    })

    it('returns error when status is missing', async () => {
      const response = {}
      mock.onGet('nat/status').reply(200, response)

      expect(api.natStatus()).rejects.toHaveProperty(
        'message',
        'NatStatusResponse: status is not provided'
      )
    })

    it('returns error when error has wrong type', async () => {
      const response = {
        status: 'failure',
        error: 5,
      }
      mock.onGet('nat/status').reply(200, response)

      expect(api.natStatus()).rejects.toHaveProperty(
        'message',
        'NatStatusResponse: error should be "string"'
      )
    })
  })

  describe('stop()', () => {
    it('success', async () => {
      const expectedRequest = undefined
      mock.onPost('stop', expectedRequest).reply(200)

      const response = await api.stop()
      expect(response).toBeUndefined()
    })

    it('handles error', () => {
      mock.onPost('stop').reply(500)

      expect(api.stop()).rejects.toHaveProperty(
        'message',
        'Request failed with status code 500 (path="stop")'
      )
    })
  })

  describe('location()', () => {
    it('returns response', async () => {
      const response = {
        ip: '0.0.0.0',
        asn: 8764,
        isp: 'Telia Lietuva, AB',
        continent: 'EU',
        country: 'LT',
        city: 'Vilnius',
        node_type: 'residential',
      }

      mock.onGet('location').reply(200, response)

      const stats = await api.location()
      expect(stats).toEqual({
        ip: '0.0.0.0',
        asn: 8764,
        isp: 'Telia Lietuva, AB',
        continent: 'EU',
        country: 'LT',
        city: 'Vilnius',
        nodeType: 'residential',
      })
    })

    it('handles error', () => {
      mock.onGet('location').reply(500)

      expect(api.location()).rejects.toHaveProperty(
        'message',
        'Request failed with status code 500 (path="location")'
      )
    })
  })

  describe('findProposals()', () => {
    it('returns proposal DTOs', async () => {
      const response = {
        proposals: [
          {
            format: 'service-proposal/v2',
            compatibility: 1,
            provider_id: '0x0',
            service_type: 'openvpn',
            location: {
              asn: '',
              country: 'NL',
            },
            price: {
              currency: 'MYST',
              perMyst: 100,
              perGib: 100,
            },
          },
          {
            format: 'service-proposal/v2',
            compatibility: 1,
            provider_id: '0x1',
            service_type: 'openvpn',
            location: {
              asn: '',
              country: 'LT',
            },
            price: {
              currency: 'MYST',
              perMyst: 100,
              perGib: 100,
            },
          },
        ],
      }
      mock.onGet('proposals').reply(200, response)

      const proposals = await api.findProposals()
      expect(proposals).toHaveLength(2)
      expect(proposals[0]).toEqual({
        compatibility: 1,
        format: 'service-proposal/v2',
        providerId: '0x0',
        serviceType: 'openvpn',
        location: {
          asn: '',
          country: 'NL',
        },
        price: {
          currency: 'MYST',
          perMyst: 100,
          perGib: 100,
        },
      })
      expect(proposals[1]).toEqual({
        compatibility: 1,
        format: 'service-proposal/v2',
        providerId: '0x1',
        serviceType: 'openvpn',
        location: {
          asn: '',
          country: 'LT',
        },
        price: {
          currency: 'MYST',
          perMyst: 100,
          perGib: 100,
        },
      })
    })

    it('handles error', () => {
      mock.onGet('proposals').reply(500)

      expect(api.findProposals()).rejects.toHaveProperty(
        'message',
        'Request failed with status code 500 (path="proposals")'
      )
    })
  })

  describe('identityList()', () => {
    it('returns identity DTOs', async () => {
      const response = {
        identities: [{ id: '0x1000FACE' }, { id: '0x2000FACE' }],
      }
      mock.onGet('identities').reply(200, response)

      const identities = await api.identityList()
      expect(identities).toHaveLength(2)
      expect(identities[0]).toEqual(parseIdentityRef(response.identities[0]))
      expect(identities[1]).toEqual(parseIdentityRef(response.identities[1]))
    })

    it('handles error', () => {
      mock.onGet('identities').reply(500)

      expect(api.identityList()).rejects.toHaveProperty(
        'message',
        'Request failed with status code 500 (path="identities")'
      )
    })
  })

  describe('identityCurrent()', () => {
    it('returns current identity DTO', async () => {
      const response = { id: '0x0000bEEF' }
      mock
        .onPut('identities/current', { id: '0x0000bEEF', passphrase: 'test' })
        .reply(200, response)

      const identity = await api.identityCurrent({ id: '0x0000bEEF', passphrase: 'test' })
      expect(identity).toEqual(parseIdentityRef(response))
    })

    it('handles error', () => {
      mock.onPut('identities/current').reply(500)

      expect(api.identityCurrent({ passphrase: '' })).rejects.toHaveProperty(
        'message',
        'Request failed with status code 500 (path="identities/current")'
      )
    })
  })

  describe('identityCreate()', () => {
    it('create identity', async () => {
      const response = { id: '0x0000bEEF' }
      mock.onPost('identities', { passphrase: 'test' }).reply(200, response)

      const identity = await api.identityCreate('test')
      expect(identity).toEqual(parseIdentityRef(response))
    })

    it('handles error', () => {
      mock.onPost('identities').reply(500)

      expect(api.identityCreate('test')).rejects.toHaveProperty(
        'message',
        'Request failed with status code 500 (path="identities")'
      )
    })
  })

  describe('identityUnlock()', () => {
    it('creates identity', async () => {
      mock.onPut('identities/0x0000bEEF/unlock', { passphrase: 'test' }).reply(200)

      await api.identityUnlock('0x0000bEEF', 'test')
    })

    it('allows specifying custom timeout', async () => {
      mock.onPut('identities/0x0000bEEF/unlock', { passphrase: 'test' }).reply(200)

      await api.identityUnlock('0x0000bEEF', 'test', 10000)
    })

    it('handles error', () => {
      mock.onPut('identities/0x0000bEEF/unlock').reply(500)

      expect(api.identityUnlock('0x0000bEEF', 'test')).rejects.toHaveProperty(
        'message',
        'Request failed with status code 500 (path="identities/0x0000bEEF/unlock")'
      )
    })
  })

  describe('identityRegister()', () => {
    it('registers', async () => {
      mock.onPost('identities/0x0000bEEF/register').reply(202)
      await api.identityRegister('0x0000bEEF')
    })

    it('handles error', () => {
      mock.onPost('identities/0x0000bEEF/register').reply(500)

      expect(api.identityRegister('0x0000bEEF')).rejects.toHaveProperty(
        'message',
        'Request failed with status code 500 (path="identities/0x0000bEEF/register")'
      )
    })
  })

  describe('identityRegistration()', () => {
    it('returns response', async () => {
      const response = {
        status: 'Promoting',
        registered: false,
      }
      mock.onGet('identities/0x0000bEEF/registration').reply(200, response)

      const registration = await api.identityRegistration('0x0000bEEF')
      expect(registration).toEqual(response)
    })

    it('handles error', () => {
      mock.onGet('identities/0x0000bEEF/registration').reply(500)

      expect(api.identityRegistration('0x0000bEEF')).rejects.toHaveProperty(
        'message',
        'Request failed with status code 500 (path="identities/0x0000bEEF/registration")'
      )
    })
  })

  describe('identityBeneficiary()', () => {
    it('returns response', async () => {
      const response = {
        beneficiary: '0x1',
      }
      mock.onGet('identities/0x1/beneficiary').reply(200, response)

      const beneficiary = await api.identityBeneficiary('0x1')
      expect(beneficiary).toEqual(response)
    })

    it('handles error', () => {
      mock.onGet('identities/0x1/beneficiary').reply(500)

      expect(api.identityBeneficiary('0x1')).rejects.toHaveProperty(
        'message',
        'Request failed with status code 500 (path="identities/0x1/beneficiary")'
      )
    })
  })

  describe('authChangePassword()', () => {
    it('succeeds', async () => {
      mock
        .onPut('auth/password', {
          username: 'username',
          old_password: 'pass1234',
          new_password: 'pass5678',
        })
        .reply(200)
      await api.authChangePassword({
        username: 'username',
        oldPassword: 'pass1234',
        newPassword: 'pass5678',
      })
    })
  })

  describe('authLogin()', () => {
    it('succeeds', async () => {
      mock
        .onPost('auth/login', {
          username: 'username',
          password: 'password',
        })
        .reply(200)
      await api.authLogin({
        username: 'username',
        password: 'password',
      })
    })
  })

  describe('connectionCreate()', () => {
    it('returns response', async () => {
      mock
        .onPut('connection', {
          consumer_id: '0x1000FACE',
          provider_id: '0x2000FACE',
          service_type: 'openvpn',
        })
        .reply(200, {
          status: 'Connected',
          session_id: 'My-super-session',
        })

      const status = await api.connectionCreate({
        consumerId: '0x1000FACE',
        providerId: '0x2000FACE',
        serviceType: 'openvpn',
      })
      expect(status).toEqual({
        status: 'Connected',
        sessionId: 'My-super-session',
      })
    })

    it('handles error', () => {
      mock.onPut('connection').reply(500)
      const status = api.connectionCreate({
        consumerId: '0x1000FACE',
        providerId: '0x2000FACE',
        serviceType: 'openvpn',
      })
      expect(status).rejects.toHaveProperty(
        'message',
        'Request failed with status code 500 (path="connection")'
      )
    })
  })

  describe('connectionStatus()', () => {
    it('returns response', async () => {
      const response = {
        status: 'Connected',
        sessionId: 'My-super-session',
      }
      mock.onGet('connection').reply(200, response)

      const connection = await api.connectionStatus()
      expect(connection).toEqual(response)
    })

    it('handles error', () => {
      mock.onGet('connection').reply(500)

      expect(api.connectionStatus()).rejects.toHaveProperty(
        'message',
        'Request failed with status code 500 (path="connection")'
      )
    })
  })

  describe('connectionCancel()', () => {
    it('succeeds', async () => {
      mock.onDelete('connection').reply(200)

      await api.connectionCancel()
    })

    it('handles error', () => {
      mock.onDelete('connection').reply(500)

      expect(api.connectionCancel()).rejects.toHaveProperty(
        'message',
        'Request failed with status code 500 (path="connection")'
      )
    })
  })

  describe('connectionIp()', () => {
    it('returns response', async () => {
      const response = { ip: 'mock ip' }
      mock.onGet('connection/ip').reply(200, response)

      const stats = await api.connectionIp()
      expect(stats).toEqual(response)
    })

    it('handles error', () => {
      mock.onGet('connection/ip').reply(500)

      expect(api.connectionIp()).rejects.toHaveProperty(
        'message',
        'Request failed with status code 500 (path="connection/ip")'
      )
    })
  })

  describe('connectionStatistics()', () => {
    it('returns response', async () => {
      const response = {
        bytesReceived: 1232133, // 1.17505 MB
        bytesSent: 123321, // 0.117608 MB
        throughputSent: 1024, // 1 Mbps
        throughputReceived: 1024, // 1 Mbps
        duration: 13325,
        tokensSpent: 100,
      }
      mock.onGet('connection/statistics').reply(200, response)

      const stats = await api.connectionStatistics()
      expect(stats).toEqual(response)
    })

    it('handles error', () => {
      mock.onGet('connection/statistics').reply(500)

      expect(api.connectionStatistics()).rejects.toHaveProperty(
        'message',
        'Request failed with status code 500 (path="connection/statistics")'
      )
    })
  })

  const serviceObject = {
    id: 'service1',
    providerId: '0x1',
    type: 'openvpn',
    options: {},
    status: 'Starting',
    proposal: {
      compatibility: 0,
      format: 'service-proposal/v2',
      providerId: '0x1',
      serviceType: 'openvpn',
      location: {
        country: 'NL',
      },
      price: {
        currency: 'MYST',
        perMyst: 100,
        perGib: 100,
      },
    },
  }
  const serviceResponse = {
    id: 'service1',
    provider_id: '0x1',
    type: 'openvpn',
    options: {},
    status: 'Starting',
    proposal: {
      compatibility: 0,
      format: 'service-proposal/v2',
      provider_id: '0x1',
      service_type: 'openvpn',
      location: {
        country: 'NL',
      },
      price: {
        currency: 'MYST',
        perMyst: 100,
        perGib: 100,
      },
    },
  }
  describe('serviceList()', () => {
    it('returns response', async () => {
      mock.onGet('services').reply(200, [serviceResponse])

      const services = await api.serviceList()
      expect(services).toEqual(parseServiceListResponse([serviceObject]))
    })

    it('handles error', () => {
      mock.onGet('services').reply(500)

      expect(api.serviceList()).rejects.toHaveProperty(
        'message',
        'Request failed with status code 500 (path="services")'
      )
    })
  })

  describe('serviceGet()', () => {
    it('returns response', async () => {
      mock.onGet('services/service1').reply(200, serviceResponse)

      const service = await api.serviceGet('service1')
      expect(service).toEqual(parseServiceInfo(serviceObject))
    })

    it('handles error', () => {
      mock.onGet('services/service1').reply(500)

      expect(api.serviceGet('service1')).rejects.toHaveProperty(
        'message',
        'Request failed with status code 500 (path="services/service1")'
      )
    })
  })

  describe('serviceStart()', () => {
    it('returns response', async () => {
      mock
        .onPost('services', {
          provider_id: '0x2000FACE',
          type: 'openvpn',
          access_policies: {
            ids: ['mysterium-verified'],
          },
          price: {
            currency: 'MYST',
            per_hour: 1000,
            per_gib: 2000,
          },
        })
        .reply(200, serviceResponse)

      const request: ServiceStartRequest = {
        providerId: '0x2000FACE',
        type: 'openvpn',
        price: {
          currency: 'MYST',
          perHour: 1000,
          perGib: 2000,
        },
        accessPolicies: { ids: ['mysterium-verified'] },
      }
      const response = await api.serviceStart(request)
      expect(response).toEqual(serviceObject)
    })

    it('handles error', () => {
      mock.onPost('services').reply(500)

      const request = {
        providerId: '0x2000FACE',
        type: 'openvpn',
        price: { currency: 'MYST', perHour: 2000, perGib: 1000 },
      }
      expect(api.serviceStart(request)).rejects.toHaveProperty(
        'message',
        'Request failed with status code 500 (path="services")'
      )
    })
  })

  describe('serviceStop()', () => {
    it('succeeds', async () => {
      const expectedRequest = undefined
      mock.onDelete('services/service1', expectedRequest).reply(202)

      await api.serviceStop('service1')
    })

    it('handles error', () => {
      mock.onDelete('services/service1').reply(500)

      expect(api.serviceStop('service1')).rejects.toHaveProperty(
        'message',
        'Request failed with status code 500 (path="services/service1")'
      )
    })
  })

  describe('sessions()', () => {
    it('returns response', async () => {
      const response = {
        items: [
          {
            id: '30f610a0-c096-11e8-b371-ebde26989839',
            direction: 'Provided',
            consumer_id: '0x1000FACE',
            hermes_id: '',
            provider_id: '',
            service_type: '',
            provider_country: '',
            consumer_country: '',
            created_at: '2019-01-01 00:00:00',
            duration: 59,
            bytes_sent: 1000,
            bytes_received: 100,
            tokens: 1000,
            status: 'New',
          },
        ],
        page: 1,
        pageSize: 50,
        totalItems: 1,
        totalPages: 1,
      }
      mock.onGet('sessions').reply(200, response)

      const sessions = (await api.sessions()).items
      expect(sessions).toHaveLength(1)
      expect(sessions[0].id).toEqual('30f610a0-c096-11e8-b371-ebde26989839')
      expect(sessions[0].tokens).toEqual(1000)
    })

    it('handles error', () => {
      mock.onGet('sessions').reply(500)

      expect(api.sessions()).rejects.toHaveProperty(
        'message',
        'Request failed with status code 500 (path="sessions")'
      )
    })
  })

  describe('sessionStatsAggregated()', () => {
    it('returns response', async () => {
      const responseMock = {
        stats: {
          count: 1,
          countConsumers: 2,
          sumBytesReceived: 3,
          sumBytesSent: 4,
          sumDuration: 5,
          sumTokens: 6,
        },
      }
      mock.onGet('sessions/stats-aggregated').reply(200, responseMock)

      const response = await api.sessionStatsAggregated()
      expect(response.stats).toEqual(parseSessionStats(responseMock.stats))
    })

    it('handles error', () => {
      mock.onGet('sessions/stats-aggregated').reply(500)

      expect(api.sessionStatsAggregated()).rejects.toHaveProperty(
        'message',
        'Request failed with status code 500 (path="sessions/stats-aggregated")'
      )
    })
  })

  describe('sessionStatsDaily()', () => {
    it('returns response', async () => {
      const responseMock = {
        items: {
          ['2020-09-02']: {
            count: 1,
            countConsumers: 2,
            sumBytesReceived: 3,
            sumBytesSent: 4,
            sumDuration: 5,
            sumTokens: 6,
          },
        },
        stats: {
          count: 1,
          countConsumers: 2,
          sumBytesReceived: 3,
          sumBytesSent: 4,
          sumDuration: 5,
          sumTokens: 6,
        },
      }
      mock.onGet('sessions/stats-daily').reply(200, responseMock)

      const response = await api.sessionStatsDaily()
      expect(response.items).toEqual({
        '20200902': parseSessionStats(responseMock.items['2020-09-02']),
      })
      expect(response.stats).toEqual(parseSessionStats(responseMock.stats))
    })

    it('handles error', () => {
      mock.onGet('sessions/stats-daily').reply(500)

      expect(api.sessionStatsDaily()).rejects.toHaveProperty(
        'message',
        'Request failed with status code 500 (path="sessions/stats-daily")'
      )
    })
  })

  describe('accessPolicies()', () => {
    it('returns response', async () => {
      const response = {
        entries: [
          {
            id: 'mysterium',
            title: 'mysterium verified',
            description: 'Mysterium Network approved identities',
            allow: [
              {
                type: 'identity',
                value: '0x123',
              },
            ],
          },
          {
            id: 'mysterium #2',
            title: 'mysterium verified #2',
            description: 'Mysterium Network approved identities #2',
            allow: [
              {
                type: 'identity',
                value: '0x123',
              },
            ],
          },
        ],
      }

      mock.onGet('access-policies').reply(200, response)

      const sessions = await api.accessPolicies()
      expect(sessions).toHaveLength(2)
      expect(sessions[0].id).toEqual('mysterium')
    })

    it('handles error', () => {
      mock.onGet('access-policies').reply(500)

      expect(api.accessPolicies()).rejects.toHaveProperty(
        'message',
        'Request failed with status code 500 (path="access-policies")'
      )
    })
  })

  describe('userConfig()', () => {
    it('returns raw response', async () => {
      mock.onGet('config/user').reply(200, {
        data: {
          'access-policy': {
            list: 'mysterium',
          },
          openvpn: {
            port: 9000,
          },
        },
      })

      const config = await api.userConfig()
      expect(config.data['access-policy'].list).toEqual('mysterium')
      expect(config.data.openvpn.port).toEqual(9000)
    })

    it('sends raw config on save', async () => {
      mock.onPost('config/user', { data: { 'dashes-and_underscores': true } }).reply(200, {
        data: {
          'dashes-and_underscores': true,
          'access-policy': {
            list: 'mysterium',
          },
          openvpn: {
            port: 9000,
          },
        },
      })

      const res = await api.updateUserConfig({
        data: {
          'dashes-and_underscores': true,
        },
      })
      expect(res.data['dashes-and_underscores']).toEqual(true)
    })
  })
  describe('paymentGateways()', () => {
    it('send payment gateways', async () => {
      mock.onGet('v2/payment-order-gateways').reply(200, [
        {
          currencies: ['BTC', 'BCH', 'DAI', 'ETH', 'LTC', 'USDT', 'MYST', 'DOGE'],
          name: 'coingate',
          order_options: {
            minimum: 10.7,
            suggested: [20, 40, 90, 120, 150, 240],
          },
        },
        {
          currencies: ['EUR', 'USD', 'GBP'],
          name: 'cardinity',
          order_options: {
            minimum: 2.15,
            suggested: [10, 20, 45, 60, 75, 120],
          },
        },
      ])
      const res = await api.payment.gateways()
      expect(res).toHaveLength(2)
    })
  })
})
